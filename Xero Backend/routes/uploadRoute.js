const stream = require("stream");
const express = require("express");
const multer = require("multer");
const { google } = require("googleapis");
const getDriveService = require("../service");

const uploadRouter = express.Router();
const upload = multer();

const uploadFile = async (fileObject, driveService) => {
  console.log("fileobject", fileObject);
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);

  // Determine the MIME type based on the file extension
  const mimeType = getMimeTypeFromExtension(fileObject.originalname);

  if (mimeType) {
    const { data } = await driveService.files.create({
      media: {
        mimeType,
        body: bufferStream,
      },
      requestBody: {
        name: fileObject.originalname,
        parents: ["1K3k3ZT5gS90pwq2TLrzIAj__0-slj5pp"],
      },
      fields: "id,name",
    });
    console.log(`Uploaded file ${data.name} ${data.id}`);
  } else {
    console.error(
      `MIME type could not be determined for file: ${fileObject.originalname}`
    );
  }
};

uploadRouter.post("/", upload.any(), async (req, res) => {
  try {
    const files = req?.files;
    const driveService = getDriveService(); // Obtain the authorized driveService

    for (let f = 0; f < files.length; f += 1) {
      await uploadFile(files[f], driveService);
    }

    res.status(200).send("Form Submitted");
  } catch (f) {
    res.send(f.message);
  }
});

const getMimeTypeFromExtension = (fileName) => {
  if (fileName) {
    const fileExtension = fileName.split(".").pop().toLowerCase();

    switch (fileExtension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "pdf":
        return "application/pdf";
      case "csv":
        return "text/csv";
      case "xls":
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "doc":
      case "docx":
        return "application/msword";
      case "ppt":
      case "pptx":
        return "application/vnd.ms-powerpoint";
      case "txt":
        return "text/plain";
      case "json":
        return "application/json";
      // Add more file extensions and MIME types as needed
      default:
        return null; // Return null for unknown file types
    }
  } else {
    return null; // Return null for undefined or null fileName
  }
};

module.exports = uploadRouter;
