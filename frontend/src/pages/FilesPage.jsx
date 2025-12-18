import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

// Function to determine file type based on filename
function getFileType(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const types = {
    pdf: { icon: "📄", label: "PDF Document", color: "red" },
    doc: { icon: "📝", label: "Word Document", color: "blue" },
    docx: { icon: "📝", label: "Word Document", color: "blue" },
    xls: { icon: "📊", label: "Excel Spreadsheet", color: "green" },
    xlsx: { icon: "📊", label: "Excel Spreadsheet", color: "green" },
    csv: { icon: "📊", label: "CSV File", color: "green" },
    txt: { icon: "📄", label: "Text File", color: "gray" },
    jpg: { icon: "🖼️", label: "Image", color: "purple" },
    png: { icon: "🖼️", label: "Image", color: "purple" },
    zip: { icon: "📦", label: "Compressed File", color: "orange" },
  };
  return types[ext] || { icon: "📁", label: "File", color: "gray" };
}

export default function FilesPage() {
  const nav = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [chosenFile, setChosenFile] = useState(null);

  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");

  const [folderNames, setFolderNames] = useState({}); // Custom folder names
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState({}); // Track collapsed state

  const fileRef = useRef();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to access files');
      nav('/login');
      return;
    }
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error('Failed to load files:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        nav('/login');
      }
    }
  }

  // STEP 1: User selects file
  function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    setChosenFile(file);
    setFileName(file.name.replace(/\.[^/.]+$/, "")); // default name
    setDescription("");
    setShowForm(true);
  }

  // STEP 2: Upload file with metadata
  async function uploadWithDetails() {
    if (!chosenFile) return alert("No file selected");
    if (!fileName.trim()) return alert("Please enter a file name");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', chosenFile);
      formData.append('name', fileName);
      formData.append('description', description || '');

      console.log('Uploading file:', {
        fileName,
        description,
        fileSize: chosenFile.size,
        fileType: chosenFile.type
      });

      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Upload successful:', res.data);

      setFiles([res.data, ...files]);
      setShowForm(false);
      setChosenFile(null);
      setFileName("");
      setDescription("");
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        nav('/login');
        return;
      }
      
      const errorMsg = err.response?.data?.message || err.response?.data?.errors || 'Failed to upload file. Please try again.';
      alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setUploading(false);
    }
  }

  async function download(f) {
    try {
      const res = await api.get(`/files/${f.id}/download`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', f.filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file. Please try again.');
    }
  }

  async function deleteFile(id) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await api.delete(`/files/${id}`);
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete file. Please try again.');
    }
  }

  function startRenameFolder(folderName) {
    setEditingFolder(folderName);
    setEditingName(folderNames[folderName] || folderName);
  }

  function saveRenameFolder() {
    if (editingName.trim()) {
      setFolderNames({
        ...folderNames,
        [editingFolder]: editingName.trim(),
      });
    }
    setEditingFolder(null);
    setEditingName("");
  }

  function cancelRenameFolder() {
    setEditingFolder(null);
    setEditingName("");
  }

  function getFolderDisplayName(originalName) {
    return folderNames[originalName] || originalName;
  }

  function toggleFolder(folderName) {
    setCollapsedFolders({
      ...collapsedFolders,
      [folderName]: !collapsedFolders[folderName],
    });
  }

  // Group files by type
  const groupedFiles = {};
  files.forEach(f => {
    const fileType = getFileType(f.filename);
    if (!groupedFiles[fileType.label]) {
      groupedFiles[fileType.label] = [];
    }
    groupedFiles[fileType.label].push(f);
  });

  const colorMap = {
    red: "bg-red-50 border-l-4 border-red-500",
    blue: "bg-blue-50 border-l-4 border-blue-500",
    green: "bg-green-50 border-l-4 border-green-500",
    purple: "bg-purple-50 border-l-4 border-purple-500",
    orange: "bg-orange-50 border-l-4 border-orange-500",
    gray: "bg-gray-50 border-l-4 border-gray-500",
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => nav("/dashboard")}
              className="text-indigo-600 hover:text-indigo-700 text-lg"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-sm text-gray-600">Upload and manage your documents</p>
        </header>

        {/* Upload Button */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex items-center gap-4">
            <input
              ref={fileRef}
              type="file"
              onChange={handleFileSelection}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
            >
              📤 Add File
            </button>
            {uploading && <div className="text-sm text-gray-500">Uploading...</div>}
          </div>
        </div>

        {/* Upload Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
              <h2 className="text-xl font-bold mb-4">📋 File Details</h2>

              <label className="text-sm font-semibold block mb-2">File Name</label>
              <input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-indigo-500"
                placeholder="Enter custom file name"
              />

              <label className="text-sm font-semibold block mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-indigo-500"
                placeholder="Enter file description"
                rows="3"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadWithDetails}
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Add File"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File List Grouped by Type */}
        <div className="space-y-6">
          {files.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-500 font-medium">No files uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "Add File" to get started</p>
            </div>
          ) : (
            Object.entries(groupedFiles).map(([fileType, typeFiles]) => {
              const sampleFile = typeFiles[0];
              const typeInfo = getFileType(sampleFile.filename);
              const bgColor = colorMap[typeInfo.color];

              return (
                <div key={fileType} className="bg-white rounded-xl shadow overflow-hidden">
                  {/* Folder Header */}
                  <div 
                    className={`${bgColor} p-4 flex items-center gap-3 justify-between cursor-pointer hover:opacity-90 transition`}
                    onClick={() => toggleFolder(fileType)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{typeInfo.icon}</span>
                      <span className="text-xl font-bold text-gray-600">
                        {collapsedFolders[fileType] ? "▶" : "▼"}
                      </span>
                      <div className="flex-1">
                        {editingFolder === fileType ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRenameFolder();
                                if (e.key === 'Escape') cancelRenameFolder();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-1 border rounded bg-white text-gray-800 font-bold focus:outline-none focus:border-indigo-500"
                              autoFocus
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveRenameFolder();
                              }}
                              className="text-green-600 hover:text-green-700 font-bold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelRenameFolder();
                              }}
                              className="text-red-600 hover:text-red-700 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-bold text-gray-800">{getFolderDisplayName(fileType)}</h3>
                            <p className="text-xs text-gray-600">{typeFiles.length} file{typeFiles.length !== 1 ? 's' : ''}</p>
                          </>
                        )}
                      </div>
                    </div>
                    {editingFolder !== fileType && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRenameFolder(fileType);
                        }}
                        className="bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-700 px-3 py-1 rounded text-sm font-medium transition"
                      >
                        ✏️ Rename
                      </button>
                    )}
                  </div>

                  {/* Files in folder - Dropdown */}
                  {!collapsedFolders[fileType] && (
                    <div className="divide-y">
                      {typeFiles.map((f) => (
                        <div
                          key={f.id}
                          className="p-4 hover:bg-gray-50 transition flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800">{f.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{f.description}</div>
                            <div className="text-xs text-gray-400 mt-2 flex items-center gap-3">
                              <span>📦 {(f.size / 1024).toFixed(1)} KB</span>
                              <span>📄 {f.filename}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => download(f)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm font-medium transition"
                            >
                              ⬇️ Download
                            </button>
                            <button
                              onClick={() => deleteFile(f.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded text-sm font-medium transition"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
