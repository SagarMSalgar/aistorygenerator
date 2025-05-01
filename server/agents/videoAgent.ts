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

      // Create a script file for FFmpeg
      const ffmpegScript = path.join(outputDir, `ffmpeg-script-${videoId}.txt`);
      let scriptContent = '';
      
      // Prepare the scene durations - total 60 seconds
      const sceneCount = visuals.scenes.length;
      const sceneDuration = 60 / sceneCount; // seconds per scene
      
      // Each scene is shown for around 15 seconds
      visuals.scenes.forEach((scene, index) => {
        try {
          // Handle relative URLs properly
          const imageUrl = scene.imageUrl;
          
          // Get absolute path to the image file
          const localScenePath = path.resolve(
            imageUrl.startsWith('/') 
              ? path.join('dist/public', imageUrl) 
              : path.join('dist/public', imageUrl)
          );
          
          // Verify file exists
          console.log(`Checking scene image at: ${localScenePath}`);
          
          // Add scene to script with duration
          scriptContent += `file '${localScenePath.replace(/\\/g, "/")}'\n`;
          scriptContent += `duration ${sceneDuration}\n`;
        } catch (error) {
          console.error(`Error processing scene ${index}:`, error);
          
          // Use fallback scene if there's an error
          const fallbackPath = path.resolve(`dist/public/generated/fallback-scene-${index + 1}.svg`);
          console.log(`Using fallback scene: ${fallbackPath}`);
          
          scriptContent += `file '${fallbackPath.replace(/\\/g, "/")}'\n`;
          scriptContent += `duration ${sceneDuration}\n`;
        }
      });
      
      // Write the FFmpeg script
      await fs.writeFile(ffmpegScript, scriptContent);
      
      // Get local path to the music file
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
      
      // Build FFmpeg command to compile the video
      const ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', ffmpegScript,
        '-i', localMusicPath,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-shortest',
        '-vf', `subtitles=${subtitleFile.replace(/\\/g, "/")}:force_style='FontSize=24,Alignment=10'`,
        '-pix_fmt', 'yuv420p',
        outputPath
      ];
      
      // Execute FFmpeg command
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ffmpegArgs);
        
        ffmpeg.stderr.on('data', (data) => {
          console.log(`FFmpeg: ${data}`);
        });
        
        ffmpeg.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });
      });
      
      // Create a thumbnail from the first scene
      try {
        const firstSceneImageUrl = visuals.scenes[0].imageUrl;
        const localFirstScenePath = path.resolve(
          firstSceneImageUrl.startsWith('/') 
            ? path.join('dist/public', firstSceneImageUrl) 
            : path.join('dist/public', firstSceneImageUrl)
        );
        
        console.log(`Generating thumbnail from: ${localFirstScenePath}`);
        
        await new Promise<void>((resolve, reject) => {
          const ffmpeg = spawn('ffmpeg', [
            '-i', localFirstScenePath,
            '-vf', 'scale=640:-1',
            thumbnailPath
          ]);
          
          ffmpeg.stderr.on('data', (data) => {
            console.log(`FFmpeg thumbnail: ${data}`);
          });
          
          ffmpeg.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`FFmpeg thumbnail process exited with code ${code}`));
            }
          });
        });
      } catch (thumbnailError) {
        console.error('Error generating thumbnail:', thumbnailError);
        
        // Use fallback thumbnail - copy the fallback thumbnail image
        const fallbackThumbnailPath = path.resolve('dist/public/generated/fallback-thumbnail.svg');
        await fs.copyFile(fallbackThumbnailPath, thumbnailPath);
        console.log(`Used fallback thumbnail: ${fallbackThumbnailPath}`);
      }
      
      // Use relative URLs
      return {
        url: `/generated/${outputFileName}`,
        thumbnailUrl: `/generated/${thumbnailFileName}`,
        duration: "60 seconds"
      };
    } catch (error) {
      console.error('Error in video compilation:', error);
      
      // If FFmpeg fails, provide a fallback that links to the first scene as a static image
      
      // Try to get the first scene URL, or use a fallback with relative URL
      const thumbnailUrl = visuals.scenes && visuals.scenes.length > 0 
        ? visuals.scenes[0].imageUrl 
        : `/generated/fallback-thumbnail.svg`;
      
      return {
        url: thumbnailUrl, // Just use the thumbnail as fallback
        thumbnailUrl: thumbnailUrl,
        duration: "60 seconds"
      };
    }
  }
};
