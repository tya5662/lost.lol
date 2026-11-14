import React, { useState } from 'react';
import { LinkFormData, Link as LinkType, SocialPlatform } from '../../../types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  
  X,
  MailIcon,
  Ghost, Send, Music2, Video, MessageCircle, Globe, Camera, AtSign
} from 'lucide-react';

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'mail',
    name: 'Mail',
    icon: MailIcon,
    placeholder: 'mail',
    baseUrl: 'mailto:'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    placeholder: 'username',
    baseUrl: 'https://github.com/'
  },
  {
    id: 'x',
    name: 'X',
    icon: X,
    placeholder: 'username',
    baseUrl: 'https://x.com/'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'username',
    baseUrl: 'https://linkedin.com/in/'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    placeholder: 'username',
    baseUrl: 'https://instagram.com/'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    placeholder: 'username',
    baseUrl: 'https://facebook.com/'
  },
  {
    id: 'snapchat', name: 'Snapchat', icon: Ghost, placeholder: 'username',
    baseUrl: 'https://www.snapchat.com/add/'
  },
  {
    id: 'telegram', name: 'Telegram', icon: Send, placeholder: 'username',
    baseUrl: 'https://t.me/'
  },
  {
    id: 'tiktok', name: 'TikTok', icon: Video, placeholder: 'username',
    baseUrl: 'https://www.tiktok.com/@'
  },
  {
    id: 'twitch', name: 'Twitch', icon: Video, placeholder: 'username',
    baseUrl: 'https://www.twitch.tv/'
  },
  {
    id: 'spotify', name: 'Spotify', icon: Music2, placeholder: 'profile ID or username',
    baseUrl: 'https://open.spotify.com/user/'
  },
  {
    id: 'discord', name: 'Discord', icon: MessageCircle, placeholder: 'user ID',
    baseUrl: 'https://discord.com/users/'
  },
  {
    id: 'reddit', name: 'Reddit', icon: AtSign, placeholder: 'username',
    baseUrl: 'https://www.reddit.com/user/'
  },
  {
    id: 'pinterest', name: 'Pinterest', icon: Camera, placeholder: 'username',
    baseUrl: 'https://www.pinterest.com/'
  },
  {
    id: 'threads', name: 'Threads', icon: AtSign, placeholder: 'username',
    baseUrl: 'https://www.threads.net/@'
  },
  {
    id: 'bluesky', name: 'Bluesky', icon: Globe, placeholder: 'handle.bsky.social',
    baseUrl: 'https://bsky.app/profile/'
  },
  {
    id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, placeholder: 'phone number with country code',
    baseUrl: 'https://wa.me/'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    placeholder: 'username',
    baseUrl: 'https://youtube.com/@'
  },

  // {
  //   id: 'website',
  //   name: 'Website',
  //   icon: Globe,
  //   placeholder: 'https://yourwebsite.com',
  //   baseUrl: ''
  // }
];

interface SocialLinkFormProps {
  platform: SocialPlatform;
  currentLink?: LinkType;
  onSubmit: (data: LinkFormData) => void;
}
export const SocialLinkForm: React.FC<SocialLinkFormProps> = ({ platform, currentLink, onSubmit }) => {
  const [username, setUsername] = useState(() => {
    if (!currentLink?.url) return '';
    return platform.id === 'website'
      ? currentLink.url
      : currentLink.url.replace(platform.baseUrl, '').trim();
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast({
        title: "Error",
        description: "Please enter a valid username or URL",
        variant: "destructive"
      });
      return;
    }

    const handle = username.trim().replace(/^@/, '');
    const fullUrl = platform.id === 'website'
      ? (handle.startsWith('http') ? handle : `https://${handle}`)
      : `${platform.baseUrl}${handle}`;

    onSubmit({
      title: platform.name,
      url: fullUrl,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(platform.baseUrl, '');
    setUsername(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <platform.icon className="h-5 w-5" />
          <label className="text-sm font-medium">
            {platform.id === 'website' ? 'Website URL' : `${platform.name} Username`}
          </label>
        </div>

        <div className="flex items-center w-full max-w-2xl">
          {platform.id !== 'website' && (
            <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-black">
              {platform.baseUrl}
            </span>
          )}
          <input
            type="text"
            value={username}
            onChange={handleInputChange}
            placeholder={platform.placeholder}
            className={`flex-1 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
              platform.id !== 'website' ? 'rounded-r-md' : 'rounded-md'
            }`}
          />
        </div>
      </div>

      <Button type="submit" className="w-auto">
        Save Link
      </Button>
    </form>
  );
};

export default SocialLinkForm;
// export default SocialLinkForm;