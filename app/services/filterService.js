app.factory('filterService', function () {

  var global = {};

  global.getFilterTypes = function(){
    return[{
      dataType:"Boolean",
      relatedTo:null,
      filters:["equalTo","notEqualTo","exists","doesNotExists"]
    },{
      dataType:"List",
      relatedTo:"Boolean",
      filters:["containedIn","containsAll","notContainedIn"]
    },{
      dataType:"Text",
      relatedTo:null,
      filters:["equalTo","notEqualTo","exists","doesNotExists","startsWith"]
    },{
      dataType:"List",
      relatedTo:"Text",
      filters:["containedIn","containsAll","notContainedIn"]
    },{
      dataType:"Email",
      relatedTo:null,
      filters:["equalTo","notEqualTo","exists","doesNotExists","startsWith"]
    },{
      dataType:"List",
      relatedTo:"Email",
      filters:["containedIn","containsAll","notContainedIn"]
    },{
      dataType:"URL",
      relatedTo:null,
      filters:["equalTo","notEqualTo","exists","doesNotExists"]
    },{
      dataType:"List",
      relatedTo:"URL",
      filters:["containedIn","containsAll","notContainedIn"]
    },{
      dataType:"EncryptedText",
      relatedTo:null,
      filters:["equalTo","notEqualTo","exists","doesNotExists"]
    },{
      dataType:"List",
      relatedTo:"EncryptedText",
      filters:["containedIn","containsAll","notContainedIn"]
    },{
      dataType:"DateTime",
      relatedTo:null,
      filters:["equalTo","notEqualTo","exists","doesNotExists","greaterThan","greaterThanEqualTo","lessThan","lessThanEqualTo"]
    },{
      dataType:"List",
      relatedTo:"DateTime",
      filters:["containedIn","containsAll","notContainedIn"]
    },{
      dataType:"GeoPoint",
      relatedTo:null,
      filters:["near","geoWithin"]
    },{
      dataType:"Object",
      relatedTo:null,
      filters:["exists","doesNotExists"]
    },{
      dataType:"File",
      relatedTo:null,
      filters:["exists","doesNotExists"]
    }];

  };

  return global;

});
