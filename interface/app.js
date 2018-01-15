var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
const image2base64 = require('image-to-base64');
var request = require('request');

http.createServer(function(req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = require('os').homedir() + '/skinanalysis/interface/uploaded/' + files.filetoupload.name;
      fs.rename(oldpath, newpath, function(err) {
        if (err) throw err;
        image2base64(newpath)
          .then(
            (response) => {
              var req = {
                "image":response
              }
              request.post({
                url: 'http://35.196.31.151:5000/predict',
                body: req,
                json: true
              }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  console.log(body)
                }
              });

              console.log(response); //cGF0aC90by9maWxlLmpwZw==
            }
          )
          .catch(
            (error) => {
              console.log(error); //Exepection error....
            }
          )

        res.write('File uploaded and moved!');
        res.end();
      });
    });
  } else {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080, "0.0.0.0");
