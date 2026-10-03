
import React, { useState } from 'react';
import {
  User,
} from '../../../types';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Button } from '../../ui/button';
import { ImageUp, Video } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdateProfile: (settings: FormData) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateProfile }) => {
  const [name, setName] = useState(user.name || '');
  const [description, setDescription] = useState(user.description || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [backgroundMedia, setBackgroundMedia] = useState<File | null>(null);
  const [accentColor, setAccentColor] = useState(user.accentColor || '#a951bb');
  const [textColor, setTextColor] = useState(user.textColor || '#f4f0ef');
  const [backgroundColor, setBackgroundColor] = useState(user.backgroundColor || '#090909');
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    validTypes: string[]
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Choose a supported image or MP4 file.",
          variant: "destructive"
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "File must be smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setFile(file);
    } else {
      setFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData object to handle file uploads
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('accentColor', accentColor);
    formData.append('textColor', textColor);
    formData.append('backgroundColor', backgroundColor);

    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    if (backgroundMedia) {
      formData.append('backgroundMedia', backgroundMedia);
    }

    onUpdateProfile(formData);
  };
  // {console.log(name)}

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">General customization</h3>
          <p className="mt-1 text-xs text-[#81797b]">The details shown at the top of your page.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-name" className="text-xs text-[#c4bcbd]">Display name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 border-white/[0.1] bg-[#090909] text-white placeholder:text-[#655f60]"
            placeholder="Your name"
            maxLength={60}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-description" className="text-xs text-[#c4bcbd]">Description</Label>
          <textarea
            id="profile-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full resize-y rounded-[16px] border border-white/[0.1] bg-[#09090a] p-3 text-sm text-white outline-none transition-colors placeholder:text-[#655f60] focus:border-[#a951bb]/65"
            placeholder="A little about you"
            maxLength={500}
          />
        </div>
      </section>

      <section id="appearance" className="space-y-4 border-t border-white/[0.08] pt-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Color customization</h3>
          <p className="mt-1 text-xs text-[#81797b]">Adjust the profile palette.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex h-14 items-center justify-between gap-3 rounded-[16px] border border-white/[0.08] bg-[#09090a] px-4">
            <span className="text-xs text-[#c4bcbd]">Accent</span>
            <Input aria-label="Accent color" type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent p-0" />
          </label>
          <label className="flex h-14 items-center justify-between gap-3 rounded-[16px] border border-white/[0.08] bg-[#09090a] px-4">
            <span className="text-xs text-[#c4bcbd]">Text</span>
            <Input aria-label="Text color" type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent p-0" />
          </label>
          <label className="flex h-14 items-center justify-between gap-3 rounded-[16px] border border-white/[0.08] bg-[#09090a] px-4">
            <span className="text-xs text-[#c4bcbd]">Background</span>
            <Input aria-label="Background color" type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent p-0" />
          </label>
        </div>
        <div className="flex items-center justify-between rounded-lg border px-4 py-3" style={{ backgroundColor, borderColor: `${accentColor}66`, color: textColor }}>
          <span className="text-xs font-semibold">lost.lol/{user.username}</span>
          <span className="rounded-md px-2.5 py-1 text-[10px] font-bold text-white" style={{ backgroundColor: accentColor }}>Preview</span>
        </div>
      </section>

      <section className="space-y-4 border-t border-white/[0.08] pt-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Assets uploader</h3>
          <p className="mt-1 text-xs text-[#81797b]">Images and MP4 video, up to 5 MB each.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="profile-picture" className="group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[20px] border border-white/[0.08] bg-[#0b0b0d] px-4 py-6 text-center transition-colors hover:border-[#a951bb]/55 hover:bg-[#3b1e43]/20">
            <input
              id="profile-picture"
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => handleFileChange(e, setProfilePicture, ['image/jpeg', 'image/png', 'image/gif'])}
            />
            <ImageUp size={25} className="mb-3 text-[#d58ae1]" />
            <span className="text-xs font-semibold text-[#e9e3e4]">Profile avatar</span>
            <span className="mt-1 max-w-full truncate text-[11px] text-[#81797b]">{profilePicture?.name || 'Click to choose an image'}</span>
          </label>

          <label htmlFor="background-media" className="group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[20px] border border-white/[0.08] bg-[#0b0b0d] px-4 py-6 text-center transition-colors hover:border-[#a951bb]/55 hover:bg-[#3b1e43]/20">
            <input
              id="background-media"
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/gif,video/mp4"
              onChange={(e) => handleFileChange(e, setBackgroundMedia, ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'])}
            />
            {backgroundMedia?.type.startsWith('video/') ? <Video size={25} className="mb-3 text-[#d58ae1]" /> : <ImageUp size={25} className="mb-3 text-[#d58ae1]" />}
            <span className="text-xs font-semibold text-[#e9e3e4]">Background media</span>
            <span className="mt-1 max-w-full truncate text-[11px] text-[#81797b]">{backgroundMedia?.name || 'Choose an image or MP4'}</span>
          </label>
        </div>
      </section>

      <Button type="submit" className="h-12 rounded-full border border-[#9650a5] bg-[#572760] px-6 font-semibold text-white hover:bg-[#683073]">Save profile</Button>
    </form>
  );
};
