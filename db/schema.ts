import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. ユーザーテーブル
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  skills: text('skills', { mode: 'json' }).$type<string[]>(),
  portfolioUrl: text('portfolio_url'), // 🌟 追加：ポートフォリオのURL（GitHub, Notion, 個人サイトなど）
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 2. スレッド
export const threads = sqliteTable('threads', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id),
  categoryId: text('category_id').notNull(), 
  title: text('title').notNull(),
  content: text('content').notNull(), 
  imageUrl: text('image_url'), // 🌟 追加：スレッドに添付する画像
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 3. コメント
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull().references(() => threads.id),
  authorId: text('author_id').notNull().references(() => users.id),
  parentId: text('parent_id'), 
  roleTag: text('role_tag'), 
  content: text('content').notNull(),
  imageUrl: text('image_url'), // 🌟 追加：コメントに添付する画像
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 4. チップ機能
export const tips = sqliteTable('tips', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => users.id),
  receiverId: text('receiver_id').notNull().references(() => users.id),
  commentId: text('comment_id').references(() => comments.id), 
  amount: integer('amount').notNull(), 
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 5. プロジェクト
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(), 
  progressStatus: text('progress_status').notNull().default('企画中'),
  onboardingMemo: text('onboarding_memo'),
  recruitingRoles: text('recruiting_roles', { mode: 'json' }).$type<string[]>(),
  isOpenToAll: integer('is_open_to_all', { mode: 'boolean' }).default(true),
  githubUrl: text('github_url'),
  figmaUrl: text('figma_url'),
  discordUrl: text('discord_url'),
  documentUrl: text('document_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 6. プロジェクト参加者名簿
export const projectMembers = sqliteTable('project_members', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  userId: text('user_id').notNull().references(() => users.id),
  roleText: text('role_text'), 
  status: text('status').notNull().default('approved'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 7. プロジェクト内チャット
export const projectMessages = sqliteTable('project_messages', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  authorId: text('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  imageUrl: text('image_url'), // 🌟 追加：チャットに添付する画像
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 🌟 8. 新規追加：DM（ダイレクトメッセージ）機能
export const directMessages = sqliteTable('direct_messages', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => users.id),
  receiverId: text('receiver_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  imageUrl: text('image_url'), // 🌟 画像も送れるように準備
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});