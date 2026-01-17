import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

const MONAD_RPC_URL = process.env.MONAD_RPC_URL || '';
const MONAD_CHAIN_ID = process.env.MONAD_CHAIN_ID ? Number(process.env.MONAD_CHAIN_ID) : 0;
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

if (!MONAD_RPC_URL) {
  throw new Error('Missing MONAD_RPC_URL in smart-contract/.env');
}

if (!MONAD_CHAIN_ID) {
  throw new Error('Missing MONAD_CHAIN_ID in smart-contract/.env');
}

if (!PRIVATE_KEY) {
  throw new Error('Missing PRIVATE_KEY in smart-contract/.env');
}

if (!/^[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  throw new Error('Invalid PRIVATE_KEY: expected 64 hex chars (32 bytes) without 0x');
}

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    monad: {
      url: MONAD_RPC_URL,
      chainId: MONAD_CHAIN_ID,
      accounts: [PRIVATE_KEY]
    }
  }
};

export default config;
