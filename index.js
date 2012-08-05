/*
@author: Plazmer (praw2003@gmail.com)
used ideas from https://github.com/chrisirhc/node-mjpeg-proxy
*/

// urls: http://localhost:options.port/cam0.mjpg

var http = require('http'),
    fs = require('fs');

var options = {};
/* configuration */
options.home = 'www/'; //files for flash & others
options.port = 5080; //port for server

//TODO: избавиться от констант
var camz =[
  {
  url: 'http://***:*/axis-cgi/mjpg/video.cgi?resolution=640x480&camera=1&compression=55',
  onRequest: function(srcResponse) {responseHandler(srcResponse, 0);},
  clients:[]
  },

  {
  url: 'http://***:*/axis-cgi/mjpg/video.cgi?resolution=640x480&camera=1&compression=55',
  onRequest: function(srcResponse) {responseHandler(srcResponse, 1);},
  clients:[]
  }
];

/* /configuration */

/* send files from router() */

var extTypes = {
   "gif" : "image/gif"
  , "htm" : "text/html"
  , "html" : "text/html"
  , "jpeg" : "image/jpeg"
  , "jpg" : "image/jpeg"
  , "js" : "application/javascript"
  , "mjpg" : "video/mpeg"
  , "swf" : "application/x-shockwave-flash"
  , "xml" : "application/xml"
}

function getContentType(path) {
    var i = path.lastIndexOf('.');
    var ext = (i < 0) ? '' : path.substr(i+1);
    console.log(path+'/'+ext);
    return extTypes[ext.toLowerCase()] || 'application/octet-stream';
}

function sendFile(url, res, ctype)
{
  fs.readFile(options.home+url, function (err, data)
    {
      if (err)
      {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not found: "+url);
        res.end();
      } else {
        var ctype = getContentType(url);
        console.log(ctype);
        console.log(url);
        res.writeHead(200, {"Content-Type": ctype});
        res.write(data);
        res.end();
      }
    }
  );
}

/* on MJPEG server response, saves headers for clients */
function responseHandler(srcResponse, numer)
{
  camz[numer].headers = srcResponse.headers;
  srcResponse.on('data', function(chunk) {dataHandler(chunk, numer)});
}

/* on receive MJPEG server packet - send all clients, who request for this cam */
function dataHandler(chunk, numer)
{
  var i;
  for (i = camz[numer].clients.length; i--;) {
    camz[numer].clients[i].write(chunk, 'binary');
  }
}

/* parse client request, send files, or add to queue on receive MJPEG data */
function router(req, res)
{
  /* parse cam ID */
  var reg = /cam(\d*)\.mjpg/; //url: /cam1.mjpg
  var tmpNum = reg.exec(req.url);
  var camNum = -1;
  if (tmpNum)
  {
    camNum = tmpNum[1];
    if (camz[camNum] == undefined)
    {
      camNum = -1; //if cam in array not exists
    }
  }
  /* /parse cam ID */

  if (camNum > -1) //TODO: beautify check
  {
    camz[camNum].clients.push(res);
    res.writeHead(200, camz[camNum].headers);

    res.socket.on('close', function ()
      {
        camz[camNum].clients.splice(camz[camNum].clients.indexOf(res), 1);
      }
    );

  } else {
    /*    clean request */
    var url = req.url;
    url = url.replace(/[^a-zA-Z\.0-9\-]/g,"");
    if (fs.existsSync(options.home+url))
    {
        sendFile(url, res); //it's bad using *Sync function's, but...
    } else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not found: "+req.url);
        res.end();
    }
  }
}

function plzMjpegProxy() {
  for (var i = 0; i<camz.length; i++) //TODO: beautify
  {
    camz[i].request = http.request(camz[i].url);
    camz[i].request.end();
    camz[i].request.on('response', camz[i].onRequest);
  }
}

audienceServer = http.createServer();
audienceServer.listen(options.port);
audienceServer.on('request', router);

/* run camz download */
plzMjpegProxy();
