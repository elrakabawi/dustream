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

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client/public")));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const videoPath = req.file.path;
    const audioPath = path.join("uploads", `${req.file.filename}.wav`);

    // Extract audio from video
    await extractAudio(videoPath, audioPath);

    // Perform speech-to-text
    const text = await speechToText(audioPath);

    // Translate text
    const translatedText = await translateText(text);

    // Generate new speech with voice cloning
    const clonedAudioPath = await textToSpeechWithCloning(translatedText);

    // Sync new audio with original video
    const outputPath = path.join("public", `${req.file.filename}_dubbed.mp4`);
    await syncAudioWithVideo(videoPath, clonedAudioPath, outputPath);

    res.json({ success: true, videoUrl: `/${path.basename(outputPath)}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function extractAudio(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions("-acodec", "pcm_s16le")
      .outputOptions("-vn")
      .save(audioPath)
      .on("end", resolve)
      .on("error", reject);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
