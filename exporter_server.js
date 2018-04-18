const child_process = Npm.require('child_process');

const debug = yves.debugger('mongo:export')


const fs = Npm.require('fs')
const os = Npm.require('os')
const url = Npm.require('url')
const path = Npm.require('path')

function mongo_values() {
  let mongo
  if (process.env.MONGO_HOST && process.env.MONGO_PORT && process.env.MONGO_DB) {
    mongo={
      host: process.env.MONGO_HOST,
      port: process.env.MONGO_PORT,
      db: process.env.MONGO_DB,
    }
  } else if (process.env.MONGO_URL) {
    const urlParse = url.parse(process.env.MONGO_URL)
    mongo={
      host: urlParse.hostname,
      port: urlParse.port,
      db: urlParse.pathname ? path.basename(urlParse.pathname) : 'meteor',
    }
  } else {
    mongo={
      host: 'localhost',
      port: 3001,
      db: 'meteor',
    }
  }    
  return mongo;
}


import { WebApp } from 'meteor/webapp';

WebApp.connectHandlers.use((req, res, next) => {
  const params = req.url.match(/\/admin\/mongo-export\/([\w-]*)/)
  if (!params) return next();
  params.shift()
// Picker.route('/admin/mongo-export/:key', function(params, req, res, next) {
  
  var userId = Roles.keys.getUserId(params[0]);
  if (!userId || !Roles.userHasPermission(userId, 'jorisroling.mongoExport')) {
    throw new Meteor.Error('unauthorized', 'The user is not authorized to perform this action');
  }

  res.setHeader('Content-Disposition', 'attachment; filename=' + (Meteor.settings.public.name ? Meteor.settings.public.name : 'mongoExport') + '.archive');
  res.setHeader('Pragma', 'public');
  res.setHeader('Expires', '0');
  res.setHeader('Cache-Control', 'must-revalidate, post-check=0, pre-check=0');
  res.setHeader('Cache-Control', 'public');
  res.setHeader('Content-Description', 'File Transfer');
  res.setHeader('Content-type', 'application/octet-stream');
  res.setHeader('Content-Transfer-Encoding', 'binary');

  const mongo=mongo_values()
  const cmd = Assets.absoluteFilePath(`bin/${os.platform()}/mongodump`)
  child_process.spawn('chmod', ['+x',cmd]);

  // debug('%y %y', 'chmod', ['+x',cmd])

  let args = ['--host='+mongo.host, '--port='+mongo.port, '--db='+mongo.db, '--gzip', '--archive'] 
  
  let pattern=orion.config.get('Mongo Exclude Pattern')
  if (pattern) {
    const parts=pattern.split(',')
    if (parts && parts.length) {
      for (let p in parts) {
        if (parts[p].trim()) {
          args.push('--excludeCollection='+parts[p].trim())
        }
      }
    }
  }  
  
  debug('%y %y', cmd, args)
  var child = child_process.spawn(cmd, args);
  child.stdout.pipe(res);
});





WebApp.connectHandlers.use((req, res, next) => {
  const params = req.url.match(/\/admin\/mongo-verify\/([\w-]*)/)
  if (!params) return next();
  params.shift()
// Picker.route('/admin/mongo-verify/:key', function(params, req, res, next) {
  var userId = Roles.keys.getUserId(params[0]);
  if (!userId ||  !Roles.userHasPermission(userId, 'jorisroling.mongoExport')) {
    throw new Meteor.Error('unauthorized', 'The user is not authorized to perform this action');
  }

  const Users = 0;//Mongo.Collection.get('users')
  const userRecord = (Users ? Users.find({_id:userId}).fetch() : null)
  debug('user %y', userRecord)

  const mongo=mongo_values()

  const cmd = Assets.absoluteFilePath(`bin/${os.platform()}/mongorestore`)
  child_process.spawn('chmod', ['+x',cmd]);

  // debug('%y %y', 'chmod', ['+x',cmd])

  const args = ['--host='+mongo.host, '--port='+mongo.port, '--nsInclude='+mongo.db+'.*', '--dryRun', '--drop', '--gzip', '--archive']

  let pattern=orion.config.get('Mongo Exclude Pattern')
  if (pattern) {
    const parts=pattern.split(',')
    if (parts && parts.length) {
      for (let p in parts) {
        if (parts[p].trim()) {
          args.push('--nsExclude='+parts[p].trim())
        }
      }
    }
  }  

  debug('%y %y', cmd, args)
  var child = child_process.spawn(cmd, args/*, { stdio: ['pipe', null, null, null] }*/);

  // child.stdout.on('data', function(data) {
  //   debug('data %y',data)
  // })
  //

  child.stdout.on('data', Meteor.bindEnvironment(function(data) {
    // console.log(data);
  }));
  child.stdout.pipe(process.stdout);
  
  child.stdin.on('error', Meteor.bindEnvironment(function(error) {
    console.error(error)
    res.end('ERROR'); //end the respone
  }));
  child.stdin.on('finish', Meteor.bindEnvironment(function() {
    debug('finish...')
    if (Users && userRecord && userRecord.length == 1) {
      // const Users = Mongo.Collection.get('users')
      Users.update({_id:userId},{$set: userRecord[0] },function(err,data) {
        debug('finish2...%y %y',err,data)
        res.end('OK'); //end the respone
      })
    } else {
      res.end('OK'); //end the respone
    }
  }));
    
  req.pipe(child.stdin);
  
});



WebApp.connectHandlers.use((req, res, next) => {
  const params = req.url.match(/\/admin\/mongo-import\/([\w-]*)/)
  if (!params) return next();
  params.shift()
//Picker.route('/admin/mongo-import/:key', function(params, req, res, next) {
  var userId = Roles.keys.getUserId(params[0]);
  if (!userId ||  !Roles.userHasPermission(userId, 'jorisroling.mongoExport')) {
    throw new Meteor.Error('unauthorized', 'The user is not authorized to perform this action');
  }

  const Users = 0;//Mongo.Collection.get('users')
  const userRecord = (Users ? Users.find({_id:userId}).fetch() : null)
  debug('user %y', userRecord)

  const mongo=mongo_values()
  const cmd = Assets.absoluteFilePath(`bin/${os.platform()}/mongorestore`)
  child_process.spawn('chmod', ['+x',cmd]);

  const args = ['--host='+mongo.host, '--port='+mongo.port, '--nsInclude='+mongo.db+'.*', '--drop', '--gzip', '--archive']
  debug('%y %y', cmd, args)
  var child = child_process.spawn(cmd, args);

  child.stdin.on('error', function(error) {
    console.error(error)
    res.end('ERROR'); //end the respone
  });
  child.stdin.on('finish', Meteor.bindEnvironment(function() {
    debug('finish...')
    if (Users && userRecord && userRecord.length == 1) {
      // const Users = Mongo.Collection.get('users')
      Users.update({_id:userId},{$set: userRecord[0] },function(err,data) {
        debug('finish2...%y %y',err,data)
        res.end('OK'); //end the respone
      })
    } else {
      res.end('OK'); //end the respone
    }
  }));
    
  req.pipe(child.stdin);
  
});
