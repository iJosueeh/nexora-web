export interface UniversityEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: 'Debate' | 'Taller' | 'Feria' | 'Conferencia';
  attendeesCount: number;
  image?: string;
  isUserRegistered?: boolean;
  organizer?: {
    name: string;
    role: string;
  };
  communityLinks?: {
    whatsapp?: string;
    telegram?: string;
    discord?: string;
  };
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  location?: string;
  category: string;
  image?: string;
  organizerName?: string;
  organizerRole?: string;
  whatsapp?: string;
  telegram?: string;
  discord?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  category?: string;
  image?: string;
  organizerName?: string;
  organizerRole?: string;
  whatsapp?: string;
  telegram?: string;
  discord?: string;
}
