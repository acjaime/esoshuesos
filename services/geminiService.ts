
import { GoogleGenAI } from "@google/genai";

// Usamos el modelo Flash para generación de imágenes (rápido y con cuota gratuita disponible)
const MODEL_NAME = 'gemini-2.5-flash-image';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(fn: () => Promise<any>, maxRetries = 3, initialDelay = 2000) {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || "";
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
      const isServerError = error?.status >= 500;

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
  // Inicialización con la clave del entorno
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const commonConstraint = "Exact side profile view, full body centered, neutral standing pose, isolated on pure white background, biological illustration style.";
  
  const skeletonPrompt = `A scientific anatomical drawing of a complete ${animalName.toLowerCase()} skeleton. Only white bones, plain white background, very clear lines. ${commonConstraint}`;
  const livingPrompt = `A realistic photo of a living ${animalName.toLowerCase()} in the exact same side profile pose. Plain white background. ${commonConstraint}`;

  try {
    // Generación del esqueleto
    const skeletonRes = await fetchWithRetry(() => 
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [{ text: skeletonPrompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      })
    );

    // Pequeña pausa para no saturar la cuota gratuita
    await sleep(500);

    // Generación del animal vivo
    const livingRes = await fetchWithRetry(() => 
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [{ text: livingPrompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
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
    console.error("Gemini API Error:", error);
    const errorMsg = error?.message || "";
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("¡Vaya! Demasiados pacientes. Espera un momento, doctor/a.");
    }
    throw new Error("¡Ay! El equipo ha fallado. ¿Reintentamos la prueba?");
  }
}
