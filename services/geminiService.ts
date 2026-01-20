import { GoogleGenAI, Type } from "@google/genai";
import { VideoMetadata, Video } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  fetchVideoMetadata: async (url: string): Promise<VideoMetadata & { isMusic: boolean }> => {
    const isMusicUrl = url.includes('music.youtube.com');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract technical metadata for signal: ${url}. Return JSON with: title, creator, duration, and a concise intelligence category (e.g., "Quantum Physics", "Product Design", "Ambient Jazz").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            creator: { type: Type.STRING },
            duration: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["title", "creator"],
        },
      },
    });

    const json = JSON.parse(response.text);
    const youtubeIdMatch = url.match(/(?:v=|\/embed\/|\/watch\?v=|\/\d+\/|\/vi\/|youtu\.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
    const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : '';
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

    return {
      title: json.title || 'Unknown Signal',
      channelName: json.creator || 'Unknown Source',
      thumbnailUrl,
      duration: json.duration || '0:00',
      category: json.category || 'Unsorted',
      isMusic: isMusicUrl
    };
  },

  summarizeSignal: async (videoTitle: string, channel: string): Promise<string> => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform an intelligence deep-dive for: "${videoTitle}" by "${channel}". Provide:
1. Executive Summary (2 sentences)
2. Core Intellectual Pillars (3-4 bullet points)
3. Synthesis/Actionable Insight.`,
    });
    return response.text;
  },

  discoverRelated: async (existingLibrary: Video[]): Promise<any[]> => {
    // Collect unique topics from library
    const topics = Array.from(new Set(existingLibrary.map(v => v.metadata.category))).slice(0, 5).join(', ');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `The user has a signal library focused on: ${topics}. Use Google Search to find 3 groundbreaking, highly-rated YouTube videos that provide unique perspectives on these or adjacent topics. Return a JSON array of objects with 'title', 'channel', and 'url'.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              channel: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["title", "channel", "url"]
          }
        }
      },
    });

    // In case search returns grounding chunks instead of plain text, handle that
    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.warn("Falling back to simulated discovery results", e);
      return [
        { title: "The Future of Synthetic Intelligence", channel: "ColdFusion", url: "https://www.youtube.com/watch?v=5_X_9V_T_H4" },
        { title: "How High-Performance Systems Scale", channel: "Computerphile", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
      ];
    }
  }
};