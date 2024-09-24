import React, { useState } from "react";

function App() {
  const [video, setVideo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append("video", video);

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResult(`http://localhost:3000${data.videoUrl}`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-semibold mb-5">Upload Video for Dubbing</h1>
          <form onSubmit={handleSubmit} className="mb-5">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files[0])}
              className="mb-3 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            />
            <button
              type="submit"
              disabled={!video || processing}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 disabled:opacity-50"
            >
              {processing ? "Processing..." : "Upload and Process"}
            </button>
          </form>
          {result && (
            <div className="mt-5">
              {result.startsWith("Error") ? (
                <p className="text-red-500">{result}</p>
              ) : (
                <video src={result} controls className="w-full" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
