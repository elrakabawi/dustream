import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("video", file);

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
        <button type="submit">Upload</button>
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
