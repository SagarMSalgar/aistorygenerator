import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { ProjectStatus } from "@shared/schema";
import { scriptAgent } from "./agents/scriptAgent";
import { characterAgent } from "./agents/characterAgent";
import { dialogueAgent } from "./agents/dialogueAgent";
import { visualAgent } from "./agents/visualAgent";
import { musicAgent } from "./agents/musicAgent";
import { videoAgent } from "./agents/videoAgent";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create and get projects
  app.post("/api/projects", async (req, res) => {
    try {
      const { dayDescription, status } = req.body;
      
      if (!dayDescription) {
        return res.status(400).json({ message: "Day description is required" });
      }
      
      const project = await storage.createProject(dayDescription, status as ProjectStatus);
      
      return res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      return res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      return res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ message: "Failed to fetch project" });
    }
  });
  
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const { status, isPublic } = req.body;
      
      if (status) {
        const updatedProject = await storage.updateProjectStatus(id, status as ProjectStatus);
        return res.json(updatedProject);
      }
      
      if (isPublic) {
        const updatedProject = await storage.makeProjectPublic(id);
        return res.json(updatedProject);
      }
      
      return res.status(400).json({ message: "No valid update parameters provided" });
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({ message: "Failed to update project" });
    }
  });
  
  // Generate script
  app.post("/api/projects/:id/script", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const { dayDescription } = req.body;
      
      if (!dayDescription) {
        return res.status(400).json({ message: "Day description is required" });
      }
      
      // Generate script using AI
      const { content, summary } = await scriptAgent.generateScript(dayDescription);
      
      // Save to database
      const script = await storage.saveScript(projectId, content, summary);
      
      return res.json(script);
    } catch (error) {
      console.error("Error generating script:", error);
      return res.status(500).json({ message: "Failed to generate script" });
    }
  });
  
  // Generate characters
  app.post("/api/projects/:id/characters", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const { script } = req.body;
      
      if (!script) {
        return res.status(400).json({ message: "Script is required" });
      }
      
      // Generate characters using AI
      const {
        mainCharacterUrl,
        mainCharacterDescription,
        supportingCharactersUrl,
        supportingCharactersDescription
      } = await characterAgent.generateCharacters(script);
      
      // Save to database
      const characters = await storage.saveCharacters(
        projectId,
        mainCharacterUrl,
        mainCharacterDescription,
        supportingCharactersUrl,
        supportingCharactersDescription
      );
      
      return res.json(characters);
    } catch (error) {
      console.error("Error generating characters:", error);
      return res.status(500).json({ message: "Failed to generate characters" });
    }
  });
  
  // Generate dialogue
  app.post("/api/projects/:id/dialogue", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const { script, characters } = req.body;
      
      if (!script || !characters) {
        return res.status(400).json({ message: "Script and characters are required" });
      }
      
      // Generate dialogue using AI
      const { lines } = await dialogueAgent.generateDialogue(script, characters);
      
      // Save to database
      const dialogue = await storage.saveDialogue(projectId, lines);
      
      return res.json(dialogue);
    } catch (error) {
      console.error("Error generating dialogue:", error);
      return res.status(500).json({ message: "Failed to generate dialogue" });
    }
  });
  
  // Generate visuals
  app.post("/api/projects/:id/visuals", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const { script, characters, dialogue } = req.body;
      
      if (!script || !characters || !dialogue) {
        return res.status(400).json({ message: "Script, characters, and dialogue are required" });
      }
      
      // Generate visuals using AI
      const { scenes } = await visualAgent.generateVisuals(script, characters, dialogue);
      
      // Save to database
      const visuals = await storage.saveVisuals(projectId, scenes);
      
      return res.json(visuals);
    } catch (error) {
      console.error("Error generating visuals:", error);
      return res.status(500).json({ message: "Failed to generate visuals" });
    }
  });
  
  // Select music
  app.post("/api/projects/:id/music", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const { script } = req.body;
      
      if (!script) {
        return res.status(400).json({ message: "Script is required" });
      }
      
      // Select music using AI
      const { title, artist, genre, mood, license, url, previewUrl } = await musicAgent.selectMusic(script);
      
      // Save to database
      const music = await storage.saveMusic(
        projectId,
        title,
        artist,
        genre,
        mood,
        license,
        url,
        previewUrl
      );
      
      return res.json(music);
    } catch (error) {
      console.error("Error selecting music:", error);
      return res.status(500).json({ message: "Failed to select music" });
    }
  });
  
  // Compile video
  app.post("/api/projects/:id/video", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const { script, characters, dialogue, visuals, music } = req.body;
      
      if (!script || !characters || !dialogue || !visuals || !music) {
        return res.status(400).json({ message: "All components are required for video compilation" });
      }
      
      // Compile video using AI and FFmpeg
      const { url, thumbnailUrl, duration } = await videoAgent.compileVideo(script, characters, dialogue, visuals, music);
      
      // Save to database
      const video = await storage.saveVideo(
        projectId,
        url,
        thumbnailUrl,
        duration
      );
      
      return res.json(video);
    } catch (error) {
      console.error("Error compiling video:", error);
      return res.status(500).json({ message: "Failed to compile video" });
    }
  });
  
  // Get share link
  app.get("/api/projects/:id/share", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // If not already public, make it public
      let shareToken = project.project.shareToken;
      
      if (!project.project.isPublic || !shareToken) {
        const updatedProject = await storage.makeProjectPublic(id);
        shareToken = updatedProject.shareToken;
      }
      
      // Generate share URL based on environment
      const domain = process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',')[0] : 'localhost:5000';
      const shareUrl = `https://${domain}/share/${shareToken}`;
      
      return res.json({ shareUrl, shareToken });
    } catch (error) {
      console.error("Error creating share link:", error);
      return res.status(500).json({ message: "Failed to create share link" });
    }
  });
  
  // Get project by share token
  app.get("/api/share/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Share token is required" });
      }
      
      const project = await storage.getProjectByShareToken(token);
      
      if (!project) {
        return res.status(404).json({ message: "Shared project not found" });
      }
      
      return res.json(project);
    } catch (error) {
      console.error("Error fetching shared project:", error);
      return res.status(500).json({ message: "Failed to fetch shared project" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
