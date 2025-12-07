# Project Tasks

- [x] **Infrastructure Modernization**
  - [x] Replace CDN Tailwind with Local PostCSS/Vite build
  - [x] clean up HTML/CSS conflicts
  - [x] Ensure `npm run build` passes

- [x] **AI Integration**
  - [x] Implement `GeminiService` using `@google/genai`
  - [x] Add "AI Mode" Toggle in Admin Panel
  - [x] Implement fallback to Logic Service if AI fails/disabled

- [x] **Backend Integration (Supabase)**
  - [x] Install `@supabase/supabase-js`
  - [x] Setup `.env.local` with credentials
  - [x] Create SQL Schema (`supabase_schema.sql`)
  - [x] Refactor `contentService` (Portfolio Data) -> DB
  - [x] Refactor `auditService` (Interview Logs) -> DB
  - [x] Refactor `statsService` (Visitor Counts) -> DB
  - [x] Refactor `configService` (Admin Settings) -> DB
  - [x] Verify Async Data Handling in Components

- [x] **Authentication (OAuth 2.0)**
  - [x] Setup Supabase Auth Hooks/Service
  - [x] Create/Update `LoginScreen` for Email/Password & Providers
  - [x] Integrate Google & GitHub OAuth
  - [x] Secure Admin Panel behind generic Auth guard

- [x] **Deployment**
  - [x] Build Production (`npm run build`)
  - [x] Setup Environment Variables in Netlify
  - [x] Deploy to Netlify
  - [ ] Update Supabase Redirect URLs
  - [ ] Update OAuth Provider Origins (Google/GitHub)
