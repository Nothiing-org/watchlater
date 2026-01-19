import React, { useState } from 'react';
import { html } from 'htm/react';

const AddVideoForm = ({ onAdd, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) return;
    
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!pattern.test(url)) {
      setError('Invalid Signal Source');
      return;
    }

    try {
      await onAdd(url);
      setUrl('');
    } catch (err) {
      setError('Communication Failure');
    }
  };

  return html`
    <div className="reveal" style=${{ animationDelay: '0.1s' }}>
      <form onSubmit=${handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value=${url}
            onInput=${(e) => setUrl(e.target.value)}
            placeholder="Input YouTube link..."
            className="llumina-input w-full px-6 py-5 text-sm font-medium focus:ring-0"
            disabled=${isLoading}
          />
          ${error && html`<span className="absolute -bottom-6 left-2 text-[10px] font-bold text-black label-wide">${error}</span>`}
        </div>
        <button
          type="submit"
          disabled=${isLoading || !url.trim()}
          className="bg-black text-white rounded-2xl px-10 py-5 font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95 disabled:bg-zinc-200"
        >
          ${isLoading ? 'ANALYZING...' : 'SAVE SIGNAL'}
        </button>
      </form>
    </div>
  `;
};

export default AddVideoForm;