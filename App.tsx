import React, { useState, useEffect } from 'react';
import { html } from 'htm/react';
import Header from './components/Header.js';
import AddVideoForm from './components/AddVideoForm.js';
import VideoCard from './components/VideoCard.js';
import { storageService } from './services/storageService.js';
import { geminiService } from './services/geminiService.js';
import { VideoStatus } from './types.js';

const App = () => {
  const [state, setState] = useState({
    videos: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const savedVideos = storageService.getVideos();
    setState(prev => ({ ...prev, videos: savedVideos }));
  }, []);

  const handleAddVideo = async (url) => {
    const youtubeId = url.match(/(?:v=|\/embed\/|\/watch\?v=|\/\d+\/|\/vi\/|youtu\.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/)?.[1];
    if (!youtubeId) throw new Error('Source Invalid');

    if (state.videos.some(v => v.youtubeId === youtubeId)) {
      alert('Signal already captured.');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const metadata = await geminiService.fetchVideoMetadata(url);
      const newVideo = {
        id: crypto.randomUUID(),
        youtubeId,
        url,
        metadata,
        status: VideoStatus.UNWATCHED,
        addedAt: Date.now(),
      };

      const updatedVideos = [newVideo, ...state.videos];
      storageService.saveVideos(updatedVideos);
      setState(prev => ({ ...prev, videos: updatedVideos, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleRemoveVideo = (id) => {
    const updatedVideos = state.videos.filter(v => v.id !== id);
    storageService.saveVideos(updatedVideos);
    setState(prev => ({ ...prev, videos: updatedVideos }));
  };

  return html`
    <div className="min-h-screen selection:bg-black selection:text-white pb-20">
      <${Header} />
      
      <main className="max-w-7xl mx-auto px-6">
        <section className="py-20 text-center max-w-3xl mx-auto">
          <h1 className="tight-heading text-6xl md:text-8xl font-extrabold mb-10 reveal">
            Signal,<br /><span className="text-zinc-200">not noise.</span>
          </h1>
          <p className="text-sm font-bold label-wide text-zinc-500 mb-12 reveal" style=${{ animationDelay: '0.05s' }}>
            Curate your intelligence
          </p>
          <${AddVideoForm} onAdd=${handleAddVideo} isLoading=${state.isLoading} />
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-4 mb-12 reveal" style=${{ animationDelay: '0.15s' }}>
            <h2 className="text-xs font-bold label-wide">Captured Library</h2>
            <div className="h-px flex-1 bg-zinc-100"></div>
            <span className="text-xs font-bold label-wide text-zinc-400">${state.videos.length} Units</span>
          </div>

          ${state.videos.length === 0 ? html`
            <div className="premium-card p-20 flex flex-col items-center justify-center reveal" style=${{ animationDelay: '0.2s' }}>
              <div className="h-1.5 w-1.5 bg-zinc-200 rounded-full mb-8"></div>
              <p className="text-xs font-bold label-wide text-zinc-400">System Standby. No Signals Found.</p>
            </div>
          ` : html`
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              ${state.videos.map((video, idx) => html`
                <${VideoCard} 
                  key=${video.id} 
                  video=${video} 
                  index=${idx}
                  onRemove=${handleRemoveVideo} 
                />
              `)}
            </div>
          `}
        </section>
      </main>

      <footer className="mt-32 border-t border-zinc-100 py-20 px-6 text-center reveal">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-1.5 w-1.5 bg-zinc-200 rounded-full"></div>
          <span className="text-[10px] font-bold label-wide text-zinc-400">llumina Intelligence Systems</span>
        </div>
        <p className="text-[9px] font-bold label-wide text-zinc-300">
          © 2026 llumina. All Rights Reserved.
        </p>
      </footer>
    </div>
  `;
};

export default App;