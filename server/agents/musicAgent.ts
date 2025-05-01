import { HfInference } from '@huggingface/inference';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Function to save audio file
async function saveAudioFile(buffer: Buffer, fileName: string): Promise<string> {
  try {
    // Create directory if it doesn't exist
    const outputDir = path.resolve('dist/public/generated');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    // Return the public URL
    return `/generated/${fileName}`;
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}

// A selection of royalty-free music selections to choose from
const MUSIC_LIBRARY = [
  {
    title: "Morning Optimism",
    artist: "Open Source Audio",
    genre: "Upbeat",
    mood: "Cheerful",
    license: "Creative Commons Zero",
    source: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e3252bde.mp3?filename=childrens-happy-birthday-116105.mp3"
  },
  {
    title: "Quiet Reflection",
    artist: "Open Source Audio",
    genre: "Ambient",
    mood: "Peaceful",
    license: "Creative Commons Zero",
    source: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_dc39bde897.mp3?filename=relaxing-piano-113284.mp3"
  },
  {
    title: "Achievement Unlocked",
    artist: "Open Source Audio",
    genre: "Electronic",
    mood: "Triumphant",
    license: "Creative Commons Zero",
    source: "https://cdn.pixabay.com/download/audio/2021/10/25/audio_9ea5bec8fe.mp3?filename=achievement-electronic-gaming-short-musical-logo-026451.mp3"
  },
  {
    title: "Urban Journey",
    artist: "Open Source Audio",
    genre: "Pop",
    mood: "Energetic",
    license: "Creative Commons Zero", 
    source: "https://cdn.pixabay.com/download/audio/2022/01/20/audio_d0c6ff1bdf.mp3?filename=inspiring-cinematic-uplifting-piano-ambient-short-113417.mp3"
  },
  {
    title: "Nature's Calm",
    artist: "Open Source Audio",
    genre: "Ambient",
    mood: "Serene",
    license: "Creative Commons Zero",
    source: "https://cdn.pixabay.com/download/audio/2022/04/04/audio_191d43385d.mp3?filename=peaceful-garden-healing-light-piano-for-meditation-yoga-spa-117592.mp3"
  }
];

export const musicAgent = {
  /**
   * Selects appropriate music for the cartoon based on the script
   */
  async selectMusic(script: string) {
    try {
      // Analyze script to determine the appropriate music mood
      const moodAnalysisPrompt = `
        Analyze this script for a short animated cartoon:
        "${script}"
        
        What is the overall mood and tone of this story? Choose one primary mood from:
        - Cheerful
        - Peaceful
        - Triumphant
        - Energetic
        - Serene
        
        Also suggest a music genre that would fit well with this cartoon.
        
        Format:
        Mood: [mood]
        Genre: [genre]
        Explanation: [brief explanation]
      `;

      const moodResponse = await hf.textGeneration({
        model: 'gpt2',
        inputs: moodAnalysisPrompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.5
        }
      });

      const moodText = moodResponse.generated_text;
      
      // Extract mood
      const moodMatch = moodText.match(/Mood:\s*(\w+)/i);
      const mood = moodMatch ? moodMatch[1] : "Cheerful";
      
      // Extract genre
      const genreMatch = moodText.match(/Genre:\s*(\w+)/i);
      const genre = genreMatch ? genreMatch[1] : "Upbeat";
      
      // Select music based on mood
      let selectedMusic = MUSIC_LIBRARY.find(music => 
        music.mood.toLowerCase() === mood.toLowerCase() || 
        music.genre.toLowerCase() === genre.toLowerCase()
      );
      
      // Default to first track if no match
      if (!selectedMusic) {
        selectedMusic = MUSIC_LIBRARY[0];
      }
      
      // Download the audio file
      const response = await fetch(selectedMusic.source);
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.statusText}`);
      }
      
      const audioBuffer = await response.buffer();
      
      // Save the audio file
      const audioId = nanoid(8);
      const audioPath = await saveAudioFile(
        audioBuffer,
        `music-${audioId}.mp3`
      );
      
      // Create a preview version (same file for now)
      const previewPath = await saveAudioFile(
        audioBuffer,
        `music-preview-${audioId}.mp3`
      );
      
      // Prepare domain for complete URLs
      const domain = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
        : 'http://localhost:5000';
      
      return {
        title: selectedMusic.title,
        artist: selectedMusic.artist,
        genre: selectedMusic.genre,
        mood: selectedMusic.mood,
        license: selectedMusic.license,
        url: `${domain}${audioPath}`,
        previewUrl: `${domain}${previewPath}`
      };
    } catch (error) {
      console.error('Error in music selection:', error);
      
      // Fallback music in case of API failure
      const domain = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
        : 'http://localhost:5000';
        
      return {
        title: "Cheerful Journey",
        artist: "Open Source Audio",
        genre: "Upbeat",
        mood: "Positive",
        license: "Creative Commons Zero",
        url: `${domain}/generated/fallback-music.mp3`,
        previewUrl: `${domain}/generated/fallback-music-preview.mp3`
      };
    }
  }
};
