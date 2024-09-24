import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState("es"); // Default to Spanish

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleLanguageChange = (e) => {
    setTargetLanguage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("video", file);
    formData.append("targetLanguage", targetLanguage);

    try {
      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setVideoUrl(response.data.videoUrl);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="video/*" />
        <select value={targetLanguage} onChange={handleLanguageChange}>
          <option value="ES">Spanish</option>
          <option value="FR">French</option>
          <option value="DE">German</option>
          <option value="IT">Italian</option>
          <option value="JA">Japanese</option>
          <option value="ZH">Chinese</option>
          <option value="NL">Dutch</option>
          <option value="PL">Polish</option>
          <option value="PT-PT">Portuguese</option>
          <option value="RU">Russian</option>
        </select>
        <button type="submit">Upload and Translate</button>
      </form>
      {videoUrl && (
        <video controls width="500">
          <source src={`http://localhost:3000${videoUrl}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}

export default App;
