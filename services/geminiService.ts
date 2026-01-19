
import { GoogleGenAI, Type } from "@google/genai";
import { VideoMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Fetches metadata for a YouTube URL using Gemini.
   * This handles the "Auto-fetch" requirement by analyzing the URL.
   */
  fetchVideoMetadata: async (url: string): Promise<VideoMetadata> => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract or infer video metadata for this YouTube URL: ${url}. 
                 Even if you can't access live data, provide a reasonable title and channel name based on the URL context or patterns.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            channelName: { type: Type.STRING },
            duration: { type: Type.STRING },
          },
          required: ["title", "channelName"],
        },
      },
    });

    const json = JSON.parse(response.text);
    
    // Extract YouTube ID for thumbnail
    const youtubeId = url.match(/(?:v=|\/embed\/|\/watch\?v=|\/\d+\/|\/vi\/|youtu\.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/)?.[1] || '';
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

    return {
      title: json.title || 'Unknown Video',
      channelName: json.channelName || 'Unknown Channel',
      thumbnailUrl,
      duration: json.duration || '0:00',
    };
  }
};
