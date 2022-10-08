import express from "express";
import fs from "fs";
import path from "path";

const PORT = 4000;

const main = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.static("public"));

  app.get("/video", (req, res) => {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range || typeof range !== "string") {
      return res.status(400).send("Range header missing");
    }

    // get video stats (about 61MB)
    const videoName = "video.mp4";
    const videoPath = path.join(__dirname, videoName);
    const videoSize = fs.statSync(videoPath).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    return videoStream.pipe(res);
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
};

main().catch(console.error);
