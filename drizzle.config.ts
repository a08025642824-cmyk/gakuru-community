import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// .env.local の環境変数を読み込むための設定
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './db/schema.ts',  // 🌟 ここを src なしのパスに変更しました！
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});