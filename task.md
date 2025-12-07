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

- [x] **Reorganization**
  - [x] Create core directories (`src/pages`, `src/components`, `src/services`, `src/types`)
  - [x] Move all component files to their new homes
  - [x] Update all import paths in `App.tsx` and sub-components
  - [x] Configure `index.html` to point to `src/index.tsx`
  - [x] Verify Build (`npm run build`)
  - [x] Implement User Data Isolation (SQL Migration + Service logic)
  - [/] Address Final Accessibility Lints in ProfileBuilder

- [x] **Deployment**
  - [x] Build Production (`npm run build`)
  - [x] Setup Environment Variables in Netlify
  - [x] Deploy to Netlify
  - [x] Update Supabase Redirect URLs
  - [x] Update OAuth Provider Origins (Google/GitHub)
  - [x] Implement Multi-User Visitor Links (`?target=uid`)
  - [x] Add QR Code Generator to Profile Builder
