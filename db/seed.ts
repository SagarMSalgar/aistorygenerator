import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import {
  projects,
  scripts,
  characters,
  dialogues,
  visuals,
  music,
  videos
} from '@shared/schema';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScriptData } from '@shared/schema';

// Configure neon
neonConfig.webSocketConstructor = ws;

// Create the database connection directly
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Create necessary directories
async function ensureDirectoriesExist() {
  const outputDir = path.resolve('dist/public/generated');
  await fs.mkdir(outputDir, { recursive: true });
  return outputDir;
}

// Create simple fallback SVG for test purposes
async function createFallbackSVG(outputDir: string, name: string, color: string) {
  const svgContent = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}" />
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">
        ${name} Fallback
      </text>
    </svg>
  `;
  const filePath = path.join(outputDir, `fallback-${name}.svg`);
  await fs.writeFile(filePath, svgContent);
  console.log(`Created fallback ${name} SVG at ${filePath}`);
  return `/generated/fallback-${name}.svg`;
}

// Create a simple audio placeholder
async function createFallbackAudio(outputDir: string) {
  // Create an empty MP3 file as placeholder
  // In real usage, you'd include a small audio file in your repo
  const filePath = path.join(outputDir, 'fallback-music.mp3');
  await fs.writeFile(filePath, '');
  console.log(`Created empty fallback music file at ${filePath}`);
  return `/generated/fallback-music.mp3`;
}

// Create all fallback assets
async function createFallbackAssets() {
  try {
    const outputDir = await ensureDirectoriesExist();
    // Create fallback images
    await createFallbackSVG(outputDir, 'thumbnail', '#3b82f6');
    await createFallbackSVG(outputDir, 'main-character', '#10b981');
    await createFallbackSVG(outputDir, 'supporting-characters', '#8b5cf6');
    // Create fallback scene images
    await createFallbackSVG(outputDir, 'scene-1', '#ef4444');
    await createFallbackSVG(outputDir, 'scene-2', '#f59e0b');
    await createFallbackSVG(outputDir, 'scene-3', '#3b82f6');
    await createFallbackSVG(outputDir, 'scene-4', '#8b5cf6');
    // Create fallback audio
    await createFallbackAudio(outputDir);
    const previewPath = await createFallbackAudio(outputDir);
    console.log('Created fallback assets successfully');
    return {
      thumbnail: `/generated/fallback-thumbnail.svg`,
      mainCharacter: `/generated/fallback-main-character.svg`,
      supportingCharacters: `/generated/fallback-supporting-characters.svg`,
      scenes: [
        `/generated/fallback-scene-1.svg`,
        `/generated/fallback-scene-2.svg`,
        `/generated/fallback-scene-3.svg`,
        `/generated/fallback-scene-4.svg`
      ],
      music: `/generated/fallback-music.mp3`,
      musicPreview: previewPath
    };
  } catch (error) {
    console.error('Error creating fallback assets:', error);
    throw error;
  }
}

// Create a demo project with basic data
async function createDemoProject() {
  try {
    // Get fallback assets
    const assets = await createFallbackAssets();
    // Create project
    const [project] = await db.insert(projects).values({
      dayDescription: "I woke up early, had a productive morning at work, met friends for lunch, and relaxed in the evening by watching a movie.",
      status: 'completed',
      isPublic: true,
      shareToken: nanoid(10),
      createdAt: new Date()
    }).returning();
    console.log('Created demo project:', project.id);
    // Add script
    await db.insert(scripts).values({
      projectId: project.id,
      content: "Title: \"A Day of Balance\"\n\nScene 1: Morning Beginnings\nThe day starts with energy and possibility as our character prepares for what lies ahead.\n\nScene 2: Work Time\nOur character tackles work challenges with determination and creativity.\n\nScene 3: Friendship Time\nA moment with friends brings laughter and connection.\n\nScene 4: Entertainment Time\nScreen time provides relaxation and escape from daily pressures.\n\nScene 5: Day's End\nThe journey concludes with a sense of accomplishment and anticipation for what's next.",
      summary: "This cartoon tells the story of a day filled with balance, showing 5 key moments from the protagonist's experiences. From the energetic morning start through work activities, social connections, and relaxation, to the reflective conclusion.",
      createdAt: new Date()
    });
    // Add characters
    await db.insert(characters).values({
      projectId: project.id,
      mainCharacterUrl: assets.mainCharacter,
      mainCharacterDescription: "A friendly, professional-looking individual with an expressive face, business casual attire, and a positive demeanor.",
      supportingCharactersUrl: assets.supportingCharacters,
      supportingCharactersDescription: "A diverse group of friends and colleagues with distinct personalities, including a cheerful friend, a serious coworker, and a relaxed movie companion.",
      createdAt: new Date()
    });
    // Add dialogue
    await db.insert(dialogues).values({
      projectId: project.id,
      lines: [
        { character: "NARRATOR", text: "As the sun rises on a new day, our story begins." },
        { character: "MAIN CHARACTER", text: "It's going to be a great day today! I can feel it." },
        { character: "COLLEAGUE", text: "Great job on that project! You're really making progress." },
        { character: "MAIN CHARACTER", text: "Thanks! I've been putting in extra effort lately." },
        { character: "FRIEND", text: "It's so good to see you! How has your week been?" },
        { character: "MAIN CHARACTER", text: "Busy but good! This lunch break is exactly what I needed." },
        { character: "MAIN CHARACTER", text: "Time to relax and unwind with a good movie." },
        { character: "FRIEND", text: "Sometimes you need to take time for yourself after a busy day." },
        { character: "NARRATOR", text: "And as this day comes to a close, tomorrow waits with new possibilities." }
      ],
      createdAt: new Date()
    });
    // Add visuals
    await db.insert(visuals).values({
      projectId: project.id,
      scenes: [
        { imageUrl: assets.scenes[0], description: "Morning scene - Starting the day with coffee and preparation" },
        { imageUrl: assets.scenes[1], description: "Work scene - Focused at a desk with computer and notes" },
        { imageUrl: assets.scenes[2], description: "Lunch scene - Enjoying conversation with friends at café" },
        { imageUrl: assets.scenes[3], description: "Evening scene - Relaxing on a couch watching a movie" }
      ],
      createdAt: new Date()
    });
    // Add music
    await db.insert(music).values({
      projectId: project.id,
      title: "Balanced Day",
      artist: "Demo Artist",
      genre: "Upbeat",
      mood: "Cheerful",
      license: "Creative Commons Zero",
      url: assets.music,
      previewUrl: assets.musicPreview,
      createdAt: new Date()
    });
    // Add video
    const cartoonId = nanoid(8);
    const cartoonData = {
      script: {
        content: "Title: \"A Day of Balance\"\n\nScene 1: Morning Beginnings\nThe day starts with energy and possibility as our character prepares for what lies ahead.\n\nScene 2: Work Time\nOur character tackles work challenges with determination and creativity.\n\nScene 3: Friendship Time\nA moment with friends brings laughter and connection.\n\nScene 4: Entertainment Time\nScreen time provides relaxation and escape from daily pressures.\n\nScene 5: Day's End\nThe journey concludes with a sense of accomplishment and anticipation for what's next.",
        summary: "This cartoon tells the story of a day filled with balance, showing 5 key moments from the protagonist's experiences."
      },
      scenes: [
        { imageUrl: assets.scenes[0], description: "Morning scene - Starting the day with coffee and preparation" },
        { imageUrl: assets.scenes[1], description: "Work scene - Focused at a desk with computer and notes" },
        { imageUrl: assets.scenes[2], description: "Lunch scene - Enjoying conversation with friends at a café" },
        { imageUrl: assets.scenes[3], description: "Evening scene - Relaxing on a couch watching a movie" }
      ],
      dialogue: {
        lines: [
          { character: "NARRATOR", text: "As the sun rises on a new day, our story begins." },
          { character: "MAIN CHARACTER", text: "It's going to be a great day today! I can feel it." },
          { character: "COLLEAGUE", text: "Great job on that project! You're really making progress." },
          { character: "MAIN CHARACTER", text: "Thanks! I've been putting in extra effort lately." },
          { character: "FRIEND", text: "It's so good to see you! How has your week been?" },
          { character: "MAIN CHARACTER", text: "Busy but good! This lunch break is exactly what I needed." },
          { character: "MAIN CHARACTER", text: "Time to relax and unwind with a good movie." },
          { character: "FRIEND", text: "Sometimes you need to take time for yourself after a busy day." },
          { character: "NARRATOR", text: "And as this day comes to a close, tomorrow waits with new possibilities." }
        ]
      }
    };
    // Save cartoon data JSON file
    const outputDir = path.resolve('dist/public/generated');
    const cartoonDataFileName = `cartoon-data-${cartoonId}.json`;
    const cartoonDataPath = path.join(outputDir, cartoonDataFileName);
    await fs.writeFile(cartoonDataPath, JSON.stringify(cartoonData, null, 2));
    await db.insert(videos).values({
      projectId: project.id,
      url: `/generated/${cartoonDataFileName}`,
      thumbnailUrl: assets.thumbnail,
      duration: "Animated Slideshow",
      createdAt: new Date()
    });
    console.log('Created complete demo project successfully');
  } catch (error) {
    console.error('Error creating demo project:', error);
    throw error;
  }
}

// Main seed function
async function seed() {
  try {
    await createFallbackAssets();
    await createDemoProject();
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

// Run seed function
seed();

export const scriptAgent = {
  async generateScript(dayDescription: string): Promise<ScriptData> {
    try {
      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Analyze story and generate script
      const prompt = `
        Analyze this person's day and create a 1-minute animated cartoon script:
        "${dayDescription}"

        Consider:
        1. Key events and emotional moments
        2. Character interactions and relationships
        3. Story arc with beginning, middle, and end
        4. Potential for visual storytelling
        5. Overall mood and tone

        Generate:
        1. A creative title
        2. A brief summary
        3. 4-5 scenes with descriptions
        4. Scene transitions
        5. Emotional beats

        Format as a proper script with scene headings and descriptions.
      `;

      const result = await model.generateContent(prompt);
      const scriptText = result.response.text();

      // Extract title and summary using Gemini
      const analysisPrompt = `
        From this script:
        "${scriptText}"
        
        Extract:
        1. The title
        2. A one-paragraph summary
        
        Format as:
        Title: [title]
        Summary: [summary]
      `;

      const analysis = await model.generateContent(analysisPrompt);
      const analysisText = analysis.response.text();

      // Parse title and summary
      const titleMatch = analysisText.match(/Title: (.*)/);
      const summaryMatch = analysisText.match(/Summary: (.*)/);

      return {
        content: scriptText,
        summary: summaryMatch?.[1] || "A day in the life story",
        title: titleMatch?.[1] || "My Day as a Cartoon"
      };

    } catch (error) {
      console.error('Error in script generation:', error);
      throw error;
    }
  }
};