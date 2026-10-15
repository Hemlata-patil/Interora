import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components';
import {
  uploadStudentAvatarBackend,
  removeStudentAvatarBackend,
} from '@/services/api/backendService';
import { resolveMediaUrl } from '@/utils/mediaUrl';

export interface ProfilePictureUploaderProps {
  currentAvatarUrl?: string | null;
  fullName?: string;
  onAvatarChange?: (avatarUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  allowImmediateSave?: boolean;
}

export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({
  currentAvatarUrl,
  fullName = 'Student',
  onAvatarChange,
  size = 'md',
  allowImmediateSave = true,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverImgFailed, setServerImgFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setServerImgFailed(false);
  }, [currentAvatarUrl]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resolvedCurrentUrl = resolveMediaUrl(currentAvatarUrl);
  const displayUrl = previewUrl || (!serverImgFailed ? resolvedCurrentUrl : null);

  const initials = (fullName || 'ST')
    .trim()
    .split(/\s+/)
    .map((n) => n[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Please select a valid JPG, PNG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB. Please choose a smaller photo.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setServerImgFailed(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageError = () => {
    if (previewUrl) {
      setErrorMessage('Could not render preview for selected file. Please choose another image.');
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
    } else {
      setServerImgFailed(true);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await uploadStudentAvatarBackend(selectedFile);
    setUploading(false);

    if (res.success && res.avatarUrl) {
      setSuccessMessage('Profile photo saved successfully.');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setServerImgFailed(false);
      if (onAvatarChange) {
        onAvatarChange(res.avatarUrl);
      }
      // Broadcast to update Header, Sidebar, Dashboard instantly
      window.dispatchEvent(
        new CustomEvent('interora:user-updated', {
          detail: { avatarUrl: res.avatarUrl },
        })
      );
    } else {
      setErrorMessage(res.error || 'Failed to upload profile photo to server.');
    }
  };

  const handleRemovePhoto = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (previewUrl && selectedFile) {
      // Discard unsaved local preview
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      return;
    }

    if (currentAvatarUrl) {
      setUploading(true);
      const res = await removeStudentAvatarBackend();
      setUploading(false);

      if (res.success) {
        setSuccessMessage('Profile photo removed.');
        setServerImgFailed(false);
        if (onAvatarChange) {
          onAvatarChange(null);
        }
        window.dispatchEvent(
          new CustomEvent('interora:user-updated', {
            detail: { avatarUrl: null },
          })
        );
      } else {
        setErrorMessage(res.error || 'Failed to remove photo.');
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar Display Frame */}
        <div className="relative group shrink-0">
          <div
            className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-800 text-white flex items-center justify-center font-bold shadow-md ring-4 ring-white border border-indigo-200 overflow-hidden relative`}
          >
            {displayUrl ? (
              <img
                src={displayUrl}
                alt={fullName}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <span>{initials}</span>
            )}

            {/* Hover overlay button to change photo */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer"
            >
              <Camera className="w-4 h-4 mb-0.5" />
              <span>Change</span>
            </button>
          </div>

          {previewUrl && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-xs">
              Unsaved
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
              <span>Profile Picture</span>
              <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Upload a professional photo in JPG, PNG, or WebP format (Max 5MB).
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs"
            >
              <Camera className="w-3.5 h-3.5 mr-1 text-slate-600" />
              {displayUrl ? 'Choose Different Photo' : 'Select Photo'}
            </Button>

            {selectedFile && allowImmediateSave && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSavePhoto}
                disabled={uploading}
                className="text-xs bg-indigo-600 hover:bg-indigo-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" /> Save Photo
                  </>
                )}
              </Button>
            )}

            {(displayUrl || selectedFile) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={uploading}
                className="text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" />
                {selectedFile ? 'Discard Selection' : 'Remove Photo'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Visible Feedback Alerts */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
