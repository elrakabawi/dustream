require("dotenv").config();
const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const util = require("util");
const unlinkAsync = util.promisify(fs.unlink);

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client/public")));
app.use("/videos", express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    console.log("Received video upload request");
    const videoPath = req.file.path;
    const audioPath = path.join("uploads", `${req.file.filename}.wav`);

    console.log("Extracting audio from video");
    await extractAudio(videoPath, audioPath);

    console.log("Performing speech-to-text");
    const text = await speechToText(audioPath);

    console.log("Translating text");
    const translatedText = await translateText(text);

    console.log("Generating new speech with voice cloning");
    const clonedAudioPath = await textToSpeechWithCloning(translatedText);

    console.log("Syncing new audio with original video");
    const outputFileName = `${Date.now()}_dubbed.mp4`;
    const outputPath = path.join("public", outputFileName);
    await syncAudioWithVideo(videoPath, clonedAudioPath, outputPath);

    console.log("Processing completed successfully");
    res.json({ success: true, videoUrl: `/videos/${outputFileName}` });

    // Clean up temporary files
    await cleanupTempFiles(videoPath, audioPath, clonedAudioPath);
  } catch (error) {
    console.error("Error during video processing:", error);
    res.status(500).json({ success: false, error: error.message });

    // Attempt to clean up even if there was an error
    try {
      await cleanupTempFiles(videoPath, audioPath, clonedAudioPath);
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }
});

function extractAudio(videoPath, audioPath) {
  console.log(`Extracting audio from ${videoPath} to ${audioPath}`);
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions("-acodec", "pcm_s16le")
      .outputOptions("-vn")
      .save(audioPath)
      .on("end", () => {
        console.log("Audio extraction completed");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error during audio extraction:", err);
        reject(err);
      });
  });
}

async function speechToText(audioPath) {
  // Implement Deepgram or AssemblyAI API call here
  // For now, we'll return a placeholder text
  return "This is a placeholder transcription.";
}

async function translateText(text) {
  // Implement translation API call here
  // For now, we'll return the same text
  return text;
}

async function textToSpeechWithCloning(text) {
  // Implement Resemble AI API call here
  // For now, we'll return the path to a placeholder audio file
  return path.join("placeholder", "placeholder_cloned.wav");
}

function syncAudioWithVideo(videoPath, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(audioPath)
      .outputOptions("-c:v", "copy")
      .outputOptions("-map", "0:v:0")
      .outputOptions("-map", "1:a:0")
      .save(outputPath)
      .on("end", resolve)
      .on("error", reject);
  });
}

async function cleanupTempFiles(...filePaths) {
  for (const filePath of filePaths) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        await unlinkAsync(filePath);
        console.log(`Deleted temporary file: ${filePath}`);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
