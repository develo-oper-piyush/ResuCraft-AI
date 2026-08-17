import { pgTable, text, timestamp, uuid, jsonb, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const uploadedResumes = pgTable("uploaded_resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  cloudinaryId: text("cloudinary_id"),
  parsedText: text("parsed_text").notNull(),
  analysisJson: jsonb("analysis_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedResumes = pgTable("generated_resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  templateId: text("template_id").default("modern-minimal").notNull(),
  contentJson: jsonb("content_json").notNull(),
  exportUrl: text("export_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resumeEmbeddings = pgTable("resume_embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  resumeId: text("resume_id"),
  contentChunk: text("content_chunk").notNull(),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
