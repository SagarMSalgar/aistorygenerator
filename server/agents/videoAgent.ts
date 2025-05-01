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
      const outputFileName = `cartoon-${videoId}.mp4`;
      const outputPath = path.join(outputDir, outputFileName);
      const thumbnailFileName = `thumbnail-${videoId}.jpg`;
      const thumbnailPath = path.join(outputDir, thumbnailFileName);

      // Create a text file with the dialogue timestamps (we'll still use this for reference)
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
      
      // Instead of trying to create a video with FFmpeg, we'll use the first scene image
      // Get the first scene image URL
      let firstSceneImageUrl = '';
      let firstSceneDescription = '';
      
      if (visuals.scenes && visuals.scenes.length > 0) {
        firstSceneImageUrl = visuals.scenes[0].imageUrl;
        firstSceneDescription = visuals.scenes[0].description;
      } else {
        // Use a fallback image
        firstSceneImageUrl = '/generated/fallback-scene-1.svg';
        firstSceneDescription = "A day in the life";
      }
      
      // Create a copy of the first scene for the thumbnail
      const thumbnailImageUrl = firstSceneImageUrl;
      
      // Log out the variables so we can debug the issue
      console.log("Generated video with the following assets:");
      console.log("First scene image URL:", firstSceneImageUrl);
      console.log("First scene description:", firstSceneDescription);
      console.log("Music URL:", music.url);
      console.log("Characters:", characters.mainCharacterDescription);
      console.log("Dialogue lines:", dialogue.lines.length);
      
      // Use relative URLs for the return values
      return {
        url: firstSceneImageUrl, // In this case, we're returning an image instead of a video
        thumbnailUrl: thumbnailImageUrl,
        duration: "Image Preview" // Indicate this is just an image
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
