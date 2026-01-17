import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-zinc-800 py-8 text-center text-xs text-zinc-500">
      <p className="mb-4">
        "记住：每天签到，否则你就只是一个钱包地址。"
        <br/>
        <span className="opacity-50 italic">"Remember: Check in daily, or you're just a wallet address to us."</span>
      </p>
      
      <div className="flex justify-center gap-6 mb-4">
        <a href="#" className="flex items-center hover:text-white transition-colors gap-1">
          <span>0xDeaD...BeeF</span>
          <ExternalLink size={12} />
        </a>
        <a href="#" className="flex items-center hover:text-white transition-colors gap-1">
          <Github size={14} />
          <span>Source Code</span>
        </a>
      </div>
      
      <p className="opacity-30">
        WOW SI LE MA? &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
};

export default Footer;