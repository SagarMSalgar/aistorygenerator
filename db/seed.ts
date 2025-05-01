import { db } from "./index";
import * as schema from "@shared/schema";
import { nanoid } from "nanoid";

// Create fallback assets for when API calls fail
async function createFallbackAssets() {
  // Define a basic SVG for fallback character
  const mainCharSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <circle cx="150" cy="100" r="50" fill="#6200EA" />
  <rect x="100" y="150" width="100" height="100" fill="#B388FF" />
  <circle cx="125" cy="85" r="10" fill="white" />
  <circle cx="175" cy="85" r="10" fill="white" />
  <path d="M 130 120 Q 150 140 170 120" stroke="white" stroke-width="3" fill="none" />
</svg>
  `.trim();

  // Define a basic SVG for fallback supporting characters
  const supportingCharsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <circle cx="75" cy="100" r="30" fill="#03DAC6" />
  <rect x="50" y="130" width="50" height="70" fill="#84FFFF" />
  <circle cx="150" cy="100" r="30" fill="#018786" />
  <rect x="125" y="130" width="50" height="70" fill="#84FFFF" />
  <circle cx="225" cy="100" r="30" fill="#03DAC6" />
  <rect x="200" y="130" width="50" height="70" fill="#84FFFF" />
</svg>
  `.trim();

  // Define basic SVGs for fallback scenes
  const sceneSvgs = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#E0E0E0" />
      <rect x="0" y="180" width="640" height="180" fill="#BDBDBD" />
      <circle cx="480" cy="80" r="40" fill="#FFC107" />
      <rect x="280" y="160" width="80" height="120" fill="#6200EA" />
      <rect x="320" y="220" width="40" height="60" fill="#B388FF" />
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#F5F5F5" />
      <rect x="40" y="80" width="200" height="200" fill="#BDBDBD" />
      <rect x="400" y="80" width="200" height="200" fill="#BDBDBD" />
      <rect x="80" y="120" width="40" height="40" fill="#03DAC6" />
      <rect x="160" y="120" width="40" height="40" fill="#03DAC6" />
      <rect x="440" y="120" width="40" height="40" fill="#03DAC6" />
      <rect x="520" y="120" width="40" height="40" fill="#03DAC6" />
      <rect x="320" y="180" width="40" height="100" fill="#6200EA" />
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#BBDEFB" />
      <rect x="0" y="260" width="640" height="100" fill="#81C784" />
      <circle cx="320" cy="240" r="20" fill="#6200EA" />
      <circle cx="200" cy="220" r="30" fill="#4CAF50" />
      <circle cx="400" cy="230" r="25" fill="#4CAF50" />
      <circle cx="150" cy="240" r="15" fill="#CDDC39" />
      <circle cx="450" cy="250" r="15" fill="#CDDC39" />
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#37474F" />
      <rect x="100" y="100" width="200" height="150" fill="#78909C" />
      <rect x="140" y="150" width="50" height="100" fill="#B388FF" />
      <rect x="120" y="120" width="40" height="40" fill="#FFC107" />
      <rect x="240" y="120" width="40" height="40" fill="#FFC107" />
      <circle cx="500" cy="80" r="30" fill="#E0E0E0" />
      <circle cx="320" cy="180" r="20" fill="#6200EA" />
    </svg>`
  ];

  try {
    // Create dist/public/generated directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const generatedDir = path.resolve('dist/public/generated');
    
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    }
    if (!fs.existsSync('dist/public')) {
      fs.mkdirSync('dist/public');
    }
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir);
    }

    // Write main character SVG
    fs.writeFileSync(path.join(generatedDir, 'fallback-main-character.svg'), mainCharSvg);
    
    // Write supporting characters SVG
    fs.writeFileSync(path.join(generatedDir, 'fallback-supporting-characters.svg'), supportingCharsSvg);
    
    // Write scene SVGs
    sceneSvgs.forEach((svg, index) => {
      fs.writeFileSync(path.join(generatedDir, `fallback-scene-${index + 1}.svg`), svg);
    });
    
    // Create an empty audio file for fallback
    fs.writeFileSync(path.join(generatedDir, 'fallback-music.mp3'), '');
    fs.writeFileSync(path.join(generatedDir, 'fallback-music-preview.mp3'), '');
    fs.writeFileSync(path.join(generatedDir, 'fallback-thumbnail.svg'), sceneSvgs[0]);
    
    console.log('Created fallback assets successfully');
  } catch (error) {
    console.error('Error creating fallback assets:', error);
  }
}

// Create a demo project
async function createDemoProject() {
  try {
    // Check if we already have a demo project
    const existingProjects = await db.query.schema.projects.findMany({
      limit: 1
    });
    
    if (existingProjects.length > 0) {
      console.log('Demo project already exists, skipping creation');
      return;
    }
    
    // Create a new project
    const [project] = await db.insert(schema.projects).values({
      dayDescription: "Today, I woke up feeling energetic. I had a productive meeting at work where my ideas were appreciated. Later, I went for a walk in the park and saw some cute dogs playing. Overall, it was a positive day with small wins!",
      status: 'in_progress',
      isPublic: false,
      shareToken: nanoid(10)
    }).returning();
    
    // Add demo script
    await db.insert(schema.scripts).values({
      projectId: project.id,
      content: `Title: "Small Victories"
      
Scene 1: Morning Sunrise
Our protagonist wakes up as sunlight streams through the window, feeling unusually energetic.

Scene 2: The Big Meeting
At the office, our protagonist presents ideas that colleagues respond to with enthusiasm.

Scene 3: Afternoon Respite
A peaceful walk through the park, watching playful dogs brings joy and reflection.

Scene 4: Evening Contentment
Day ends with a sense of accomplishment and appreciation for the small wins.`,
      summary: "A day-in-the-life story about appreciating the small victories that add up to a fulfilling day. From a productive meeting to peaceful moments in the park, our protagonist learns that sometimes the best days aren't about big achievements but about small moments of connection and progress."
    });
    
    // Add demo characters
    await db.insert(schema.characters).values({
      projectId: project.id,
      mainCharacterUrl: "/generated/fallback-main-character.svg",
      mainCharacterDescription: "Stylized, optimistic persona with energetic features",
      supportingCharactersUrl: "/generated/fallback-supporting-characters.svg",
      supportingCharactersDescription: "Colleagues, park visitors, and playful dogs"
    });
    
    // Add demo dialogue
    await db.insert(schema.dialogues).values({
      projectId: project.id,
      lines: [
        { character: "MAIN CHARACTER", text: "Today feels different somehow. Like something good is waiting just around the corner." },
        { character: "BOSS", text: "I have to say, that presentation was exactly what we needed. Great job!" },
        { character: "MAIN CHARACTER", text: "Sometimes it's the small wins that make all the difference." },
        { character: "STRANGER AT PARK", text: "Cute dogs, aren't they? Always living in the moment." },
        { character: "MAIN CHARACTER", text: "In a world of big expectations, today reminded me that life is made of little moments worth celebrating." }
      ]
    });
    
    // Add demo visuals
    await db.insert(schema.visuals).values({
      projectId: project.id,
      scenes: [
        {
          imageUrl: "/generated/fallback-scene-1.svg",
          description: "Morning scene with the main character waking up and starting their day."
        },
        {
          imageUrl: "/generated/fallback-scene-2.svg",
          description: "Office scene with the main character presenting ideas to colleagues."
        },
        {
          imageUrl: "/generated/fallback-scene-3.svg",
          description: "Park scene with dogs playing and the main character observing."
        },
        {
          imageUrl: "/generated/fallback-scene-4.svg",
          description: "Evening scene with the main character reflecting on the day's events."
        }
      ]
    });
    
    console.log('Created demo project successfully');
  } catch (error) {
    console.error('Error creating demo project:', error);
  }
}

async function seed() {
  try {
    // Create fallback assets
    await createFallbackAssets();
    
    // Create a demo project
    await createDemoProject();
  } catch (error) {
    console.error(error);
  }
}

seed();
