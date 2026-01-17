import React, { useState, useEffect } from 'react';
import { Ghost, Wallet, ArrowRight } from 'lucide-react';
import StatusCard from './components/StatusCard';
import ActionPanel from './components/ActionPanel';
import Graveyard from './components/Graveyard';
import Footer from './components/Footer';
import * as ContractService from './services/contractService';
import { UserState } from './types';

function App() {
  const [user, setUser] = useState<UserState>({
    address: null,
    isConnected: false,
    isRegistered: false,
    isDead: false,
    lastCheckIn: 0,
    timeOfDeath: 0,
    balance: "0.0",
    heir: "",
    lastWords: ""
  });
  const [loading, setLoading] = useState(false);
  const [registerWords, setRegisterWords] = useState("");
  const [heirFromUrl, setHeirFromUrl] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const heir = params.get('heir');
    if (heir) setHeirFromUrl(heir);
  }, []);

  // Poll for death status if registered
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (user.isRegistered && !user.isDead) {
      interval = setInterval(async () => {
        // In a real app we might call declareDeath here or check status
        const updated = await ContractService.getUserInfo();
        setUser(updated);
        
        // Auto-check death for demo purposes since contract requires external trigger
        const now = Math.floor(Date.now() / 1000);
        if (updated.timeOfDeath > 0 && now > updated.timeOfDeath && !updated.isDead) {
           await ContractService.declareDeath();
           const deadState = await ContractService.getUserInfo();
           setUser(deadState);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [user.isRegistered, user.isDead]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await ContractService.connectWallet();
      const info = await ContractService.getUserInfo();
      setUser(info);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerWords.trim()) {
      alert("Please enter your unique last words.");
      return;
    }
    setLoading(true);
    try {
      // Deposit 0.1 MON and register unique words
      const updated = await ContractService.registerUser("0.1", registerWords);
      setUser(updated);
      setRegisterWords("");
      await refreshUser();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const info = await ContractService.getUserInfo();
    setUser(info);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-rose-900 selection:text-white flex flex-col items-center py-10 px-4">
      
      {/* Header */}
      <header className="mb-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3 mb-4">
          <Ghost size={40} className="text-white" />
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">
            我死了吗？
            <span className="block text-xl md:text-2xl font-light text-rose-500 mt-2 font-mono">
              / WOW SI LE MA?
            </span>
          </h1>
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <p className="text-zinc-400 text-sm md:text-base">
            怕死吗? 多”死”几次就好啦~
          </p>
          <p className="text-zinc-600 text-xs uppercase tracking-widest">
            Check in daily. Prove you're alive. Or your money belongs to someone else.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl">
        
        {!user.isConnected ? (
          // STATE: Not Connected
          <div className="border border-zinc-800 bg-zinc-900/30 p-12 text-center rounded-sm">
            <h2 className="text-2xl font-bold mb-2 text-white">连接钱包 / Connect Soul</h2>
            <p className="mb-8 text-zinc-400 text-sm">
              把命交给区块链，开始你的死亡倒计时。<br/>
              <span className="opacity-50 text-xs">Interact with the blockchain to start your death timer.</span>
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="group bg-white text-black px-8 py-3 font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 mx-auto"
            >
              {loading ? 'CONNECTING...' : (
                <>
                  <Wallet size={18} />
                  <span>连接钱包 / CONNECT</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ) : !user.isRegistered ? (
          // STATE: Connected, Not Registered
          <div className="border border-zinc-800 bg-zinc-900/30 p-8 md:p-12 text-center rounded-sm">
            <div className="mb-4 text-zinc-500 font-mono text-xs">{user.address}</div>
            <h2 className="text-2xl font-bold mb-2 text-white">你还不存在 / You Don't Exist</h2>
            <p className="mb-6 text-zinc-400 text-sm">
              注册即锁定你的终极遗言（独一无二）。<br/>
              <span className="opacity-50 text-xs">Claim your unique last words and deposit funds to start.</span>
            </p>
            
            <div className="max-w-sm mx-auto mb-6">
              <label className="block text-left text-xs text-zinc-500 mb-1 uppercase tracking-wider">遗言 / Last Words (Immutable)</label>
              <textarea 
                value={registerWords}
                onChange={(e) => setRegisterWords(e.target.value)}
                placeholder="Write something worth dying for..."
                className="w-full bg-black border border-zinc-700 p-3 text-sm focus:border-emerald-500 outline-none h-20 resize-none mb-2 placeholder:text-zinc-700"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !registerWords}
              className="bg-emerald-600 text-white px-8 py-3 font-bold hover:bg-emerald-500 transition-all border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'BIRTHING...' : '出生 / DEPOSIT 0.1 MON'}
            </button>
          </div>
        ) : (
          // STATE: Registered (Alive or Dead)
          <>
            <StatusCard user={user} />
            <ActionPanel user={user} refreshUser={refreshUser} initialHeir={heirFromUrl} />
          </>
        )}

        <Graveyard />
        
      </main>

      <Footer />
    </div>
  );
}

export default App;