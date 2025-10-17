export type UserGender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: string;
  username: string;
  gender: UserGender;
  partnerId: string | null;
  pairingCode: string | null;
  relationshipConfirmedAt: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export type PairingMode = 'create' | 'join';

export interface RegisterPayload {
  username: string;
  password: string;
  gender: UserGender;
  pairingMode: PairingMode;
  pairCode?: string;
  relationshipConfirmedAt?: string;
}
