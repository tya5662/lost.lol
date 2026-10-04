import { backendUrl } from '@/backendUrl';
import { User, Link as LinkType } from '../types';

export const BURL = backendUrl;
export const AUTH = `${backendUrl}/auth/me`;
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

const requestJson = async (path: string, init?: RequestInit): Promise<any> => {
  try {
    const response = await fetch(`${backendUrl}${path}`, init);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof data?.message === 'string'
          ? data.message
          : `Request failed (${response.status})`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the lost.lol server. Please try again in a moment.');
    }
    throw error;
  }
};

const submitAuth = async (
  path: 'register' | 'login',
  details: Record<string, string>
): Promise<AuthResponse> => {
  const data = await requestJson(`/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });

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
    const data = await requestJson(`/api/users/${encodeURIComponent(username)}`);
    return data as User;
  },

  async getUserLinks(userId: number): Promise<LinkType[]> {
    const data = await requestJson(`/api/links/user/${userId}`);
    return data as LinkType[];
  },

  async createLink(link: { userId: number | string; title: string; url: string }): Promise<LinkType> {
    const token = localStorage.getItem('token');
    return requestJson('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify(link),
    });
  },

  async updateLink(id: number, link: { title: string; url: string }): Promise<LinkType> {
    const token = localStorage.getItem('token');
    return requestJson(`/api/links/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify(link),
    });
  },

  async deleteLink(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    await requestJson(`/api/links/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
      },
    });
  },

  async reorderLinks(userId: number, linkIds: number[]): Promise<void> {
    const token = localStorage.getItem('token');
    await requestJson(`/api/links/reorder/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({ linkIds }),
    });
  },
};
