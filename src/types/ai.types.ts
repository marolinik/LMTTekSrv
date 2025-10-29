export interface ServerSpec {
  category: string;
  items: SpecItem[];
}

export interface SpecItem {
  feature: string;
  value: string | string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface SocialPost {
  platform: string;
  content: string;
}

export interface SocialMediaOutput {
  posts: SocialPost[];
  enhancedImageUrl?: string;
  videoUrl?: string;
}

export interface Lead {
  company: string;
  industry: string;
  location: string;
  reason: string;
}
