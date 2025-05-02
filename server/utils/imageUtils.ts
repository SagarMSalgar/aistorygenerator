import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Stability API configuration
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_ENGINE_ID = process.env.STABILITY_ENGINE_ID || "stable-diffusion-xl-1024-v1-0";
const STABILITY_API_HOST = process.env.STABILITY_API_HOST || "https://api.stability.ai";

// Define types for Stability AI API response
interface StabilityAPIResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}

interface StabilityAPIError {
  id: string;
  name: string;
  message: string;
}

// Function to save binary image
export async function saveBinaryImage(imageBuffer: Buffer, fileName: string): Promise<string> {
  try {
    const projectRoot = process.cwd();
    const outputDir = path.join(projectRoot, 'public', 'generated');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, imageBuffer);
    
    return `/generated/${fileName}`;
  } catch (error: unknown) {
    console.error('Error saving binary image:', error);
    console.error('File path attempted:', path.join(process.cwd(), 'public', 'generated'));
    if (error instanceof Error) {
      throw new Error(`Failed to save image: ${error.message}`);
    }
    throw new Error('Failed to save image: Unknown error');
  }
}

// Function to generate an image with Stability AI
export async function generateStabilityImage(prompt: string, negativePrompt: string = ""): Promise<Buffer> {
  if (!STABILITY_API_KEY) {
    throw new Error('STABILITY_API_KEY is not set');
  }

  // Clean and format the prompts
  const cleanPrompt = prompt.replace(/\s+/g, ' ').trim();
  const cleanNegativePrompt = negativePrompt.replace(/\s+/g, ' ').trim();

  if (!cleanPrompt) {
    throw new Error('Image generation prompt cannot be empty');
  }

  // Truncate prompts to stay within limits
  const maxPromptLength = 1900; // Leave some buffer for style additions
  const truncatedPrompt = cleanPrompt.slice(0, maxPromptLength);
  const truncatedNegative = cleanNegativePrompt.slice(0, maxPromptLength);

  try {
    const url = `${STABILITY_API_HOST}/v1/generation/${STABILITY_ENGINE_ID}/text-to-image`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: `${truncatedPrompt}, traditional cartoon style, clean vector art`,
            weight: 1
          },
          {
            text: truncatedNegative || "anime, manga, realistic, ugly, deformed, blurry",
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        style_preset: "digital-art"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as StabilityAPIError;
      throw new Error(`Stability API error: ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
    }

    const responseJSON = await response.json() as StabilityAPIResponse;
    
    if (!responseJSON.artifacts?.[0]?.base64) {
      throw new Error('No image data received from Stability AI');
    }

    return Buffer.from(responseJSON.artifacts[0].base64, 'base64');

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Stability AI API error details:', error.message);
      throw error;
    }
    throw new Error('An unknown error occurred during image generation');
  }
}

// Add a utility function to check if image exists
export async function checkImageExists(fileName: string): Promise<boolean> {
  try {
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, 'public', 'generated', fileName);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
} 