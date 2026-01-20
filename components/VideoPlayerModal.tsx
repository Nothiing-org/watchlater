import React, { useEffect, useRef, useState } from 'react';
import { html } from 'htm/react';
import { geminiService } from '../services/geminiService.ts';

const VideoPlayerModal = ({ video, onClose, onFinished }) => {
  const [summary, setSummary] = useState<string | null>(video.metadata.summary || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const initPlayer = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        playerRef.current = new (window as any).YT.Player('yt-player-container', {
          videoId: video.youtubeId,
          playerVars: { autoplay: 1, modestbranding: 1, rel: 0, origin: window.location.origin },
          events: { onStateChange: (event: any) => { if (event.data === (window as any).YT.PlayerState.ENDED) onFinished(); } }
        });
      } else { setTimeout(initPlayer, 100); }
    };
    initPlayer();
    return () => { if (playerRef.current?.destroy) playerRef.current.destroy(); };
  }, [video.youtubeId, onFinished]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await geminiService.summarizeSignal(video.metadata.title, video.metadata.channelName);
      setSummary(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return html`
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 modal-backdrop bg-black/80 reveal" onClick=${onClose}>
      <div className="w-full max-w-7xl h-full flex flex-col lg:flex-row bg-black rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative border border-white/5" onClick=${(e) => e.stopPropagation()}>
        
        <!-- Player Area -->
        <div className="flex-[3] bg-black relative">
          <div id="yt-player-container" className="w-full h-full"></div>
          <button onClick=${onClose} className="absolute top-8 left-8 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-4 rounded-full backdrop-blur-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth=${3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- Intelligence Hub -->
        <div className="flex-1 bg-[#050505] border-l border-white/5 p-12 flex flex-col overflow-y-auto no-scrollbar">
          <div className="mb-12">
            <span className="text-[9px] font-bold label-wide text-white/30 tracking-[0.5em] block mb-4">ACTIVE SIGNAL</span>
            <h2 className="text-white text-2xl font-extrabold tracking-tight leading-tight">${video.metadata.title}</h2>
            <p className="text-zinc-500 text-[11px] font-bold label-wide mt-3">${video.metadata.channelName}</p>
          </div>

          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-[9px] font-bold label-wide text-white/60">INTELLIGENCE SYNTHESIS</h3>
              <button 
                onClick=${handleAnalyze}
                disabled=${isAnalyzing}
                className="text-[8px] font-bold label-wide bg-white text-black px-4 py-2 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
              >
                ${isAnalyzing ? 'SYNTHESIZING...' : summary ? 'RE-CALIBRATE' : 'DEEP DIVE'}
              </button>
            </div>

            <div className="prose prose-invert prose-sm">
              ${isAnalyzing ? html`
                <div className="space-y-6 animate-pulse">
                  <div className="h-2.5 bg-white/5 rounded-full w-3/4"></div>
                  <div className="h-2.5 bg-white/5 rounded-full w-full"></div>
                  <div className="h-2.5 bg-white/5 rounded-full w-5/6"></div>
                  <div className="h-2.5 bg-white/5 rounded-full w-2/3"></div>
                </div>
              ` : summary ? html`
                <div className="text-zinc-400 leading-relaxed text-[13px] whitespace-pre-wrap font-medium">
                  ${summary}
                </div>
              ` : html`
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                   <div className="h-1 w-1 bg-white rounded-full mb-6"></div>
                   <p className="text-[10px] font-bold label-wide text-zinc-400">Requesting AI Analysis</p>
                </div>
              `}
            </div>
          </div>

          <div className="mt-12 space-y-4">
             <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
               <span className="text-[8px] font-bold label-wide text-white/30 block mb-4 uppercase tracking-[0.3em]">Focus Sector</span>
               <div className="flex flex-wrap gap-2">
                 <span className="text-[10px] font-bold bg-white/10 text-white/80 px-3 py-1.5 rounded-xl border border-white/5">${video.metadata.category || 'General Intel'}</span>
                 <span className="text-[10px] font-bold bg-white/10 text-white/80 px-3 py-1.5 rounded-xl border border-white/5">${video.metadata.duration}</span>
               </div>
             </div>
             <p className="text-[9px] font-bold label-wide text-zinc-600 text-center uppercase tracking-[0.4em] pt-4">llumina OS v2.4.1</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default VideoPlayerModal;