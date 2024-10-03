import { integer, sqliteTable, text, primaryKey, index, real  } from "drizzle-orm/sqlite-core"
import type { AdapterAccountType } from "next-auth/adapters"
import { sql } from "drizzle-orm";
 
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
})
 
export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)
 
export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
})
 
export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)
 
export const authenticators = sqliteTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)

export const characters = sqliteTable("character", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  greeting: text("greeting").notNull(),
  visibility: text("visibility").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  interactionCount: integer("interactionCount").notNull().default(0),
  likeCount: integer("likeCount").notNull().default(0),
  tags: text("tags").notNull().default("[]"),
  avatar_image_url: text("avatar_image_url"),
  banner_image_url: text("banner_image_url"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  temperature: real("temperature"),
  top_p: real("top_p"),
  top_k: integer("top_k"),
  frequency_penalty: real("frequency_penalty"),
  presence_penalty: real("presence_penalty"),
  repetition_penalty: real("repetition_penalty"),
  min_p: real("min_p"),
  top_a: real("top_a"),
  max_tokens: integer("max_tokens")
})

// Define the structure of the messages array
export type ChatMessage = {
  // Define the structure of a single chat message
  // For example:
  id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  character_id?: string;
};

export type ChatMessageArray = ChatMessage[];

// Update the chat_sessions table definition
export const chat_sessions = sqliteTable("chat_session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  character_id: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  messages: text("messages", { mode: "json" }).notNull().$type<ChatMessageArray>(),  
  interaction_count: integer("interaction_count").notNull().default(0),
  last_message_timestamp: integer("last_message_timestamp", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  created_at: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  updated_at: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userCharacterIndex: index('user_character_idx').on(table.user_id, table.character_id),
}));

export const rooms = sqliteTable("room", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  topic: text("topic"),
  visibility: text("visibility").notNull().default("public"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  interactionCount: integer("interactionCount").notNull().default(0),
  likeCount: integer("likeCount").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
});

export const roomCharacters = sqliteTable("room_characters", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roomId: text("roomId")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  characterId: text("characterId")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
});

export const group_chat_session_characters = sqliteTable("group_chat_session_characters", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionId: text("sessionId")
    .notNull()
    .references(() => group_chat_sessions.id, { onDelete: "cascade" }),
  characterId: text("characterId")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
});

// Define the ChatMessage type
export type ChatMessages = {
  role: "assistant" | "user" | "system";
  content: string;
  character_id?: string;
};

export const group_chat_sessions = sqliteTable("group_chat_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roomId: text("roomId")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messages: text("messages", { mode: "json" }).notNull().$type<ChatMessageArray>(),  
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
});

export const personas = sqliteTable("persona", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("displayName").notNull(),
  background: text("background").notNull(),
  isDefault: integer("isDefault", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => sql`CURRENT_TIMESTAMP`),
});