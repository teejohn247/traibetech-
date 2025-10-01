export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  base64: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Get image dimensions
export const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
};

// Check if file is an image
export const isImage = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

// Check if file is a video
export const isVideo = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

// Get file size in human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension from mime type
export const getFileExtension = (mimeType: string): string => {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/mov': 'mov',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };
  
  return extensions[mimeType] || 'file';
};

// In-memory storage for media files
let mediaStorage: MediaFile[] = [
  // Sample images for demonstration
  {
    id: '1',
    name: 'sample-landscape',
    originalName: 'Beautiful Landscape.jpg',
    base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NmYxO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjgyZjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2FtcGxlIEltYWdlPC90ZXh0Pgo8L3N2Zz4K',
    mimeType: 'image/svg+xml',
    size: 1024,
    width: 800,
    height: 600,
    createdAt: new Date().toISOString()
  }
];

// Media API functions
export const mediaAPI = {
  // Get all media files
  async getAll(): Promise<MediaFile[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mediaStorage]), 300);
    });
  },

  // Upload new media file
  async upload(file: File): Promise<MediaFile> {
    try {
      const base64 = await fileToBase64(file);
      let dimensions = undefined;
      
      if (isImage(file.type)) {
        try {
          dimensions = await getImageDimensions(base64);
        } catch (error) {
          console.warn('Could not get image dimensions:', error);
        }
      }

      const mediaFile: MediaFile = {
        id: Date.now().toString(),
        name: file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
        originalName: file.name,
        base64,
        mimeType: file.type,
        size: file.size,
        width: dimensions?.width,
        height: dimensions?.height,
        createdAt: new Date().toISOString()
      };

      mediaStorage.unshift(mediaFile);
      return mediaFile;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to process file');
    }
  },

  // Delete media file
  async delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mediaStorage = mediaStorage.filter(file => file.id !== id);
        resolve();
      }, 200);
    });
  },

  // Get media file by ID
  async getById(id: string): Promise<MediaFile | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const file = mediaStorage.find(f => f.id === id);
        resolve(file || null);
      }, 100);
    });
  }
};

// Image upload component helper
export const createImageUploadHandler = (
  onUpload: (file: MediaFile) => void,
  onError: (error: string) => void
) => {
  return (file: File) => {
    if (!isImage(file.type)) {
      onError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      onError('Image size must be less than 5MB');
      return;
    }

    mediaAPI.upload(file)
      .then(onUpload)
      .catch(() => onError('Failed to upload image'));
  };
};
