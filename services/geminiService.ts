
import { GoogleGenAI } from "@google/genai";

// Use gemini-2.5-flash-image for general image generation and editing tasks
const MODEL_NAME = 'gemini-2.5-flash-image';

export async function generateAnimalImages(animalName: string): Promise<{ skeleton: string; living: string }> {
  // Fix: Initialize GoogleGenAI with exactly the required parameters
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const commonConstraint = "Exact side profile view facing left, full body centered, neutral standing pose, isolated on pure white background, extremely high detail, museum quality.";
  
  const skeletonPrompt = `Scientific osteology illustration: complete skeletal system of a ${animalName.toLowerCase()}, ONLY WHITE BONES, no skin, no organs, no background. ${commonConstraint}`;
  const livingPrompt = `Wildlife photography: full body portrait of a living ${animalName.toLowerCase()}, standing position matching exactly the pose of a skeleton, healthy specimen, high resolution. ${commonConstraint}`;

  try {
    // Fix: Call generateContent with the correct model and contents structure
    const [skeletonRes, livingRes] = await Promise.all([
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [{ text: skeletonPrompt }] },
      }),
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [{ text: livingPrompt }] },
      })
    ]);

    let skeletonUrl = "";
    let livingUrl = "";

    // Fix: Correctly iterate through response parts to extract image data (do not assume first part)
    if (skeletonRes.candidates?.[0]?.content?.parts) {
      for (const part of skeletonRes.candidates[0].content.parts) {
        if (part.inlineData) {
          skeletonUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    // Fix: Correctly iterate through response parts to extract image data (do not assume first part)
    if (livingRes.candidates?.[0]?.content?.parts) {
      for (const part of livingRes.candidates[0].content.parts) {
        if (part.inlineData) {
          livingUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!skeletonUrl || !livingUrl) {
      throw new Error("Failed to generate one or more images.");
    }

    return { skeleton: skeletonUrl, living: livingUrl };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
