import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { ScriptData, CharacterData, DialogueData, VisualData, MusicData } from '@shared/schema';

/**
 * Simple video compilation function using FFmpeg
 * For a real implementation, you would use a more sophisticated approach
 */
export const videoAgent = {
  async compileVideo(
    script: ScriptData,
    characters: CharacterData,
    dialogue: DialogueData,
    visuals: VisualData,
    music: MusicData
  ) {
    try {
      // Create output directory if it doesn't exist
      const outputDir = path.resolve('dist/public/generated');
      await fs.mkdir(outputDir, { recursive: true });
      
      // Generate a unique ID for this video
      const videoId = nanoid(8);
      const cartoonDataFileName = `cartoon-data-${videoId}.json`;
      const cartoonDataPath = path.join(outputDir, cartoonDataFileName);
      
      // Create a text file with the dialogue timestamps
      const subtitleFile = path.join(outputDir, `subtitle-${videoId}.srt`);
      let subtitleContent = '';
      
      dialogue.lines.forEach((line, index) => {
        const startTime = index * 7; // Each line takes about 7 seconds
        const endTime = startTime + 6.5;
        
        // Format: HH:MM:SS,mmm
        const formatTime = (seconds: number) => {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = Math.floor(seconds % 60);
          const millis = Math.floor((seconds % 1) * 1000);
          
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
        };
        
        subtitleContent += `${index + 1}\n`;
        subtitleContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        subtitleContent += `${line.character}: ${line.text}\n\n`;
      });
      
      await fs.writeFile(subtitleFile, subtitleContent);

      // Get the music file path
      const musicPath = music.url;
      
      // Create absolute path to the music file
      let localMusicPath;
      try {
        localMusicPath = path.resolve(
          musicPath.startsWith('/') 
            ? path.join('dist/public', musicPath) 
            : path.join('dist/public', musicPath)
        );
        console.log(`Using music file at: ${localMusicPath}`);
      } catch (error) {
        console.error('Error resolving music path:', error);
        // Use fallback music
        localMusicPath = path.resolve('dist/public/generated/fallback-music.mp3');
        console.log(`Using fallback music at: ${localMusicPath}`);
      }
      
      // Make sure we have scenes to work with
      const scenes = visuals.scenes && visuals.scenes.length > 0 
        ? visuals.scenes 
        : [
            {
              imageUrl: '/generated/fallback-scene-1.svg',
              description: "Morning scene - Starting the day"
            },
            {
              imageUrl: '/generated/fallback-scene-2.svg',
              description: "Mid-day scene - Main activity"
            },
            {
              imageUrl: '/generated/fallback-scene-3.svg',
              description: "Afternoon scene - Challenge or conflict"
            },
            {
              imageUrl: '/generated/fallback-scene-4.svg',
              description: "Evening scene - Resolution"
            }
          ];
      
      // Create a thumbnail from the first scene
      const thumbnailImageUrl = scenes[0].imageUrl;
      
      // Instead of creating a video file, we'll create a JSON file with all the cartoon data
      // This will allow the frontend to animate through the scenes
      const cartoonData = {
        script: {
          content: script.content,
          summary: script.summary
        },
        characters: {
          mainCharacterUrl: characters.mainCharacterUrl,
          mainCharacterDescription: characters.mainCharacterDescription,
          supportingCharactersUrl: characters.supportingCharactersUrl,
          supportingCharactersDescription: characters.supportingCharactersDescription
        },
        dialogue: {
          lines: dialogue.lines
        },
        scenes: scenes,
        music: {
          url: music.url,
          title: music.title,
          artist: music.artist
        }
      };
      
      // Save the JSON data
      await fs.writeFile(cartoonDataPath, JSON.stringify(cartoonData, null, 2));
      
      // Log out the variables so we can debug the issue
      console.log("Generated cartoon data with the following assets:");
      console.log("Number of scenes:", scenes.length);
      console.log("First scene description:", scenes[0].description);
      console.log("Music URL:", music.url);
      console.log("Characters:", characters.mainCharacterDescription);
      console.log("Dialogue lines:", dialogue.lines.length);
      console.log("Saved cartoon data to:", cartoonDataPath);
      
      // Return the paths to the cartoon data 
      return {
        url: `/generated/${cartoonDataFileName}`, // Path to the JSON file
        thumbnailUrl: thumbnailImageUrl,
        duration: "Animated Slideshow" // Indicate this is a slideshow
      };
    } catch (error) {
      console.error('Error in video compilation:', error);
      
      // If any error occurs, use the fallback thumbnail
      return {
        url: `/generated/fallback-thumbnail.svg`,
        thumbnailUrl: `/generated/fallback-thumbnail.svg`,
        duration: "Image Preview"
      };
    }
  }
};
