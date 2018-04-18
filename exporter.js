Options.init('showExportTab', false);
Options.init('dontImportCollections', []);
Options.init('extraCollections', []);
exportPages = _.has(Package, 'orionjs:pages');
collections = [];

orion.collections.onCreated(function (collection) {
  collections.push(this);
});

if (exportPages) {
  pages = orion.pages.collection;
}

/**
 * Init the template name variable
 */
ReactiveTemplates.request('mongoExport', 'jorisroling_mongoExporter_bootstrap');

if (_.has(Package, 'orionjs:materialize')) {
  ReactiveTemplates.set('mongoExport', 'jorisroling_mongoExporter_materialize');
}

/**
 * Init the role action
 */
Roles.registerAction('jorisroling.mongoExport', true);

/**
 * Register the route
 */
RouterLayer.route('/admin/export', {
  layout: 'layout',
  template: 'mongoExport',
  name: 'jorisroling.mongoExport',
  reactiveTemplates: true,
});

/**
 * Ensure user is logged in
 */
orion.accounts.addProtectedRoute('jorisroling.mongoExport');
