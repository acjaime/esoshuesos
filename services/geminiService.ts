
import { GoogleGenAI } from "@google/genai";

// Usamos el modelo Pro para mayor calidad y para permitir el flujo de selección de API Key
const MODEL_NAME = 'gemini-3-pro-image-preview';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(fn: () => Promise<any>, maxRetries = 5, initialDelay = 3000) {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || "";
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
      const isServerError = error?.status >= 500;
      const isPermissionDenied = errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED');

      // Si es un error de permisos, no reintentamos automáticamente, lanzamos el error para manejarlo en la UI
      if (isPermissionDenied) {
        throw new Error("PERMISSION_DENIED");
      }

      if (isRateLimit || isServerError) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Reintento ${i + 1}/${maxRetries} tras ${delay}ms por error: ${errorMsg}`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function generateAnimalImages(animalName: string): Promise<{ skeleton: string; living: string }> {
  // Siempre instanciamos GoogleGenAI justo antes de la llamada para obtener la clave más reciente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const commonConstraint = "Exact side profile view, full body centered, neutral standing pose, isolated on pure white background, ultra high detail, professional biological illustration style.";
  
  const skeletonPrompt = `A scientific drawing of a complete ${animalName.toLowerCase()} skeleton. Pure white bones, no background. ${commonConstraint}`;
  const livingPrompt = `A realistic photo of a living ${animalName.toLowerCase()} in the exact same pose as the skeleton. White background. ${commonConstraint}`;

  try {
    const skeletonRes = await fetchWithRetry(() => 
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [{ text: skeletonPrompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
        }
      })
    );

    await sleep(800);

    const livingRes = await fetchWithRetry(() => 
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [{ text: livingPrompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
        }
      })
    );

    const extractUrl = (response: any) => {
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return "";
    };

    const skeletonUrl = extractUrl(skeletonRes);
    const livingUrl = extractUrl(livingRes);

    if (!skeletonUrl || !livingUrl) {
      throw new Error("No se pudieron generar las imágenes.");
    }

    return { skeleton: skeletonUrl, living: livingUrl };
  } catch (error: any) {
    if (error.message === "PERMISSION_DENIED") {
      throw new Error("PERMISSION_DENIED");
    }
    console.error("Gemini API Error:", error);
    if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("RATE_LIMIT");
    }
    throw error;
  }
}
