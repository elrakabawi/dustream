import React, { useState, useRef } from "react";
import axios from "axios";

const languages = [
  { code: "AR", name: "Arabic" },
  { code: "ZH", name: "Chinese" },
  { code: "EN", name: "English" },
  { code: "FR", name: "French" },
  { code: "DE", name: "German" },
  { code: "HI", name: "Hindi" },
  { code: "IT", name: "Italian" },
  { code: "JA", name: "Japanese" },
  { code: "PT", name: "Portuguese" },
  { code: "ES", name: "Spanish" },
];

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("ES");
  const [isLoading, setIsLoading] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("targetLanguage", selectedLanguage);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultVideo(response.data.videoUrl);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("An error occurred while processing the video.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-semibold mb-5">Video Dubbing App</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Video</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*"
                ref={fileInputRef}
                className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Language</label>
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!selectedFile || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Dub Video"}
            </button>
          </form>
          {resultVideo && (
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-2">Result:</h2>
              <video controls src={`http://localhost:5000${resultVideo}`} className="w-full rounded-lg shadow-lg">
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
