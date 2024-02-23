// Create web server

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

// Send 404 error
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

// Send file data
function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// Serve static files
function serveStatic(response, cache, absPath) {
  // Check if file is cached in memory
  if (cache[absPath]) {
    // Serve file from memory
    sendFile(response, absPath, cache[absPath]);
  } else {
    // Check if file exists
    fs.exists(absPath, function(exists) {
      if (exists) {
        // Read file from disk
        fs.readFile(absPath, function(err, data) {
          if (err) {
            // Send 404 error
            send404(response);
          } else {
            // Cache file in memory and serve
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        // Send 404 error
        send404(response);
      }
    });
  }
}

// Create HTTP server
var server = http.createServer(function(request, response) {
  var filePath = false;

  // Determine HTML file to be served by default
  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }

  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

// Start HTTP server
server.listen(3000, function() {
  console.log("Server listening on port 3000.");
});

// Set up socket.io server
var chatServer = require('./lib/chat_server');
chatServer.listen(server);