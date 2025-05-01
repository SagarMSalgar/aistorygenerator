import { db } from "@db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  projects,
  scripts,
  characters,
  dialogues,
  visuals,
  music,
  videos,
  CartoonProject,
  ProjectStatus,
  DialogueLine,
  SceneData
} from "@shared/schema";

// Project operations
export const storage = {
  // Create a new project
  async createProject(dayDescription: string, status: ProjectStatus) {
    const [project] = await db.insert(projects).values({
      dayDescription,
      status
    }).returning();
    
    return project;
  },
  
  // Get a project by ID
  async getProject(id: number): Promise<CartoonProject | null> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        script: true,
        characters: true,
        dialogue: true,
        visuals: true,
        music: true,
        video: true
      }
    });
    
    if (!project) return null;
    
    return {
      project,
      script: project.script,
      characters: project.characters,
      dialogue: project.dialogue,
      visuals: project.visuals,
      music: project.music,
      video: project.video
    };
  },
  
  // Update project status
  async updateProjectStatus(id: number, status: ProjectStatus) {
    const [updatedProject] = await db.update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    
    return updatedProject;
  },
  
  // Make project public and generate share token
  async makeProjectPublic(id: number) {
    const shareToken = nanoid(10);
    
    const [updatedProject] = await db.update(projects)
      .set({ 
        isPublic: true, 
        shareToken,
        updatedAt: new Date() 
      })
      .where(eq(projects.id, id))
      .returning();
    
    return updatedProject;
  },
  
  // Get project by share token
  async getProjectByShareToken(token: string) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.shareToken, token),
      with: {
        script: true,
        characters: true,
        dialogue: true,
        visuals: true,
        music: true,
        video: true
      }
    });
    
    if (!project) return null;
    
    return {
      project,
      script: project.script,
      characters: project.characters,
      dialogue: project.dialogue,
      visuals: project.visuals,
      music: project.music,
      video: project.video
    };
  },
  
  // Script operations
  async saveScript(projectId: number, content: string, summary: string) {
    // Check if script already exists
    const existingScript = await db.query.scripts.findFirst({
      where: eq(scripts.projectId, projectId)
    });
    
    if (existingScript) {
      // Update existing script
      const [updatedScript] = await db.update(scripts)
        .set({ content, summary })
        .where(eq(scripts.id, existingScript.id))
        .returning();
      
      return updatedScript;
    } else {
      // Create new script
      const [newScript] = await db.insert(scripts)
        .values({ projectId, content, summary })
        .returning();
      
      return newScript;
    }
  },
  
  // Character operations
  async saveCharacters(
    projectId: number, 
    mainCharacterUrl: string, 
    mainCharacterDescription: string,
    supportingCharactersUrl: string,
    supportingCharactersDescription: string
  ) {
    const existingCharacters = await db.query.characters.findFirst({
      where: eq(characters.projectId, projectId)
    });
    
    if (existingCharacters) {
      const [updatedCharacters] = await db.update(characters)
        .set({ 
          mainCharacterUrl, 
          mainCharacterDescription,
          supportingCharactersUrl,
          supportingCharactersDescription
        })
        .where(eq(characters.id, existingCharacters.id))
        .returning();
      
      return updatedCharacters;
    } else {
      const [newCharacters] = await db.insert(characters)
        .values({ 
          projectId, 
          mainCharacterUrl, 
          mainCharacterDescription,
          supportingCharactersUrl,
          supportingCharactersDescription
        })
        .returning();
      
      return newCharacters;
    }
  },
  
  // Dialogue operations
  async saveDialogue(projectId: number, lines: DialogueLine[]) {
    const existingDialogue = await db.query.dialogues.findFirst({
      where: eq(dialogues.projectId, projectId)
    });
    
    if (existingDialogue) {
      const [updatedDialogue] = await db.update(dialogues)
        .set({ lines })
        .where(eq(dialogues.id, existingDialogue.id))
        .returning();
      
      return updatedDialogue;
    } else {
      const [newDialogue] = await db.insert(dialogues)
        .values({ projectId, lines })
        .returning();
      
      return newDialogue;
    }
  },
  
  // Visual operations
  async saveVisuals(projectId: number, scenes: SceneData[]) {
    const existingVisuals = await db.query.visuals.findFirst({
      where: eq(visuals.projectId, projectId)
    });
    
    if (existingVisuals) {
      const [updatedVisuals] = await db.update(visuals)
        .set({ scenes })
        .where(eq(visuals.id, existingVisuals.id))
        .returning();
      
      return updatedVisuals;
    } else {
      const [newVisuals] = await db.insert(visuals)
        .values({ projectId, scenes })
        .returning();
      
      return newVisuals;
    }
  },
  
  // Music operations
  async saveMusic(
    projectId: number, 
    title: string,
    artist: string,
    genre: string,
    mood: string,
    license: string,
    url: string,
    previewUrl: string
  ) {
    const existingMusic = await db.query.music.findFirst({
      where: eq(music.projectId, projectId)
    });
    
    if (existingMusic) {
      const [updatedMusic] = await db.update(music)
        .set({ 
          title, artist, genre, mood, license, url, previewUrl
        })
        .where(eq(music.id, existingMusic.id))
        .returning();
      
      return updatedMusic;
    } else {
      const [newMusic] = await db.insert(music)
        .values({ 
          projectId, title, artist, genre, mood, license, url, previewUrl
        })
        .returning();
      
      return newMusic;
    }
  },
  
  // Video operations
  async saveVideo(
    projectId: number,
    url: string,
    thumbnailUrl: string,
    duration: string
  ) {
    const existingVideo = await db.query.videos.findFirst({
      where: eq(videos.projectId, projectId)
    });
    
    if (existingVideo) {
      const [updatedVideo] = await db.update(videos)
        .set({ url, thumbnailUrl, duration })
        .where(eq(videos.id, existingVideo.id))
        .returning();
      
      return updatedVideo;
    } else {
      const [newVideo] = await db.insert(videos)
        .values({ projectId, url, thumbnailUrl, duration })
        .returning();
      
      return newVideo;
    }
  }
};
