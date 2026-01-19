import { useState } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/button';

interface CameraModalProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const [activeTab, setActiveTab] = useState<'capture' | 'upload'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    // Simulate camera capture with placeholder
    const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzk0YTNiOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXB0dXJlZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
    setCapturedImage(placeholderImage);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-slate-900 dark:text-white">Capture Evidence</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-white/60" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('capture')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'capture'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Capture
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
          </div>

          {/* Content */}
          {activeTab === 'capture' ? (
            <div className="space-y-4">
              {capturedImage ? (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-64 object-cover rounded-lg border-2 border-slate-200 dark:border-white/10"
                  />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 dark:text-white/60 mb-4">
                      Camera preview would appear here
                    </p>
                    <Button onClick={handleCapture} className="bg-gradient-to-r from-purple-500 to-blue-500">
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {capturedImage ? (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Uploaded"
                    className="w-full h-64 object-cover rounded-lg border-2 border-slate-200 dark:border-white/10"
                  />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block h-64 bg-slate-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 dark:text-white/60 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/40">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!capturedImage}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}