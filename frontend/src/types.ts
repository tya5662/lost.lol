import { LucideIcon } from "lucide-react";

export type UserRole = 'owner' | 'co-owner' | 'staff' | 'member';

export interface User {
  _id: string,
  id: number;
  username: string;
  name: string;
  description: string,
  email: string;
  profilePicture?: string
  backgroundImage?: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
  bio?: string;
  totalVisit?: number;
  role?: UserRole;
  premium?: boolean;
  premiumSince?: string;
  badges?: string[];
  location?: string;
  showLocation?: boolean;
  showDiscordPresence?: boolean;
  discordUsername?: string;
  profileOpacity?: number;
  profileBlur?: number;
  profileGradient?: boolean;
  monochromeIcons?: boolean;
  animatedTitle?: boolean;
  usernameEffect?: string;
  backgroundEffect?: string;
  cursorEffect?: string;
  fontFamily?: string;
  typewriterEnabled?: boolean;
  typewriterTexts?: string[];
  pageEnterText?: string;
  pageClickSound?: string;
  audioUrl?: string;
  audioTitle?: string;
  audioMedia?: string;
  layout?: string;
  metadataTitle?: string;
  metadataDescription?: string;
  metadataImage?: string;
  aliases?: string[];
  secondTab?: {
    enabled?: boolean;
    title?: string;
    widgets?: unknown[];
  };
}

export interface Link {
  _id: number,
  id: number;
  userId?: number;
  title: string;
  url: string;
  platform: string;
  order?: number;
}

export interface ProfileSettings {
  bio: string;
  profilePicture?: File;
  backgroundMedia?: File;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: LucideIcon | string;
  placeholder: string;
  baseUrl: string;
}

export interface LinkFormData {
  title: string;
  url: string;
}