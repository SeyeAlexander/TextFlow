import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // Links to auth.users
  email: text("email"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const folders = pgTable("folders", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .references(() => profiles.id)
    .notNull(),
  parentId: uuid("parent_id"), // Self-reference for nesting
  name: text("name").notNull(),
  color: text("color").default("#000000"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .references(() => profiles.id)
    .notNull(),
  folderId: uuid("folder_id").references(() => folders.id),
  name: text("name").notNull(),
  content: jsonb("content").default({}), // Lexical JSON
  yjsState: text("yjs_state"), // Stored as base64 or bytea. Using text/base64 for simplicity in prototype
  isPublic: boolean("is_public").default(false),
  isStarred: boolean("is_starred").default(false),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type Document = typeof documents.$inferSelect;

// Chats & Messages
export const chatTypeEnum = pgEnum("chat_type", ["dm", "group"]);

export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").default("dm").notNull(), // 'dm' or 'group' - using text for simplicity or verify enum support
  name: text("name"), // Nullable for DMs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }),
});

export const chatParticipants = pgTable(
  "chat_participants",
  {
    chatId: uuid("chat_id")
      .references(() => chats.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.chatId, t.userId] }),
  }),
);

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;

// Sharing & Notifications
export const documentCollaborators = pgTable(
  "document_collaborators",
  {
    documentId: uuid("document_id")
      .references(() => documents.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.documentId, t.userId] }),
  }),
);

export const notificationTypeEnum = pgEnum("notification_type", ["invite", "limit"]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipientId: uuid("recipient_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  type: notificationTypeEnum("type").notNull(),
  data: jsonb("data"), // Stores documentId, etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DocumentCollaborator = typeof documentCollaborators.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
