/**
 * Shared Types for Port Sudan Platform (Cloudflare Edition)
 */

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  profession?: string;
  bio?: string;
  location?: string;
  rating?: number;
  created_at: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  image_url?: string;
  author_id: string;
  status: 'active' | 'sold' | 'expired';
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: Profile;
}

export interface AIResponse {
  result: string;
  suggestions?: string[];
}
