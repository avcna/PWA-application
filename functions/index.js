const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: "http://localhost:8080" });
const webpush = require("web-push");
const Busboy = require("busboy");
const fs = require("fs");
const UUID = require("uuid-v4");
const path = require("path");
const os = require("os");

var serviceAccount = require("./pwagram-ad7b5-firebase-adminsdk-qh062-09495af3ab.json");
var gconfig = {
  projectId: "pwagram-ad7b5",
  keyFilename: "pwagram-ad7b5-firebase-adminsdk-qh062-09495af3ab.json",
};

var gcs = require("@google-cloud/storage")(gconfig);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwagram-ad7b5-default-rtdb.firebaseio.com",
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, function () {
    var uuid = UUID();
    const busboy = Busboy({ headers: request.headers });
    // These objects will store the values (file + fields) extracted from busboy
    let upload;
    const fields = {};

    // This callback will be invoked for each file uploaded
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      // console.log(
      //   `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
      // );
      console.log(filename.filename);
      const filepath = path.join(os.tmpdir(), filename.filename);
      upload = { file: filepath, type: filename.mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    // This will invoked on every field detected
    busboy.on(
      "field",
      function (
        fieldname,
        val,
        fieldnameTruncated,
        valTruncated,
        encoding,
        mimetype
      ) {
        fields[fieldname] = val;
      }
    );
    busboy.on("finish", () => {
      var bucket = gcs.bucket("pwagram-ad7b5.appspot.com");
      bucket.upload(
        upload.file,
        {
          uploadType: "media",
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid,
            },
          },
        },
        function (err, file) {
          if (!err) {
            admin
              .database()
              .ref("post")
              .push({
                id: fields.id,
                title: fields.title,
                location: fields.location,
                rawLocation: {
                  lat: fields.rawLocationLat,
                  lng: fields.rawLocationLng,
                },
                image:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(file.name) +
                  "?alt=media&token=" +
                  uuid,
              })
              .then(function () {
                webpush.setVapidDetails(
                  "mailto:salsabiladitaprasetya@gmail.com",
                  "BM5HpsDv1BUE50Mm-EKY8hM-V2MHiewrU2RTAIP7dz4S1_CA4w42b4jKA_dnUmyFCkTf7ACdWY5B4uJnaFcJFoM",
                  "yx9JRCcI0N_OcQuo13YR9bfYKpjLSI7SeL2zIvje03E"
                );
                return admin.database().ref("subscriptions").once("value");
              })
              .then(function (subscriptions) {
                subscriptions.forEach(function (sub) {
                  var pushConfig = {
                    endpoint: sub.val().endpoint,
                    keys: {
                      auth: sub.val().keys.auth,
                      p256dh: sub.val().keys.p256dh,
                    },
                  };
                  webpush
                    .sendNotification(
                      pushConfig,
                      JSON.stringify({
                        title: "New Post",
                        content: "New Post Added!",
                        openUrl: "/help",
                      })
                    )
                    .catch(function (err) {
                      console.log(err);
                    });
                });
                response
                  .status(201)
                  .json({ message: "Data stored!", id: fields.id });
              })
              .catch(function (error) {
                response.status(500).json({ error: error });
              });
          } else {
            console.log(err);
          }
        }
      );
    });
    busboy.end(request.rawBody);
  });
});
