import { LucideIcon } from "lucide-react";

// types.ts

// interface ProfilePicture {
//   data: string,
//   type: string
// }

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