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

// 🌟 9. 新規追加：クリティカル評価（裏側でのみ集計）
export const criticalVotes = sqliteTable('critical_votes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  commentId: text('comment_id').notNull().references(() => comments.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),       // 🌟 通知を受け取る人（コメントを書いた人）
  senderId: text('sender_id').notNull().references(() => users.id),   // 🌟 アクションを起こした人（💡を押した人）
  type: text('type').notNull(),                                       // 'critical' や 'reply' など
  threadId: text('thread_id').references(() => threads.id),           // 飛び先のリンク用
  commentId: text('comment_id').references(() => comments.id),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),     // 既読フラグ
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// schema.ts の該当箇所

export const privateMemos = sqliteTable('private_memos', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  rawText: text('raw_text').notNull(),
  summary: text('summary').notNull(),
  label: text('label').notNull().default('その他'), // 🌟 追加：AIが自動分類するラベル（初期値は'その他'）
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const reviewRequests = sqliteTable('review_requests', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  
  // 外部サイトのURL（個人開発アプリなど）
  targetUrl: text('target_url'),
  // 任意：Gakuru内のプロジェクトID（内部プロジェクトのレビューの場合に紐付ける）
  linkedProjectId: text('linked_project_id'),
  // 任意：スクリーンショットなどの画像URL
  imageUrl: text('image_url'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 🌟 2. 寄せられたフィードバック（コメント）のテーブル
export const reviewFeedbacks = sqliteTable('review_feedbacks', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().references(() => reviewRequests.id),
  authorId: text('author_id').notNull().references(() => users.id),
  
  // レビューのタイプ（先ほどのKPT風）
  type: text('type', { enum: ['good', 'idea', 'fix', 'comment'] }).notNull().default('comment'),
  content: text('content').notNull(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// db/schema.ts 内に追記
// ※上部のインポートに sql が無ければ追加してください: import { sql } from "drizzle-orm";

// 🌟 ユーザーの貢献度やポイントを管理するテーブル
export const userStats = sqliteTable('user_stats', {
  // usersテーブルのidと紐付け
  userId: text('user_id').primaryKey().references(() => users.id),
  
  // 現在保有しているポイント（将来、投稿時に50pt消費する用）
  currentPoints: integer('current_points').notNull().default(0),
  
  // 累計の貢献スコア（消費されても減らない、ランキングや称号の判定用）
  totalContributionScore: integer('total_contribution_score').notNull().default(0),
  
  // 過去に他人のプロジェクトやレビューにコメントした総数
  feedbackCount: integer('feedback_count').notNull().default(0),
  
  // 更新日時
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});