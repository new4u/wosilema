import { UserState, TIME_TO_DIE_SECONDS } from '../types';

// In a real app, you would import ethers here
// import { ethers } from 'ethers';

// Mock state to simulate blockchain persistence during session
let mockState: UserState = {
  address: null,
  isConnected: false,
  isRegistered: false,
  isDead: false,
  lastCheckIn: 0,
  timeOfDeath: 0,
  balance: "0.0",
  heir: "",
  lastWords: "",
  tombstoneId: 0
};

// Mock "Quote Hash" map to enforce uniqueness
const quoteRegistry = new Set<string>();

export const connectWallet = async (): Promise<string> => {
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 800));
  mockState.isConnected = true;
  mockState.address = "0x71C...9A23"; // Mock address
  return mockState.address;
};

export const getUserInfo = async (): Promise<UserState> => {
  // NOTE: In the real contract, 'declareDeath' must be called externally.
  // Here we simulate the view state.
  return { ...mockState };
};

// Updated signature to match Contract: register(string memory _lastWords)
export const registerUser = async (deposit: string, lastWords: string): Promise<UserState> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (quoteRegistry.has(lastWords)) {
    throw new Error("Quote already taken! Be original.");
  }
  
  const now = Math.floor(Date.now() / 1000);
  mockState.isRegistered = true;
  mockState.balance = deposit;
  mockState.lastCheckIn = now;
  mockState.timeOfDeath = now + TIME_TO_DIE_SECONDS;
  mockState.isDead = false;
  mockState.lastWords = lastWords;
  
  quoteRegistry.add(lastWords);
  
  return { ...mockState };
};

export const checkIn = async (): Promise<UserState> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const now = Math.floor(Date.now() / 1000);
  mockState.lastCheckIn = now;
  mockState.timeOfDeath = now + TIME_TO_DIE_SECONDS;
  return { ...mockState };
};

// NOTE: The provided contract snippet does not strictly have setHeir/addToEstate,
// but we keep them to maintain app functionality as implied by the "heir" field in struct.
export const setHeir = async (heirAddress: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  mockState.heir = heirAddress;
  return heirAddress;
};

export const addToEstate = async (amount: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const current = parseFloat(mockState.balance);
  const added = parseFloat(amount);
  mockState.balance = (current + added).toFixed(4);
  return mockState.balance;
};

// New function based on contract interface
export const declareDeath = async (): Promise<UserState> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const now = Math.floor(Date.now() / 1000);
  if (now > mockState.timeOfDeath && mockState.isRegistered && !mockState.isDead) {
    mockState.isDead = true;
    mockState.tombstoneId = Math.floor(Math.random() * 10000);
    // Estate transfer logic would happen here on chain
  }
  
  return { ...mockState };
};

// Revive removed as it is not in the contract interface (Death is final)
