import { backendUrl } from '@/backendUrl';
import {
  User,
  Link as LinkType,
} from '../types';

export const BURL = backendUrl
export const AUTH = `${backendUrl}/auth/me`

export const API_URL = `${backendUrl}/api`;

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
  };
}

const submitAuth = async (path: 'register' | 'login', details: Record<string, string>): Promise<AuthResponse> => {
  const response = await fetch(`${backendUrl}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Unable to authenticate. Please try again.');
  }

  if (typeof data.token !== 'string') {
    throw new Error('The server returned an invalid authentication response.');
  }

  localStorage.setItem('token', data.token);
  return data as AuthResponse;
};


export const apiService = {
  async registerAccount(details: { email: string; username: string; password: string }): Promise<AuthResponse> {
    return submitAuth('register', details);
  },

  async loginAccount(details: { identifier: string; password: string }): Promise<AuthResponse> {
    return submitAuth('login', details);
  },

  async getUser(username: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${username}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async getUserLinks(userId: number): Promise<LinkType[]> {
    const response = await fetch(`${API_URL}/links/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch links');
    return response.json();
  },

  async createLink(link: { userId: number | string; title: string; url: string }): Promise<LinkType> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(link)
    });
    if (!response.ok) throw new Error('Failed to create link');
    return response.json();
  },

  async updateLink(id: number, link: { title: string; url: string }): Promise<LinkType> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/links/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(link),
    });

    if (!response.ok) {
      throw new Error('Failed to update link');
    }

    return response.json(); // Ensure the API response includes the updated link data
  }
,

  async deleteLink(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/links/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete link');
  },

  async reorderLinks(userId: number, linkIds: number[]): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/links/reorder/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ linkIds })
    });
    if (!response.ok) throw new Error('Failed to reorder links');
  }
};