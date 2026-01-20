import React from 'react';
import { html } from 'htm/react';
import { VideoStatus } from '../types.ts';

const VideoCard = ({ 
  video, 
  onRemove, 
  onPlay, 
  index, 
  onDragStart, 
  onDragOver, 
  onDrop,
  isDraggable = true
}) => {
  const isMusic = video.metadata.isMusic;
  const isWatched = video.status === VideoStatus.WATCHED;

  return html`
    <div 
      className=${`premium-card p-8 flex flex-col h-full reveal group/card ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`} 
      style=${{ animationDelay: `${0.1 + (index * 0.05)}s` }}
      draggable=${isDraggable}
      onDragStart=${onDragStart}
      onDragOver=${onDragOver}
      onDrop=${onDrop}
    >
      <div 
        className="relative aspect-video rounded-2xl overflow-hidden mb-6 group cursor-pointer"
        onClick=${(e) => { e.stopPropagation(); onPlay(video); }}
      >
        <img 
          src=${video.metadata.thumbnailUrl} 
          alt=${video.metadata.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white text-black p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
            ${isMusic ? html`
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            ` : html`
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            `}
          </div>
        </div>
        
        <div className="absolute top-4 left-4 flex gap-2">
          ${isMusic && html`
            <div className="bg-white/90 backdrop-blur-md text-black text-[8px] font-extrabold label-wide px-2 py-1 rounded-lg tracking-widest border border-zinc-100">
              AUDIO
            </div>
          `}
          <div className="bg-black/80 backdrop-blur-md text-white text-[8px] font-extrabold label-wide px-2 py-1 rounded-lg tracking-widest border border-white/10 uppercase">
            ${video.metadata.category || 'SIGNAL'}
          </div>
        </div>

        ${isWatched && html`
          <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md text-white text-[8px] font-extrabold label-wide px-2 py-1 rounded-lg tracking-widest border border-white/10">
            ARCHIVED
          </div>
        `}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 
            className="text-[15px] font-bold tracking-tight leading-tight cursor-pointer hover:underline decoration-1 underline-offset-4 line-clamp-2"
            onClick=${(e) => { e.stopPropagation(); onPlay(video); }}
          >
            ${video.metadata.title}
          </h3>
          <button 
            onClick=${(e) => { e.stopPropagation(); onRemove(video.id); }}
            className="text-zinc-300 hover:text-black transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth=${2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-[10px] font-bold label-wide text-zinc-400 mb-6">
          ${video.metadata.channelName} • ${video.metadata.duration}
        </p>

        <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            ${isDraggable && html`
              <svg className="text-zinc-200 group-hover/card:text-zinc-400 transition-colors" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
              </svg>
            `}
            <span className="text-[9px] font-bold label-wide text-zinc-300">
              ID: ${video.id.split('-')[0]}
            </span>
          </div>
          <div className=${`h-1 w-1 rounded-full ${isWatched ? 'bg-zinc-100 shadow-inner' : 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.2)]'}`}></div>
        </div>
      </div>
    </div>
  `;
};

export default VideoCard;