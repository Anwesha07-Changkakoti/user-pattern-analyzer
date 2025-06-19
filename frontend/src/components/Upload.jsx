import axios from "axios";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const { token } = useAuth(); // ✅ Get token from context

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    if (!token) {
      setMessage("You must be logged in to upload.");
      console.error("No token available for authenticated request.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Current Token:", token);
      console.log("Uploading file with token:", token); // ✅ Debug token

      const response = await axios.post("http://localhost:8000/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // ✅ Include token
        },
      });

      console.log("Response:", response.data);
      setMessage("File uploaded and analyzed successfully.");
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      setMessage("Upload failed. Check console for details.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-cybergreen">Upload Logs</h2>
      <p className="mt-2">Upload your log files below.</p>

      <input
        type="file"
        accept=".csv,.tsv,.json"
        onChange={handleFileChange}
        className="mt-4 block"
      />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-cybergreen text-white rounded hover:bg-green-700"
      >
        Upload
      </button>

      {message && <p className="mt-4 text-red-600">{message}</p>}
    </div>
  );
}
