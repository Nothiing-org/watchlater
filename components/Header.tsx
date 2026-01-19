import React from 'react';
import { html } from 'htm/react';

const Header = () => {
  return html`
    <header className="py-10 px-6 max-w-7xl mx-auto flex justify-between items-center reveal">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="h-2 w-2 bg-black rounded-full group-hover:scale-125 transition-transform"></div>
        <span className="text-2xl font-extrabold tracking-tighter">llumina</span>
        <img 
          src="https://i.imgur.com/4pZfxkf.png" 
          alt="Logo" 
          className="h-6 ml-2 hidden sm:block grayscale contrast-125"
        />
      </div>
      <div className="text-[10px] font-bold label-wide text-zinc-500">
        Personal Signal Library
      </div>
    </header>
  `;
};

export default Header;