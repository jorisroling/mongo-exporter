/**
 * Register the link
 */
Tracker.autorun(function() {
  var index = Options.get('showExportTab') ? 110 : undefined; // null to hide from the tabs
  orion.links.add({
    index: index,
    identifier: 'orion-export',
    title: 'Export / Import',
    routeName: 'jorisroling.mongoExport',
    activeRouteRegex: 'jorisroling.mongoExport',
    permission: 'jorisroling.mongoExport'
  });
});


ReactiveTemplates.onRendered('mongoExport', function() {
  Session.set('mongoExport_error', null);
  Session.set('mongoExport_isLoading', false);
});

ReactiveTemplates.helpers('mongoExport', {
  currentError: function() {
    return Session.get('mongoExport_error');
  },
  isVerifying: function() {
    return Session.get('mongoExport_isVerifying');
  },
  isLoading: function() {
    return Session.get('mongoExport_isLoading');
  },
  key() {
    return Roles.keys.request(Meteor.userId());
  }
});

ReactiveTemplates.events('mongoExport', {
  'click .btn-export': function(event, template) {
    event.preventDefault();
    var key = Roles.keys.request(Meteor.userId());
    var url = '/admin/mongo-export/' + key;
    window.location = url;
  },
  'change .input-verify': function(event, template) {
    Session.set('mongoExport_isVerifying', true);
    var key = Roles.keys.request(Meteor.userId());
    var url = '/admin/mongo-verify/' + key;
    var file = event.currentTarget.files[0];

    if (file) {
      var xhr = new XMLHttpRequest(); 
      xhr.open('POST', url, true);

      xhr.onload = function () {
          // do something to response
          // console.log(this.responseText);
      };
      
      xhr.onreadystatechange = function() {//Call a function when the state changes.
          if (xhr.readyState == 4 && xhr.status == 200) {
              // alert(http.responseText);
              Session.set('orionExport_isLoading', false);
          }
          
          // console.log('xhr.readyState: %d  xhr.status: %d',xhr.readyState,xhr.status)
      }
      
      xhr.send(file);
      
      
    }
  },
  'change .input-import': function(event, template) {
    Session.set('mongoExport_isLoading', true);
    var key = Roles.keys.request(Meteor.userId());
    var url = '/admin/mongo-import/' + key;
    var file = event.currentTarget.files[0];

    if (file) {
      var xhr = new XMLHttpRequest(); 
      xhr.open('POST', url, true);

      xhr.send(file); 
    }
  },
});
