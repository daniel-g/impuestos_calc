var fs = require('fs'),
    xml2js = require('xml2js'),
    inspect = require('eyes').inspector({
      maxLength: 2048 * 4
    }),
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

// Add the route
server.route({
  method: 'GET',
  path:'/',
  handler: function (request, reply) {
    var parser = new xml2js.Parser(),
        filename = '/data/Nov2014/E06968_GG11961_GAVD8609068Y9.xml';
    fs.readFile(__dirname + filename, function(err, data) {
      parser.parseString(data, function (err, result) {
        // attrKey = $
        inspect(result['cfdi:Comprobante']['$']);
        console.log('Done');
      });
    });
    reply.view('layout');
  }
});

// Start the server
server.start();
