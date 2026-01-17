export interface UserState {
  address: string | null;
  isConnected: boolean;
  isRegistered: boolean;
  isDead: boolean;
  lastCheckIn: number; // Timestamp
  timeOfDeath: number; // Timestamp
  balance: string; // In MON
  heir: string;
  lastWords: string;
  tombstoneId?: number; // Added to match contract
}

export interface GraveyardEntry {
  id: number;
  address: string;
  deathTime: string;
  lastWords: string;
  legacyAmount: string;
}

export const TIME_TO_DIE_SECONDS = 7 * 24 * 60 * 60; // 7 Days
// For demo purposes, we can speed this up if needed, but keeping realistic for now.