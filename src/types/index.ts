export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  neighborhood?: string;
  phone?: string;
  bio?: string;
  is_verified: boolean;
  is_field_verified: boolean;
  verification_image?: string;
  created_at: string;
}

export interface Ad {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  type: 'offer' | 'request';
  profession: string;
  neighborhood: string;
  image_url?: string;
  is_premium: boolean;
  is_productive: boolean;
  is_training: boolean;
  status: 'active' | 'draft' | 'archived';
  avg_rating: number;
  created_at: string;
  profiles?: Partial<Profile>;
}

export interface ForumPost {
  id: string;
  user_id: string;
  content: string;
  profession?: string;
  neighborhood?: string;
  is_urgent: boolean;
  created_at: string;
  profiles?: Partial<Profile>;
}

export interface Rating {
  id: string;
  ad_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: Partial<Profile>;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminMessage {
  id: string;
  user_id: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export interface FieldVisitRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
