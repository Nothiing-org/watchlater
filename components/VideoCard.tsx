import React from 'react';
import { html } from 'htm/react';

const VideoCard = ({ video, onRemove, index }) => {
  const openInYouTube = () => {
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  return html`
    <div 
      className="premium-card p-10 flex flex-col h-full reveal" 
      style=${{ animationDelay: `${0.2 + (index * 0.05)}s` }}
    >
      <div 
        className="relative aspect-video rounded-2xl overflow-hidden mb-8 group cursor-pointer"
        onClick=${openInYouTube}
      >
        <img 
          src=${video.metadata.thumbnailUrl} 
          alt=${video.metadata.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white text-black p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        ${video.metadata.duration && html`
          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold label-wide px-2 py-1 rounded">
            ${video.metadata.duration}
          </div>
        `}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 
            className="text-lg font-bold tracking-tight leading-snug cursor-pointer hover:underline decoration-1 underline-offset-4"
            onClick=${openInYouTube}
          >
            ${video.metadata.title}
          </h3>
          <button 
            onClick=${() => onRemove(video.id)}
            className="text-zinc-400 hover:text-black transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth=${2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-[11px] font-bold label-wide text-zinc-500 mb-6">
          ${video.metadata.channelName}
        </p>

        <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
          <span className="text-[9px] font-bold label-wide text-zinc-400">
            Captured ${new Date(video.addedAt).toLocaleDateString()}
          </span>
          <div className="h-1.5 w-1.5 bg-black rounded-full"></div>
        </div>
      </div>
    </div>
  `;
};

export default VideoCard;