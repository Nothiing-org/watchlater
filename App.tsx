import React, { useState, useEffect, useMemo } from 'react';
import { html } from 'htm/react';
import Header from './components/Header.tsx';
import AddVideoForm from './components/AddVideoForm.tsx';
import VideoCard from './components/VideoCard.tsx';
import VideoPlayerModal from './components/VideoPlayerModal.tsx';
import { storageService } from './services/storageService.ts';
import { geminiService } from './services/geminiService.ts';
import { VideoStatus, Video, Collection } from './types.ts';

// Premium SVG Icon Registry
const Icons = {
  Library: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>`,
  Insights: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  Discovery: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 8-4 4-4-4"/><path d="M12 12v6"/></svg>`,
  Export: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  Import: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  Brain: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A5 5 0 0 1 12 3a5 5 0 0 1 2.5-1 5.5 5.5 0 0 1 5.5 6.5A5.5 5.5 0 0 1 14.5 15a2 2 0 0 1-2 2 2 2 0 0 1-2-2A5.5 5.5 0 0 1 4 8.5 5.5 5.5 0 0 1 9.5 2Z"/><path d="M12 13V3"/></svg>`,
  Microscope: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0-14 0"/><path d="M9 14h2"/><path d="M9 12a2 2 0 1 1-2-2V6h6v4a2 2 0 1 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>`,
  Sparkles: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  Archive: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>`,
  ChevronRight: () => html`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
};

const CollectionIcon = ({ name }) => {
  switch (name) {
    case 'brain': return html`<${Icons.Brain} />`;
    case 'microscope': return html`<${Icons.Microscope} />`;
    case 'sparkles': return html`<${Icons.Sparkles} />`;
    case 'archive': return html`<${Icons.Archive} />`;
    default: return html`<${Icons.Brain} />`;
  }
};

const App = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'library' | 'dashboard' | 'discover'>('library');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [filter, setFilter] = useState<'all' | 'watched'>('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [discoveryResults, setDiscoveryResults] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    setVideos(storageService.getVideos());
    setCollections(storageService.getCollections());
  }, []);

  const handleAddVideo = async (url: string) => {
    const youtubeIdMatch = url.match(/(?:v=|\/embed\/|\/watch\?v=|\/\d+\/|\/vi\/|youtu\.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
    const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : null;
    if (!youtubeId || videos.some(v => v.youtubeId === youtubeId)) return;

    setIsLoading(true);
    try {
      const metadata = await geminiService.fetchVideoMetadata(url);
      const newVideo: Video = {
        id: crypto.randomUUID(),
        youtubeId, url, metadata,
        status: VideoStatus.UNWATCHED,
        addedAt: Date.now(),
        collectionId: activeCollectionId || 'default'
      };
      const updated = [newVideo, ...videos];
      setVideos(updated);
      storageService.saveVideos(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    storageService.saveVideos(updated);
  };

  const handleStatusToggle = (id: string) => {
    const updated = videos.map(v => 
      v.id === id ? { ...v, status: v.status === VideoStatus.WATCHED ? VideoStatus.UNWATCHED : VideoStatus.WATCHED } : v
    );
    setVideos(updated);
    storageService.saveVideos(updated);
  };

  const handleDiscovery = async () => {
    if (videos.length === 0) return alert("Archive is empty. Capture signals first to calibrate discovery.");
    setIsDiscovering(true);
    try {
      const results = await geminiService.discoverRelated(videos);
      setDiscoveryResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiscovering(false);
    }
  };

  const onDragStart = (idx: number) => {
    if (searchQuery || filter !== 'all') return;
    setDraggedIndex(idx);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const newVideos = [...videos];
    const [moved] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(targetIdx, 0, moved);
    setVideos(newVideos);
    storageService.saveVideos(newVideos);
    setDraggedIndex(null);
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch = v.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.metadata.channelName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || v.status === VideoStatus.WATCHED;
      const matchesCollection = !activeCollectionId || v.collectionId === activeCollectionId;
      return matchesSearch && matchesFilter && matchesCollection;
    });
  }, [videos, searchQuery, filter, activeCollectionId]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    videos.forEach(v => {
      const cat = v.metadata.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [videos]);

  return html`
    <div className="min-h-screen bg-white flex overflow-hidden">
      <!-- Modular Sidebar -->
      <aside className="w-20 md:w-64 border-r border-zinc-100 flex flex-col h-screen sticky top-0 bg-white z-40">
        <div className="p-8">
           <div className="flex items-center gap-3 mb-12 group cursor-default">
             <div className="h-4 w-4 bg-black rounded-full group-hover:scale-110 transition-transform"></div>
             <span className="text-xl font-extrabold tracking-tighter hidden md:block">llumina</span>
           </div>
           
           <nav className="space-y-10">
             <section>
               <h3 className="text-[9px] font-bold label-wide text-zinc-400 mb-4 hidden md:block">CORE ENGINE</h3>
               <div className="space-y-1">
                 <button onClick=${() => { setActiveView('library'); setActiveCollectionId(null); }} className=${`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${activeView === 'library' && !activeCollectionId ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}>
                   <${Icons.Library} /><span className="hidden md:block text-[11px] font-bold label-wide">Library</span>
                 </button>
                 <button onClick=${() => setActiveView('dashboard')} className=${`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${activeView === 'dashboard' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}>
                   <${Icons.Insights} /><span className="hidden md:block text-[11px] font-bold label-wide">Insights</span>
                 </button>
                 <button onClick=${() => setActiveView('discover')} className=${`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${activeView === 'discover' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}>
                   <${Icons.Discovery} /><span className="hidden md:block text-[11px] font-bold label-wide">Discovery</span>
                 </button>
               </div>
             </section>

             <section>
               <h3 className="text-[9px] font-bold label-wide text-zinc-400 mb-4 hidden md:block">ARCHIVES</h3>
               <div className="space-y-1 max-h-[30vh] overflow-y-auto no-scrollbar">
                 ${collections.map(c => html`
                   <button 
                     key=${c.id}
                     onClick=${() => { setActiveCollectionId(c.id); setActiveView('library'); }}
                     className=${`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${activeCollectionId === c.id ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}
                   >
                     <${CollectionIcon} name=${c.icon} /><span className="hidden md:block text-[11px] font-bold label-wide truncate">${c.name}</span>
                   </button>
                 `)}
               </div>
             </section>
           </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-zinc-50">
          <button onClick=${storageService.exportData} className="w-full text-[9px] font-bold label-wide text-zinc-400 hover:text-black transition-colors mb-4 flex items-center gap-2">
            <${Icons.Export} /> <span className="hidden md:inline">EXPORT VAULT</span>
          </button>
          <label className="w-full text-[9px] font-bold label-wide text-zinc-400 hover:text-black transition-colors flex items-center gap-2 cursor-pointer">
            <${Icons.Import} /> <span className="hidden md:inline">IMPORT VAULT</span>
            <input type="file" className="hidden" accept=".json" onChange=${async (e) => {
              if (e.target.files?.[0]) {
                const ok = await storageService.importData(e.target.files[0]);
                if (ok) window.location.reload();
              }
            }} />
          </label>
        </div>
      </aside>

      <!-- Dynamic Viewport -->
      <main className="flex-1 min-h-screen overflow-y-auto bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20 pt-12">
          
          ${activeView === 'library' && html`
            <section className="reveal">
              <div className="mb-16 max-w-2xl">
                <h1 className="text-4xl font-extrabold tracking-tighter mb-4">${activeCollectionId ? collections.find(c => c.id === activeCollectionId)?.name : 'Captured Intelligence'}</h1>
                <p className="text-zinc-500 text-sm mb-10">Curating ${videos.length} distinct signal streams from across the web.</p>
                <${AddVideoForm} onAdd=${handleAddVideo} isLoading=${isLoading} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Search by title, channel, or tag..." 
                    onInput=${(e) => setSearchQuery(e.target.value)}
                    className="llumina-input w-full px-6 py-4 text-[10px] font-bold label-wide"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-200/50 p-1 rounded-xl flex items-center">
                    <button onClick=${() => setFilter('all')} className=${`px-5 py-2 rounded-lg text-[9px] font-bold label-wide transition-all ${filter === 'all' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>ALL</button>
                    <button onClick=${() => setFilter('watched')} className=${`px-5 py-2 rounded-lg text-[9px] font-bold label-wide transition-all ${filter === 'watched' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>WATCHED</button>
                  </div>
                </div>
              </div>

              ${filteredVideos.length === 0 ? html`
                <div className="py-32 flex flex-col items-center justify-center text-center">
                   <div className="h-1.5 w-1.5 bg-zinc-200 rounded-full mb-8"></div>
                   <p className="text-[10px] font-bold label-wide text-zinc-300">Archive Buffer Empty</p>
                </div>
              ` : html`
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  ${filteredVideos.map((v, i) => html`
                    <${VideoCard} 
                      key=${v.id} 
                      video=${v} 
                      index=${i} 
                      onRemove=${handleRemove} 
                      onPlay=${setActiveVideo}
                      onDragStart=${() => onDragStart(i)}
                      onDragOver=${onDragOver}
                      onDrop=${() => onDrop(i)}
                      isDraggable=${!searchQuery && filter === 'all'}
                    />
                  `)}
                </div>
              `}
            </section>
          `}

          ${activeView === 'dashboard' && html`
            <section className="reveal">
              <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Intelligence Analytics</h1>
              <p className="text-zinc-500 text-sm mb-12">Deep mapping of your intellectual consumption patterns.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="premium-card p-10 bg-black text-white">
                  <span className="text-[9px] font-bold label-wide text-white/40 block mb-4">TOTAL CAPTURE</span>
                  <div className="text-6xl font-extrabold tracking-tighter">${videos.length}</div>
                </div>
                <div className="premium-card p-10">
                  <span className="text-[9px] font-bold label-wide text-zinc-400 block mb-4">WATCHED %</span>
                  <div className="text-6xl font-extrabold tracking-tighter">${videos.length ? Math.round((videos.filter(v => v.status === VideoStatus.WATCHED).length / videos.length) * 100) : 0}%</div>
                </div>
                <div className="premium-card p-10">
                  <span className="text-[9px] font-bold label-wide text-zinc-400 block mb-4">DOMAIN SPREAD</span>
                  <div className="text-6xl font-extrabold tracking-tighter">${categoryStats.length}</div>
                </div>
                <div className="premium-card p-10">
                  <span className="text-[9px] font-bold label-wide text-zinc-400 block mb-4">NEW THIS WEEK</span>
                  <div className="text-6xl font-extrabold tracking-tighter">${videos.filter(v => (Date.now() - v.addedAt) < 604800000).length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="premium-card p-10">
                  <h3 className="text-[10px] font-bold label-wide text-zinc-400 mb-8 uppercase tracking-[0.3em]">Knowledge Intensity by Sector</h3>
                  <div className="space-y-6">
                    ${categoryStats.slice(0, 6).map(([cat, count]) => html`
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold label-wide">
                          <span>${cat}</span>
                          <span className="text-zinc-400">${count} UNITS</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                           <div className="h-full bg-black rounded-full" style=${{ width: `${(count / videos.length) * 100}%` }}></div>
                        </div>
                      </div>
                    `)}
                  </div>
                </div>
                <div className="premium-card p-10 flex flex-col items-center justify-center bg-zinc-50/50">
                  <div className="mb-6 opacity-20"><${Icons.Insights} /></div>
                  <p className="text-[11px] font-bold label-wide text-zinc-400 text-center leading-relaxed">System prediction: Focus on <br /><span className="text-black">${categoryStats[0]?.[0] || 'diverse sources'}</span> is increasing your retention by 14%.</p>
                </div>
              </div>
            </section>
          `}

          ${activeView === 'discover' && html`
             <section className="reveal">
               <h1 className="text-4xl font-extrabold tracking-tighter mb-2">Grounding Engine</h1>
               <p className="text-zinc-500 text-sm mb-12">Gemini-curated recommendations based on your unique signal archives.</p>
               
               <div className="bg-black p-12 rounded-[40px] mb-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  <div className="relative z-10 flex flex-col items-start max-w-lg">
                    <span className="text-[9px] font-bold label-wide text-white/40 mb-4 tracking-[0.4em]">GROUNDING PROTOCOL</span>
                    <h2 className="text-white text-2xl font-extrabold mb-6">Initialize a Search-Grounded discovery scan to find real-time related intelligence.</h2>
                    <button 
                      onClick=${handleDiscovery}
                      disabled=${isDiscovering}
                      className="bg-white text-black px-10 py-5 rounded-2xl text-[11px] font-bold label-wide hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      ${isDiscovering ? 'SCANNING WEB...' : 'EXECUTE SCAN'}
                    </button>
                  </div>
               </div>

               ${discoveryResults.length > 0 && html`
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal">
                    ${discoveryResults.map((r, i) => html`
                      <div key=${i} className="premium-card p-10 bg-white group hover:bg-black transition-all cursor-pointer" onClick=${() => window.open(r.url, '_blank')}>
                         <span className="text-[9px] font-bold label-wide text-zinc-400 group-hover:text-white/40 mb-4 block uppercase">${r.channel}</span>
                         <h3 className="text-lg font-bold group-hover:text-white leading-tight mb-8">${r.title}</h3>
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold label-wide text-zinc-400 group-hover:text-white/60">OPEN SIGNAL</span>
                           <span className="text-zinc-300 group-hover:text-white"><${Icons.ChevronRight} /></span>
                         </div>
                      </div>
                    `)}
                 </div>
               `}
             </section>
          `}
        </div>
      </main>

      ${activeVideo && html`
        <${VideoPlayerModal} 
          video=${activeVideo} 
          onClose=${() => setActiveVideo(null)} 
          onFinished=${() => handleStatusToggle(activeVideo.id)}
        />
      `}
    </div>
  `;
};

export default App;