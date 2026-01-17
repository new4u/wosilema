import React from 'react';
import { Skull, DollarSign, Clock } from 'lucide-react';
import { GraveyardEntry } from '../types';

const MOCK_DEAD: GraveyardEntry[] = [
  { id: 1, address: '0x88...B1A2', deathTime: '2小时前 / 2h ago', lastWords: '以为还有时间... / I thought I had time...', legacyAmount: '12.5' },
  { id: 2, address: '0x12...99CC', deathTime: '昨天 / Yesterday', lastWords: '拿住直到归零。 / HODL until death.', legacyAmount: '0.4' },
  { id: 3, address: '0xFA...4421', deathTime: '2天前 / 2d ago', lastWords: '把我的私钥烧了。 / Burn my keys.', legacyAmount: '104.0' },
];

const Graveyard: React.FC = () => {
  return (
    <div className="mt-16 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-zinc-400 border-b border-zinc-800 pb-2">
        <Skull size={18} />
        <h3 className="uppercase tracking-widest text-sm font-bold">最近挂掉的人 / Recent Departures</h3>
      </div>

      <div className="space-y-4">
        {MOCK_DEAD.map((soul) => (
          <div key={soul.id} className="group border border-zinc-800 p-4 hover:border-zinc-600 transition-colors bg-zinc-900/30">
            <div className="flex justify-between items-start mb-2">
              <span className="text-zinc-500 text-sm font-mono">{soul.address}</span>
              <span className="text-rose-900 text-xs bg-rose-900/10 px-2 py-1 uppercase tracking-wider">已死 / Deceased</span>
            </div>
            <p className="text-zinc-300 italic mb-3">"{soul.lastWords}"</p>
            <div className="flex gap-4 text-xs text-zinc-600">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{soul.deathTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={12} />
                <span>遗产/Legacy: {soul.legacyAmount} ETH</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-6">
        <button className="text-xs text-zinc-600 hover:text-white underline decoration-zinc-800 underline-offset-4">
          查看完整墓地 / View Full Cemetery
        </button>
      </div>
    </div>
  );
};

export default Graveyard;