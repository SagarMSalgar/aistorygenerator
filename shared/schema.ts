import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Project status options
export type ProjectStatus = 'in_progress' | 'completed' | 'saved';

// Step status options
export type StepStatus = 'waiting' | 'active' | 'in-progress' | 'complete';

// Types for generated content
export type ScriptData = {
  content: string;
  summary: string;
  title: string;
};

export type CharacterData = {
  mainCharacterUrl: string;
  mainCharacterDescription: string;
  supportingCharactersUrl: string;
  supportingCharactersDescription: string;
};

export type DialogueLine = {
  character: string;
  text: string;
};

export type DialogueData = {
  lines: DialogueLine[];
};

export type SceneData = {
  imageUrl: string;
  description: string;
};

export type VisualData = {
  scenes: SceneData[];
};

export type MusicData = {
  title: string;
  artist: string;
  genre: string;
  mood: string;
  license: string;
  url: string;
  previewUrl: string;
};

export type VideoData = {
  url: string;
  thumbnailUrl: string;
  duration: string;
};

// Projects table - main storage for user cartoon projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  dayDescription: text("day_description").notNull(),
  status: text("status").notNull().$type<ProjectStatus>().default('in_progress'),
  isPublic: boolean("is_public").default(false),
  shareToken: text("share_token").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Scripts table - stores generated scripts
export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Characters table - stores character design info
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  mainCharacterUrl: text("main_character_url").notNull(),
  mainCharacterDescription: text("main_character_description").notNull(),
  supportingCharactersUrl: text("supporting_characters_url").notNull(),
  supportingCharactersDescription: text("supporting_characters_description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Dialogues table - stores dialogue data
export const dialogues = pgTable("dialogues", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  lines: jsonb("lines").notNull().$type<DialogueLine[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Visuals table - stores scene visuals
export const visuals = pgTable("visuals", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  scenes: jsonb("scenes").notNull().$type<SceneData[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Music table - stores selected music
export const music = pgTable("music", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre").notNull(),
  mood: text("mood").notNull(),
  license: text("license").notNull(),
  url: text("url").notNull(),
  previewUrl: text("preview_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Videos table - stores final compiled videos
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  duration: text("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Define relationships
export const projectsRelations = relations(projects, ({ one, many }) => ({
  script: one(scripts, {
    fields: [projects.id],
    references: [scripts.projectId]
  }),
  characters: one(characters, {
    fields: [projects.id],
    references: [characters.projectId]
  }),
  dialogue: one(dialogues, {
    fields: [projects.id],
    references: [dialogues.projectId]
  }),
  visuals: one(visuals, {
    fields: [projects.id],
    references: [visuals.projectId]
  }),
  music: one(music, {
    fields: [projects.id],
    references: [music.projectId]
  }),
  video: one(videos, {
    fields: [projects.id],
    references: [videos.projectId]
  })
}));

// Zod schemas for validation
export const projectInsertSchema = createInsertSchema(projects);
export type ProjectInsert = z.infer<typeof projectInsertSchema>;
export type Project = typeof projects.$inferSelect;

export const scriptInsertSchema = createInsertSchema(scripts);
export type ScriptInsert = z.infer<typeof scriptInsertSchema>;
export type Script = typeof scripts.$inferSelect;

export const characterInsertSchema = createInsertSchema(characters);
export type CharacterInsert = z.infer<typeof characterInsertSchema>;
export type Character = typeof characters.$inferSelect;

export const dialogueInsertSchema = createInsertSchema(dialogues);
export type DialogueInsert = z.infer<typeof dialogueInsertSchema>;
export type Dialogue = typeof dialogues.$inferSelect;

export const visualInsertSchema = createInsertSchema(visuals);
export type VisualInsert = z.infer<typeof visualInsertSchema>;
export type Visual = typeof visuals.$inferSelect;

export const musicInsertSchema = createInsertSchema(music);
export type MusicInsert = z.infer<typeof musicInsertSchema>;
export type Music = typeof music.$inferSelect;

export const videoInsertSchema = createInsertSchema(videos);
export type VideoInsert = z.infer<typeof videoInsertSchema>;
export type Video = typeof videos.$inferSelect;

// For a complete cartoon project model
export type CartoonProject = {
  project: Project;
  script: Script | null;
  characters: Character | null;
  dialogue: Dialogue | null;
  visuals: Visual | null;
  music: Music | null;
  video: Video | null;
};
