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

// Helper function to analyze script and determine mood and genre
function analyzeScriptForMusic(script: string): { mood: string, genre: string, explanation: string } {
  const scriptLower = script.toLowerCase();
  
  // Check for mood indicators in the script
  const moodIndicators = {
    cheerful: [
      "happy", "joy", "fun", "laugh", "smile", "bright", "celebration", "party", "excited", "cheer"
    ],
    peaceful: [
      "calm", "quiet", "serene", "peace", "relax", "gentle", "soft", "warm", "comfort", "sooth"
    ],
    triumphant: [
      "achievement", "success", "triumph", "victory", "accomplish", "overcome", "win", "proud", "goal"
    ],
    energetic: [
      "active", "busy", "rush", "run", "fast", "energy", "adventure", "dynamic", "lively", "quick"
    ],
    serene: [
      "nature", "reflect", "meditate", "think", "contemplate", "breathe", "beauty", "appreciate"
    ],
    melancholy: [
      "sad", "miss", "regret", "lonely", "nostalgia", "remember", "past", "lost", "wish"
    ]
  };
  
  // Count occurrences of mood indicators
  const moodCounts = Object.fromEntries(
    Object.entries(moodIndicators).map(([mood, indicators]) => [
      mood, 
      indicators.filter(word => scriptLower.includes(word)).length
    ])
  );
  
  // Find the predominant mood
  const entries = Object.entries(moodCounts);
  entries.sort((a, b) => b[1] - a[1]);
  const primaryMood = entries[0][1] > 0 ? entries[0][0] : "cheerful"; // default to cheerful
  
  // Determine appropriate genre based on mood
  let genre = "Upbeat";
  let explanation = "";
  
  switch (primaryMood) {
    case "cheerful":
      genre = "Pop";
      explanation = "The script has a positive, uplifting tone that calls for cheerful background music.";
      break;
    case "peaceful":
      genre = "Ambient";
      explanation = "The calm, reflective nature of the script suggests peaceful, ambient music.";
      break;
    case "triumphant":
      genre = "Cinematic";
      explanation = "The script's focus on achievement and success calls for triumphant music.";
      break;
    case "energetic":
      genre = "Electronic";
      explanation = "The dynamic, fast-paced elements of the script are best complemented by energetic music.";
      break;
    case "serene":
      genre = "Classical";
      explanation = "The contemplative, appreciative qualities of the script pair well with serene classical music.";
      break;
    case "melancholy":
      genre = "Acoustic";
      explanation = "The emotional depth and reflection in the script calls for thoughtful acoustic music.";
      break;
  }
  
  // Capitalize first letter of mood
  const mood = primaryMood.charAt(0).toUpperCase() + primaryMood.slice(1);
  
  return { mood, genre, explanation };
}

export const musicAgent = {
  /**
   * Selects appropriate music for the cartoon based on the script
   */
  async selectMusic(script: string) {
    try {
      // First try to use AI for music analysis
      let mood = "";
      let genre = "";
      
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

        // Try a better model
        const moodResponse = await hf.textGeneration({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          inputs: moodAnalysisPrompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.5
          }
        });

        const moodText = moodResponse.generated_text;
        
        // Extract mood
        const moodMatch = moodText.match(/Mood:\s*(\w+)/i);
        if (moodMatch && moodMatch[1]) {
          mood = moodMatch[1];
        } else {
          throw new Error("Could not extract mood from AI response");
        }
        
        // Extract genre
        const genreMatch = moodText.match(/Genre:\s*(\w+)/i);
        if (genreMatch && genreMatch[1]) {
          genre = genreMatch[1];
        } else {
          throw new Error("Could not extract genre from AI response");
        }
      } catch (aiError) {
        console.log("Error getting mood from AI, using script analysis:", aiError);
        // Use our script analysis function as fallback
        const analysis = analyzeScriptForMusic(script);
        mood = analysis.mood;
        genre = analysis.genre;
      }
      
      // Make sure we have valid values
      if (!mood || mood.length < 3) {
        const analysis = analyzeScriptForMusic(script);
        mood = analysis.mood;
      }
      
      if (!genre || genre.length < 3) {
        const analysis = analyzeScriptForMusic(script);
        genre = analysis.genre;
      }
      
      console.log(`Selected music mood: ${mood}, genre: ${genre} for script`);
      
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
      
      // Use relative URLs
      return {
        title: selectedMusic.title,
        artist: selectedMusic.artist,
        genre: selectedMusic.genre,
        mood: selectedMusic.mood,
        license: selectedMusic.license,
        url: `${audioPath}`,
        previewUrl: `${previewPath}`
      };
    } catch (error) {
      console.error('Error in music selection:', error);
      
      // Use script analysis for fallback
      const analysis = analyzeScriptForMusic(script);
      
      // Select fallback music based on mood analysis
      let fallbackTrack = MUSIC_LIBRARY.find(music => 
        music.mood.toLowerCase() === analysis.mood.toLowerCase() || 
        music.genre.toLowerCase() === analysis.genre.toLowerCase()
      ) || MUSIC_LIBRARY[0];
      
      // Try to download the selected track
      try {
        const response = await fetch(fallbackTrack.source);
        if (response.ok) {
          const audioBuffer = await response.buffer();
          const audioId = nanoid(8);
          const audioPath = await saveAudioFile(audioBuffer, `music-${audioId}.mp3`);
          const previewPath = await saveAudioFile(audioBuffer, `music-preview-${audioId}.mp3`);
          
          return {
            title: fallbackTrack.title,
            artist: fallbackTrack.artist,
            genre: fallbackTrack.genre,
            mood: fallbackTrack.mood,
            license: fallbackTrack.license,
            url: `${audioPath}`,
            previewUrl: `${previewPath}`
          };
        }
      } catch (downloadError) {
        console.error('Error downloading fallback track, using static fallback:', downloadError);
      }
      
      // Last resort fallback - static file
      return {
        title: "Cheerful Journey",
        artist: "Open Source Audio",
        genre: "Upbeat",
        mood: "Positive",
        license: "Creative Commons Zero",
        url: `/generated/fallback-music.mp3`,
        previewUrl: `/generated/fallback-music-preview.mp3`
      };
    }
  }
};
