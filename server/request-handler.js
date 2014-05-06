/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var qs = require('querystring');
var url = require('url');
var fs = require('fs');

var messages = {results: []};

var storeMessage = function(data) {
  var temp = JSON.parse(data);
  console.log("This is temp: "+ temp + " ...");
  temp.createdAt = new Date();

  fs.appendFile('messages.txt', JSON.stringify(temp) + ',', function (err) {
    if (err) throw err;
  });

};

var readMessages = function (response) {
  fs.readFile('messages.txt', "utf-8", function (err, data){
    if (err) throw err;
    messages.results = JSON.parse('[' + data.slice(0, data.length - 1) + ']');
    // console.dir(data);
    // console.dir(messages);
    return response.end(JSON.stringify(messages));
  });
};

var handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  console.log("Serving request type " + request.method + " for url " + request.url);
  var statusCode;
  var body = '';

  var pathname = url.parse(request.url).pathname;

  if (pathname.slice(0, 8) !== '/classes') {
    statusCode = 404;
  } else {
    if(request.method==='POST'){
      statusCode = 201;
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        // var POST = qs.parse(body);
        storeMessage(body);
      });
    }else if(request.method === 'GET'){
      statusCode = 200;
    }else if(request.method === 'OPTIONS'){
      statusCode = 200;
    }else{
      statusCode = 400;
    }
  }


  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";

  /* .writeHead() tells our server what HTTP status code to send back */
  response.writeHead(statusCode, headers);

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  // response.write(messages);
  readMessages(response);
};



/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.handleRequest = handleRequest;
