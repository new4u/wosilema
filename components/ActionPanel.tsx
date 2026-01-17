import React, { useState } from 'react';
import { UserState } from '../types';
import { HeartPulse, UserPlus, Coins, Quote, Lock } from 'lucide-react';
import * as ContractService from '../services/contractService';

interface Props {
  user: UserState;
  refreshUser: () => void;
}

const ActionPanel: React.FC<Props> = ({ user, refreshUser }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [inputs, setInputs] = useState({
    heir: '',
    estate: ''
  });

  const handleAction = async (action: string, callback: () => Promise<any>) => {
    setLoading(action);
    try {
      await callback();
      refreshUser();
      // Reset inputs if needed
      if(action === 'heir') setInputs(prev => ({...prev, heir: ''}));
      if(action === 'estate') setInputs(prev => ({...prev, estate: ''}));
    } catch (e) {
      console.error(e);
      alert("Transaction failed.");
    } finally {
      setLoading(null);
    }
  };

  if (user.isDead) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center p-8 border border-zinc-800 bg-zinc-900/50">
        <h3 className="text-xl font-bold text-white mb-2">游戏结束 / GAME OVER</h3>
        <p className="text-zinc-400 mb-4">
          你的 NFT 墓碑已铸造。<br/>
          <span className="text-xs opacity-50">Tombstone NFT #{user.tombstoneId || '???'} Minted.</span>
        </p>
        <div className="inline-block border border-zinc-800 bg-black p-4 rotate-1">
          <p className="font-mono text-zinc-500 text-xs mb-2">R.I.P</p>
          <p className="text-lg text-white italic">"{user.lastWords}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Primary Action: Check In */}
      <div className="md:col-span-2">
        <button
          onClick={() => handleAction('checkIn', ContractService.checkIn)}
          disabled={loading !== null}
          className="w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-emerald-500 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all duration-300 group"
        >
          {loading === 'checkIn' ? (
            <span className="text-2xl font-bold animate-pulse">正在验证生命...</span>
          ) : (
            <>
              <HeartPulse size={48} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="text-2xl font-bold tracking-widest">我还活着 / I'M ALIVE</span>
              <span className="text-xs opacity-70">点击签到续命 / Click to confirm heartbeat</span>
            </>
          )}
        </button>
      </div>

      {/* Set Heir */}
      <div className="border border-zinc-800 p-4 bg-zinc-900/50">
        <div className="flex items-center gap-2 mb-4 text-zinc-300">
          <UserPlus size={16} />
          <h3 className="text-sm font-bold uppercase">设置继承人 / Heir</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-3">当前 / Current: {user.heir ? `${user.heir.slice(0,6)}...${user.heir.slice(-4)}` : "无 / None"}</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="0x..." 
            value={inputs.heir}
            onChange={(e) => setInputs({...inputs, heir: e.target.value})}
            className="flex-1 bg-black border border-zinc-700 p-2 text-sm focus:border-white outline-none placeholder:text-zinc-700"
          />
          <button 
            onClick={() => handleAction('heir', () => ContractService.setHeir(inputs.heir))}
            disabled={!inputs.heir || loading !== null}
            className="bg-zinc-800 text-white px-3 py-2 text-xs hover:bg-white hover:text-black disabled:opacity-50"
          >
            设置/SET
          </button>
        </div>
      </div>

      {/* Add Estate */}
      <div className="border border-zinc-800 p-4 bg-zinc-900/50">
        <div className="flex items-center gap-2 mb-4 text-zinc-300">
          <Coins size={16} />
          <h3 className="text-sm font-bold uppercase">追加遗产 / Estate</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-3">当前余额 / Balance: {user.balance} ETH</p>
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="0.0" 
            value={inputs.estate}
            onChange={(e) => setInputs({...inputs, estate: e.target.value})}
            className="flex-1 bg-black border border-zinc-700 p-2 text-sm focus:border-white outline-none placeholder:text-zinc-700"
          />
          <button 
            onClick={() => handleAction('estate', () => ContractService.addToEstate(inputs.estate))}
            disabled={!inputs.estate || loading !== null}
            className="bg-zinc-800 text-white px-3 py-2 text-xs hover:bg-white hover:text-black disabled:opacity-50"
          >
            追加/ADD
          </button>
        </div>
      </div>

      {/* View Immutable Last Words */}
      <div className="md:col-span-2 border border-zinc-800 p-4 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2 text-zinc-500">
          <div className="flex items-center gap-2">
            <Quote size={16} />
            <h3 className="text-sm font-bold uppercase">我的遗言 / Last Words</h3>
          </div>
          <div className="flex items-center gap-1 text-xs opacity-50">
            <Lock size={12} />
            <span>不可更改 / IMMUTABLE</span>
          </div>
        </div>
        <div className="p-4 bg-black border border-zinc-800">
          <p className="text-lg italic text-zinc-300 text-center">"{user.lastWords}"</p>
        </div>
      </div>

    </div>
  );
};

export default ActionPanel;