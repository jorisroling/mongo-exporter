Package.describe({
  name: 'jorisroling:mongo-exporter',
  summary: 'Export and import all your Orion data',
  version: '1.0.9',
  git: 'https://github.com/jorisroling/mongo-exporter'
});

// Npm.depends({
// });

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use(['blaze-html-templates@1.1.2',
    'ecmascript@0.10.7', 'orionjs:base@1.8.0', 'orionjs:dictionary@1.8.0', 'orionjs:collections@1.8.0', 'nicolaslopezj:roles@2.6.4', 'http', /*'matb33:collection-hooks@0.8.1',*/
    'jorisroling:yves@1.0.47'
  ]);

  api.use(['orionjs:bootstrap@1.8.0', /*'orionjs:materialize@1.4.0', 'orionjs:pages@1.4.0',*/ 'aldeed:simple-schema@1.5.4'/*, 'matb33:collection-hooks@0.8.1'*/], 'client', {
    weak: true
  });

  api.addFiles('exporter.js');
  api.addFiles('exporter_server.js', 'server');

  api.addAssets('bin/darwin/mongodump', 'server');
  api.addAssets('bin/darwin/mongorestore', 'server');
  api.addAssets('bin/linux/mongodump', 'server');
  api.addAssets('bin/linux/mongorestore', 'server');
  
  api.addFiles(['exporter_bootstrap.html', 'exporter_materialize.html', 'exporter_client.js'], 'client');
});
