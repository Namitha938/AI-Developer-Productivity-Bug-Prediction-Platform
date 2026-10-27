import { apiClient } from './client';

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  timezone: string;
  language: string;
  social_links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    stackoverflow?: string;
  };
  updated_at?: string | null;
}

export type ProfileUpdate = Partial<
  Pick<
    ProfileData,
    | 'full_name'
    | 'title'
    | 'company'
    | 'location'
    | 'bio'
    | 'timezone'
    | 'language'
    | 'social_links'
    | 'avatar_url'
  >
>;

export async function getProfile(): Promise<ProfileData> {
  const response = await apiClient.get<ProfileData>('/profile');
  return response.data;
}

export async function updateProfile(
  updates: ProfileUpdate,
): Promise<ProfileData> {
  const response = await apiClient.patch<ProfileData>(
    '/profile',
    updates,
  );
  return response.data;
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string; message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ avatar_url: string; message: string }>(
    '/profile/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function deleteAvatar(): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>('/profile/avatar');
  return response.data;
}
