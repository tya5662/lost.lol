import { RowDataPacket } from "mysql2/promise";

export interface User {
  id: string; // MongoDB uses _id as the identifier
  username: string;
  name: string;
  email: string;
  profilePicture?: string;
  description?: string;
  backgroundMedia?: string;
  backgroundType?: 'image' | 'video';
  createdAt: Date;
  updatedAt?: Date;
  totalVisit: number;
}



export interface Link {
  id: number;
  userId: number;
  title: string;
  url: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
}



export interface UserWithLinks extends RowDataPacket {
  userId: number;
  username: string;
  name: string;
  description: string;
  profilePicture: Buffer | null;
  backgroundMedia: Buffer | null;
  backgroundType: 'image' | 'video' | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  linkId: number | null;
  linkTitle: string | null;
  linkUrl: string | null;
  totalVisit: number
}