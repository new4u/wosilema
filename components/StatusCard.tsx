import React, { useEffect, useState } from 'react';
import { UserState } from '../types';
import { Activity, Skull, AlertTriangle } from 'lucide-react';

interface Props {
  user: UserState;
}

const StatusCard: React.FC<Props> = ({ user }) => {
  const [timeLeft, setTimeLeft] = useState<string>("--d --h --m --s");
  const [percentLeft, setPercentLeft] = useState(100);

  useEffect(() => {
    if (!user.isRegistered || user.isDead) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = user.timeOfDeath - now;

      if (diff <= 0) {
        setTimeLeft("0d 00h 00m 00s");
        setPercentLeft(0);
        return;
      }

      const days = Math.floor(diff / (3600 * 24));
      const hours = Math.floor((diff % (3600 * 24)) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft(`${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
      
      // Calculate percentage for bar (7 days = 604800 seconds)
      const totalSeconds = 7 * 24 * 60 * 60;
      setPercentLeft((diff / totalSeconds) * 100);

    }, 1000);

    return () => clearInterval(interval);
  }, [user.isRegistered, user.isDead, user.timeOfDeath]);

  if (user.isDead) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-12 border-2 border-rose-900 bg-rose-950/10 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-600 animate-pulse"></div>
        <Skull className="mx-auto text-rose-600 mb-4 h-16 w-16" />
        <h2 className="text-4xl font-bold text-rose-600 mb-2 uppercase tracking-widest">你死了 / YOU DIED</h2>
        <p className="text-zinc-400 mb-6">你的钱已经归别人了。<br/><span className="text-xs opacity-50">Your funds are being transferred to your heir.</span></p>
        <div className="bg-black/50 p-4 border border-rose-900/30 inline-block max-w-md">
          <p className="text-xs text-zinc-500 uppercase mb-2">遗言 / Last Words</p>
          <p className="text-xl italic text-zinc-300">"{user.lastWords || "我死得像个懦夫，什么也没留。"}"</p>
        </div>
      </div>
    );
  }

  const isCritical = percentLeft < 15; // Less than ~1 day

  return (
    <div className={`w-full max-w-2xl mx-auto mb-12 border-2 ${isCritical ? 'border-rose-500' : 'border-emerald-500'} bg-black p-8 relative overflow-hidden transition-colors duration-500`}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-1">生命体征 / Vital Status</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
            <span className={`text-xl font-bold ${isCritical ? 'text-rose-500' : 'text-emerald-500'}`}>
              {isCritical ? '高危 / CRITICAL' : '还活着 / ALIVE'}
            </span>
          </div>
        </div>
        <Activity className={isCritical ? 'text-rose-500' : 'text-emerald-500'} />
      </div>

      <div className="text-center py-6">
        <div className="text-4xl md:text-7xl font-bold font-mono tracking-tighter text-white mb-2 tabular-nums">
          {timeLeft}
        </div>
        <p className="text-zinc-500">距离死亡还有 / Time until execution</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-zinc-900 mt-6 relative">
        <div 
          className={`h-full transition-all duration-1000 ${isCritical ? 'bg-rose-600' : 'bg-emerald-600'}`}
          style={{ width: `${percentLeft}%` }}
        ></div>
      </div>
      
      {isCritical && (
        <div className="mt-4 flex items-center justify-center gap-2 text-rose-500 text-sm animate-bounce">
          <AlertTriangle size={16} />
          <span>你快死了。认真的。/ You are dying. Seriously.</span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;