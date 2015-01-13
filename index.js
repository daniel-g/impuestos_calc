var fs = require('fs'),
    glob = require("glob"),
    xml2js = require('xml2js'),
    inspect = require('eyes').inspector({
      maxLength: 2048 * 4
    }),
    Q = require('q'),
    Hapi = require('hapi');

// Create a server with a host and port
var server = new Hapi.Server();
server.views({
  engines: { jade: require('jade') },
  relativeTo: __dirname,
  path: './views',
  layoutPath: './views/layout'
});

server.connection({
  host: 'localhost',
  port: 8000
});

function getTotal(filename){
  var deferred = Q.defer(),
      parser = new xml2js.Parser();
  fs.readFile(filename, function(err, data) {
    parser.parseString(data, function (err, result) {
      deferred.resolve(parseFloat(result['cfdi:Comprobante']['$']['total']));
    });
  });
  return deferred.promise;
};

function calculateTotal(directory){
  var deferred = Q.defer(),
      grandTotal = 0,
      promises = [];
  glob(directory, {}, function(er, files){
    files.forEach(function(filename){
      promises.push(getTotal(filename));
    });
    Q.allSettled(promises).then(function(results){
      results.forEach(function (result) {
        if (result.state === "fulfilled") {
          grandTotal += result.value;
        } else {
          var reason = result.reason;
        }
      });
      deferred.resolve(grandTotal);
    });
  });
  return deferred.promise;
};


// Add the route
server.route({
  method: 'GET',
  path:'/',
  handler: function (request, reply) {
    calculateTotal('./data/Nov2014/**/*.xml').then(function(total){
      reply.view('layout', { total: total });
    });
  }
});

// Start the server
server.start();
