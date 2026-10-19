
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { HealthMetric } from "../types";

// Helper to create a fresh instance with the current injected API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHealthMetrics = async (metrics: HealthMetric[]) => {
  const ai = getAI();
  const prompt = `Analyze the following 7-day health metrics for a cancer patient and provide a summary of their health status and care routine recommendations.
  Data: ${JSON.stringify(metrics)}
  
  Please provide the response in the following JSON format:
  {
    "summary": "Short 2-3 sentence overview",
    "status": "Stable/Improving/Needs Attention",
    "recommendations": ["list of 3 items"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            status: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "status", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};

export const chatWithThinking = async (message: string, useSearch = false) => {
  const ai = getAI();
  const config: any = {
    thinkingConfig: { thinkingBudget: 32768 },
  };
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: message,
    config
  });
  
  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const findNearbyClinics = async (query: string, lat?: number, lng?: number) => {
  const ai = getAI();
  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (lat && lng) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: { latitude: lat, longitude: lng }
      }
    };
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config
  });

  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const generateImage = async (prompt: string, size: "1K" | "2K" | "4K", aspectRatio: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size
      }
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const editImage = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const analyzeImage = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

export const generateSpeech = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const generateVideoVeo = async (prompt: string, imageBase64?: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getAI();
  const params: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  };

  if (imageBase64) {
    params.image = {
      imageBytes: imageBase64.split(',')[1],
      mimeType: 'image/png'
    };
  }

  let operation = await ai.models.generateVideos(params);
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
