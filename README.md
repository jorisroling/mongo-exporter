Mongo Exporter
==============

Export and import all your Mongo data.

It can export all the collections and the dictionary.

When importing it will remove all documents stored.

The ids of the documents will be kept.

### Installing

```
meteor add jorisroling:mongo-exporter
```

By default the tab is not shown, but you can navigate to ```/export```.

If you wan't to make the tab visible, call:

```js
Options.set('showExportTab', true);
```

#### Security

Mongo Exportes uses [```nicolaslopezj:roles```](http://github.com/nicolaslopezj/roles) to secure the import and export. The name of the action is ```jorisroling.mongoExport```.
