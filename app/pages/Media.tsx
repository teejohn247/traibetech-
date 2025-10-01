import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Image as ImageIcon, 
  Video, 
  File, 
  Download, 
  Trash2, 
  Copy, 
  Eye,
  X,
  Plus,
  Calendar,
  HardDrive
} from "lucide-react";
import { 
  mediaAPI, 
  type MediaFile, 
  formatFileSize, 
  isImage, 
  isVideo 
} from "../lib/media";

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'images' | 'videos' | 'documents';

export default function Media() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const files = await mediaAPI.getAll();
      setMediaFiles(files);
    } catch (error) {
      console.error("Error fetching media files:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch media files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadedFile = await mediaAPI.upload(file);
        return uploadedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setMediaFiles(prev => [...uploadedFiles, ...prev]);
      setUploadProgress(100);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload files");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDeleteFile = async (file: MediaFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await mediaAPI.delete(file.id);
        setMediaFiles(prev => prev.filter(f => f.id !== file.id));
        setSelectedFile(null);
      } catch (error) {
        console.error("Delete error:", error);
        setError(error instanceof Error ? error.message : "Failed to delete file");
      }
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      alert("URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const downloadFile = (file: MediaFile) => {
    const link = document.createElement('a');
    link.href = file.base64;
    link.download = file.name || file.id;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter files based on search and type
  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = !searchQuery || 
      file.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.originalName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'all' || 
      (filterType === 'images' && isImage(file.mimeType)) ||
      (filterType === 'videos' && isVideo(file.mimeType)) ||
      (filterType === 'documents' && !isImage(file.mimeType) && !isVideo(file.mimeType));

    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (file: MediaFile) => {
    if (isImage(file.mimeType)) return <ImageIcon className="w-5 h-5" />;
    if (isVideo(file.mimeType)) return <Video className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getFileTypeColor = (file: MediaFile) => {
    if (isImage(file.mimeType)) return "text-green-600 bg-green-100";
    if (isVideo(file.mimeType)) return "text-blue-600 bg-blue-100";
    return "text-gray-600 bg-gray-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage your images, videos, and documents.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium border ${
                viewMode === 'grid'
                  ? "bg-green-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } rounded-l-lg transition-colors`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium border-t border-b border-r ${
                viewMode === 'list'
                  ? "bg-green-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } rounded-r-lg transition-colors`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Files
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchMediaFiles}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading files...</span>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search media files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="documents">Documents</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedFile(file)}
            >
              {/* File Preview */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {isImage(file.mimeType) ? (
                  <img
                    src={file.base64}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`p-4 rounded-full ${getFileTypeColor(file)}`}>
                      {getFileIcon(file)}
                    </div>
                  </div>
                )}
                
                {/* File Type Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(file)}`}>
                    {file.mimeType.split('/')[1].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate" title={file.originalName}>
                  {file.originalName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.base64);
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Copy Base64"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {isImage(file.mimeType) ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={file.base64}
                              alt={file.name}
                            />
                          ) : (
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getFileTypeColor(file)}`}>
                              {getFileIcon(file)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {file.originalName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFileTypeColor(file)}`}>
                        {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(file.base64)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadFile(file)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredFiles.length === 0 && !loading && (
        <div className="text-center py-12">
          <HardDrive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterType !== 'all' ? "No files found" : "No media files yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterType !== 'all' 
              ? "Try adjusting your search or filter criteria." 
              : "Upload your first media file to get started."
            }
          </p>
          {!searchQuery && filterType === 'all' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </button>
          )}
        </div>
      )}

      {/* File Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedFile.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatFileSize(selectedFile.size)} • {selectedFile.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {isImage(selectedFile.mimeType) ? (
                  <img
                    src={selectedFile.base64}
                    alt={selectedFile.name}
                    className="max-w-full max-h-96 mx-auto rounded-lg"
                  />
                ) : isVideo(selectedFile.mimeType) ? (
                  <video
                    src={selectedFile.base64}
                    controls
                    className="max-w-full max-h-96 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className={`inline-flex p-6 rounded-full ${getFileTypeColor(selectedFile)}`}>
                      {getFileIcon(selectedFile)}
                    </div>
                    <p className="mt-4 text-gray-600">
                      Preview not available for this file type
                    </p>
                  </div>
                )}

                {/* File Details */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">File Name:</span>
                    <p className="text-gray-600">{selectedFile.originalName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Format:</span>
                    <p className="text-gray-600">{selectedFile.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Size:</span>
                    <p className="text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Uploaded:</span>
                    <p className="text-gray-600">{new Date(selectedFile.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedFile.width && selectedFile.height && (
                    <>
                      <div>
                        <span className="font-medium text-gray-700">Dimensions:</span>
                        <p className="text-gray-600">{selectedFile.width} × {selectedFile.height}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">URL:</span>
                    <p className="text-gray-600 truncate">{selectedFile.base64}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => copyToClipboard(selectedFile.base64)}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy URL
                    </button>
                    <button
                      onClick={() => downloadFile(selectedFile)}
                      className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(selectedFile)}
                    className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
