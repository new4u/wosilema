import { UserState, TIME_TO_DIE_SECONDS } from '../types';

import { BrowserProvider, Contract, JsonRpcProvider, formatEther, parseEther, toBeHex } from 'ethers';

import AmIDeadYetArtifact from '../abi/AmIDeadYet.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ABI = (AmIDeadYetArtifact as any).abi;

const getRpcUrl = (): string | undefined => {
  return (import.meta.env.VITE_RPC_URL as string | undefined) || undefined;
};

const getExpectedChainId = (): number | undefined => {
  const v = import.meta.env.VITE_CHAIN_ID as string | undefined;
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const getMonadNetworkConfig = () => {
  const chainId = getExpectedChainId();
  const rpcUrl = getRpcUrl();
  if (!chainId || !rpcUrl) return null;

  return {
    chainId: toBeHex(chainId),
    chainName: 'Monad Testnet',
    nativeCurrency: {
      name: 'Monad',
      symbol: 'MON',
      decimals: 18
    },
    rpcUrls: [rpcUrl],
    blockExplorerUrls: (import.meta.env.VITE_EXPLORER_URL ? [import.meta.env.VITE_EXPLORER_URL as string] : [])
  };
};

const getConfiguredContractAddress = (): string => {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;
  if (!address) {
    throw new Error('Missing VITE_CONTRACT_ADDRESS in .env.local');
  }
  return address;
};

const assertChain = async (provider: BrowserProvider) => {
  const expected = getExpectedChainId();
  if (!expected) return;
  const net = await provider.getNetwork();
  const current = Number(net.chainId);
  if (current !== expected) {
    throw new Error(`你走错了黄泉路：当前 chainId=${current}，目标 chainId=${expected}`);
  }
};

const getProvider = (): BrowserProvider => {
  if (!window.ethereum) {
    throw new Error('没有检测到钱包注入（window.ethereum）。请安装/启用 MetaMask。');
  }
  return new BrowserProvider(window.ethereum);
};

const getReadOnlyProvider = (): JsonRpcProvider => {
  const rpcUrl = getRpcUrl();
  if (!rpcUrl) {
    throw new Error('缺少 VITE_RPC_URL：没钱包时无法只读访问链上状态。');
  }
  return new JsonRpcProvider(rpcUrl);
};

const getContract = async (withSigner: boolean): Promise<Contract> => {
  const address = getConfiguredContractAddress();
  if (withSigner) {
    const provider = getProvider();
    await assertChain(provider);
    const signer = await provider.getSigner();
    return new Contract(address, CONTRACT_ABI, signer);
  }

  if (window.ethereum) {
    const provider = getProvider();
    await assertChain(provider);
    return new Contract(address, CONTRACT_ABI, provider);
  }

  const ro = getReadOnlyProvider();
  return new Contract(address, CONTRACT_ABI, ro);
};

const getAccount = async (): Promise<string> => {
  const provider = getProvider();
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return await signer.getAddress();
};

export const connectWallet = async (): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('你连面对死亡的钱包都没有？安装 MetaMask 再来。');
  }

  const provider = getProvider();
  await provider.send('eth_requestAccounts', []);

  const expected = getExpectedChainId();
  const monadConfig = getMonadNetworkConfig();

  if (expected) {
    const net = await provider.getNetwork();
    const current = Number(net.chainId);
    if (current !== expected) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: toBeHex(expected) }]
        });
      } catch (switchError: any) {
        if (switchError?.code === 4902 && monadConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [monadConfig]
          });
        } else {
          throw new Error('切换到 Monad 失败：你还没准备好死在这条链上。');
        }
      }
    }
  }

  return await getAccount();
};

export const getUserInfo = async (): Promise<UserState> => {
  if (!window.ethereum) {
    throw new Error('想查“你自己”的生死？先连接钱包。');
  }
  const address = await getAccount();
  return await getUserInfoByAddress(address, true);
};

export const getUserInfoByAddress = async (address: string, isConnected = false): Promise<UserState> => {
  const contract = await getContract(false);

  const u = await contract.users(address);
  const isRegistered = Boolean(u.isRegistered);
  const isDead = Boolean(u.isDead);
  const lastCheckIn = Number(u.lastCheckIn);
  const timeOfDeath = lastCheckIn > 0 ? lastCheckIn + TIME_TO_DIE_SECONDS : 0;

  return {
    address,
    isConnected,
    isRegistered,
    isDead,
    lastCheckIn,
    timeOfDeath,
    balance: formatEther(u.balance ?? 0n),
    heir: (u.heir ?? '') as string,
    lastWords: (u.lastWords ?? '') as string,
    tombstoneId: Number(u.tombstoneId ?? 0n)
  };
};

export const registerUser = async (deposit: string, lastWords: string): Promise<UserState> => {
  const provider = getProvider();
  await assertChain(provider);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const contract = new Contract(getConfiguredContractAddress(), CONTRACT_ABI, signer);
  const value = parseEther(deposit);
  const tx = await contract.register(lastWords, { value });
  await tx.wait();
  return await getUserInfoByAddress(address, true);
};

export const checkIn = async (): Promise<UserState> => {
  const provider = getProvider();
  await assertChain(provider);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const contract = new Contract(getConfiguredContractAddress(), CONTRACT_ABI, signer);
  const tx = await contract.checkIn();
  await tx.wait();
  return await getUserInfoByAddress(address, true);
};

export const setHeir = async (heirAddress: string): Promise<UserState> => {
  const provider = getProvider();
  await assertChain(provider);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const contract = new Contract(getConfiguredContractAddress(), CONTRACT_ABI, signer);
  const tx = await contract.setHeir(heirAddress);
  await tx.wait();
  return await getUserInfoByAddress(address, true);
};

export const addToEstate = async (amount: string): Promise<UserState> => {
  const provider = getProvider();
  await assertChain(provider);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const contract = new Contract(getConfiguredContractAddress(), CONTRACT_ABI, signer);
  const value = parseEther(amount);
  const tx = await contract.addToEstate({ value });
  await tx.wait();
  return await getUserInfoByAddress(address, true);
};

export const declareDeath = async (target?: string): Promise<UserState> => {
  const provider = getProvider();
  await assertChain(provider);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const contract = new Contract(getConfiguredContractAddress(), CONTRACT_ABI, signer);
  const user = target ?? address;
  const tx = await contract.declareDeath(user);
  await tx.wait();
  return await getUserInfoByAddress(address, true);
};
