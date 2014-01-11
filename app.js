
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// configure azure
var nconf = require('nconf');
nconf.env().defaults({
    "AZURE_STORAGE_ACCOUNT": "defaultstorageacct5359",
    "AZURE_STORAGE_ACCESS_KEY": "Qkss+PDZhXsOZzt9KHk1hbtHalGymQWewHQYDEPxwqC2xe2E1QDVCWfqzfQpngVg/Nt5jqUmEx9TTsdeTFjQQQ=="
});

var azure = require('azure');
var storageAccount = nconf.get("AZURE_STORAGE_ACCOUNT");
var storageKey = nconf.get("AZURE_STORAGE_ACCESS_KEY");
var tableService = azure.createTableService(storageAccount, storageKey);
tableService.createTableIfNotExists('people', function(error){
    if (!error)
    {
        // table exists or was created
    }
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/api/test', function(req, res) {
    res.json({"id": 2, "name": "something"});
});
app.post('/api/test', function(req, res) {
    console.log(req.body);
});
app.get('/api/person/:id', function(req, res){
    tableService.queryEntity('people', 'all', req.params.id,
        function(error, entity){
            if (error) { throw error; }
            res.json({
                "id": entity.RowKey,
                "name": entity.Name
            });
        });
});
app.post('/api/person', function(req, res){
    var person = {
        PartitionKey: "all",
        RowKey: req.body.id,
        Name: req.body.name
    };
    tableService.insertEntity('people', person, function(error){
        if (error) { throw error; }
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
