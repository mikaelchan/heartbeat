export type UserGender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: string;
  username: string;
  gender: UserGender;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
