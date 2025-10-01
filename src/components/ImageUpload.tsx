import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Grid, Search, Check } from "lucide-react";
import { createImageUploadHandler, mediaAPI } from "../lib/media";
import type { MediaFile } from "../lib/media";

interface ImageUploadProps {
  value?: string; // Base64 image data
  onChange: (base64: string | undefined) => void;
  onAltChange?: (alt: string) => void;
  altText?: string;
  label?: string;
  className?: string;
  maxSize?: number; // in MB
}

export default function ImageUpload({
  value,
  onChange,
  onAltChange,
  altText = "",
  label = "Upload Image",
  className = "",
  maxSize = 5
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media files when library tab is opened
  useEffect(() => {
    if (activeTab === "library" && mediaFiles.length === 0) {
      fetchMediaFiles();
    }
  }, [activeTab]);

  const fetchMediaFiles = async () => {
    try {
      setLoadingMedia(true);
      const files = await mediaAPI.getAll();
      // Filter only image files
      const imageFiles = files.filter(file => file.mimeType.startsWith('image/'));
      setMediaFiles(imageFiles);
    } catch (error) {
      console.error("Error fetching media files:", error);
      setError("Failed to load media library");
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleMediaSelect = (mediaFile: MediaFile) => {
    setSelectedMediaId(mediaFile.id);
    onChange(mediaFile.base64);
    if (onAltChange) {
      onAltChange(mediaFile.name || "Selected image");
    }
  };

  const handleUpload = createImageUploadHandler(
    (file: MediaFile) => {
      onChange(file.base64);
      setUploading(false);
      setError(null);
      // Refresh media library if it's loaded
      if (mediaFiles.length > 0) {
        fetchMediaFiles();
      }
    },
    (errorMessage: string) => {
      setError(errorMessage);
      setUploading(false);
    }
  );

  const handleFileSelect = (file: File) => {
    setUploading(true);
    setError(null);
    handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    onChange(undefined);
    if (onAltChange) onAltChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedMediaId(null);
  };

  // Filter media files based on search query
  const filteredMediaFiles = mediaFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {value ? (
        /* Image Preview */
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border border-gray-300">
            <img
              src={value}
              alt={altText || "Uploaded image"}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <button
                onClick={removeImage}
                className="opacity-0 hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alt Text Input */}
          {onAltChange && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Alt text for accessibility..."
                value={altText}
                onChange={(e) => onAltChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "upload"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "library"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Grid className="w-4 h-4 mr-2" />
              Media Library
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "upload" ? (
              /* Upload Area */
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {uploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <motion.div
                      className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-sm text-gray-600">Uploading image...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        Drop your image here
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        or{" "}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to {maxSize}MB
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </motion.div>
            ) : (
              /* Media Library */
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Media Grid */}
                <div className="border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {loadingMedia ? (
                    <div className="flex items-center justify-center py-8">
                      <motion.div
                        className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="ml-2 text-sm text-gray-600">Loading media...</span>
                    </div>
                  ) : filteredMediaFiles.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {filteredMediaFiles.map((file) => (
                        <motion.button
                          key={file.id}
                          onClick={() => handleMediaSelect(file)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedMediaId === file.id
                              ? "border-purple-500 ring-2 ring-purple-200"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <img
                            src={file.base64}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          {selectedMediaId === file.id && (
                            <div className="absolute inset-0 bg-purple-600 bg-opacity-20 flex items-center justify-center">
                              <div className="bg-purple-600 text-white rounded-full p-1">
                                <Check className="w-4 h-4" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {file.name}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">
                        {searchQuery ? "No images found matching your search" : "No images in media library"}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={() => setActiveTab("upload")}
                          className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Upload your first image
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
