const express = require("express");
const bodyparser = require("body-parser");
const routes = require("./routes/routes.js");
const path = require("path");
const http = require("http");
const cloudinary = require('cloudinary');
const fs = require('fs');
const request = require('request');

const app = express();

//configure cloudinary
cloudinary.config({
  cloud_name: 'dsjiibsec',
  api_key: '819862197733613',
  api_secret: '72UZdbBtwDA5yh_foUikOheT8tg'
});

app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(bodyparser.json());
app.use("/", routes);

app.use(express.static(path.join(__dirname, "public"))); //to serve static content

const server = http.createServer(app);

server.listen(3000, function() {
  console.log("Server Started on Port 3000 ...");
});

const io = require("socket.io")(server); //for Socket.io

//Function to download image

const download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

io.on("connection", function(socket) {
  console.log("A user Connected");

  socket.on("disconnect", function() {
    console.log("user Disconnected");
  });

    cloudinary.v2.search
    .expression('folder=face_recognition')
    .execute().then(result=>{
      socket.emit("images", result.resources);
    });

  socket.on("imageUpload", function(info) {
    console.log(info.image)
    if(!info.image){
      download(info.src, './tmp/uploads/out.png', function(){
        console.log("Download success")
        socket.emit("DownloadSuccess", "true"); //return success
      });
    }else{
      // console.log(info.buffer);
      //image is transfered in websockets in base64 format from client to server
      let base64Data;
      if (info.format === "png")
      base64Data = info.buffer.replace(/^data:image\/png;base64,/, "");
      else if (info.format === "jpg")
      base64Data = info.buffer.replace(/^data:image\/jpeg;base64,/, "");
      else socket.emit("UploadSuccess", "false");

      console.log(info.format);

      if (base64Data) {
        //if data is not null
        require("fs").writeFile(
          "./tmp/uploads/out.png",
          base64Data,
          "base64",
          function(err) {
            //save image to out.png
            if (err) {
              console.log(err);
              socket.emit("UploadSuccess", "false"); //return failure
            } else {
              socket.emit("UploadSuccess", "true"); //return success
            }
          }
        );
      }//End of base64data if

    }

  });
});
