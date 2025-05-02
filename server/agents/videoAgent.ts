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
      const outputDir = path.resolve('dist/public/generated');
      await fs.mkdir(outputDir, { recursive: true });
      
      const videoId = nanoid(8);
      const outputVideoPath = path.join(outputDir, `cartoon-${videoId}.mp4`);
      const concatFilePath = path.join(outputDir, `concat-${videoId}.txt`);
      
      // Create a file list for FFmpeg
      let concatContent = '';
      for (const scene of visuals.scenes) {
        const imagePath = path.join('dist/public', scene.imageUrl);
        concatContent += `file '${imagePath}'\nduration 7\n`;
      }
      // Add the last image again (required by FFmpeg)
      const lastImagePath = path.join('dist/public', visuals.scenes[visuals.scenes.length - 1].imageUrl);
      concatContent += `file '${lastImagePath}'`;
      
      await fs.writeFile(concatFilePath, concatContent);
      
      // Get music file path
      const musicPath = path.join('dist/public', music.url);
      
      // Create video with FFmpeg
      return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-f', 'concat',
          '-safe', '0',
          '-i', concatFilePath,
          '-i', musicPath,
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-shortest',
          '-y',
          outputVideoPath
        ]);

        ffmpeg.on('close', async (code) => {
          if (code === 0) {
            // Cleanup concat file
            await fs.unlink(concatFilePath);
            
            resolve({
              url: `/generated/cartoon-${videoId}.mp4`,
              thumbnailUrl: visuals.scenes[0].imageUrl,
              duration: "Video"
            });
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        ffmpeg.stderr.on('data', (data) => {
          console.log(`FFmpeg: ${data}`);
        });
      });

    } catch (error) {
      console.error('Error in video compilation:', error);
      throw error;
    }
  }
};
