import React, { useRef } from 'react';
import { Button, Badge } from '@/components';
import { Camera, Trash2, User } from 'lucide-react';

export interface ProfilePhotoUploaderProps {
  photoUrl?: string;
  onPhotoChange: (url: string) => void;
  onPhotoRemove: () => void;
}

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  photoUrl,
  onPhotoChange,
  onPhotoRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Avatar Container */}
      <div className="relative w-20 h-20 rounded-full border-2 border-indigo-100 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
        {photoUrl ? (
          <img src={photoUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
        ) : (
          <User className="w-8 h-8 text-slate-400" />
        )}
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            {photoUrl ? 'Replace Photo' : 'Upload Photo'}
          </Button>
          {photoUrl && (
            <Button variant="outline" size="sm" type="button" onClick={onPhotoRemove} className="text-rose-600 border-rose-200">
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-[10px] text-slate-400">JPG, PNG or WEBP (Max 5 MB)</p>
      </div>
    </div>
  );
};