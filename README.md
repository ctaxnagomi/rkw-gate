
# RKW-AI-Gatekeeper Web

**A Retro 8-Bit Portfolio Guardian & Builder**

This application acts as a gatekeeper to your professional portfolio, using logic-based interviews to screen visitors (Browsers, Recruiters, Bots). Once access is granted, it renders a dynamic, customizable portfolio page.

## 🏗 Architecture (Frontend-First)

Currently, this application runs entirely on the **Client-Side**. To ensure zero-cost deployment and ease of use, all persistence is handled via the browser's `localStorage`.

### Data Storage Locations:
1.  **Configuration**: `gatekeeper_config_v1` (Admin settings, Bot Trap Key)
2.  **Portfolio Content**: `gatekeeper_portfolio_v1` (Projects, About, Hero text, GitHub)
3.  **Audit Logs**: `gatekeeper_logs_v1` (Interview transcripts & screenshots)
4.  **Statistics**: `gatekeeper_stats_v1` (Visitor counters)

---

## 🔌 Backend Integration Guide (Database & API)

To make this application production-ready with persistent data across devices, you must replace the `localStorage` logic with real API calls.

### 1. Database Schema (SQL Example)
If using **Supabase**, **PostgreSQL**, or **MySQL**, create the following tables:

```sql
-- Store the portfolio configuration
CREATE TABLE portfolio_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  hero_title TEXT,
  hero_subtitle TEXT,
  about_content TEXT,
  stats_json JSONB,
  github_json JSONB -- Stores { visible: boolean, username: string }
);

-- Store projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  title TEXT,
  description TEXT,
  tags TEXT[], -- Array of strings
  image_url TEXT,
  link_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Store Audit Logs (Interviews)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP DEFAULT NOW(),
  visitor_ip TEXT, -- Optional
  question TEXT,
  answer TEXT,
  outcome TEXT, -- 'GRANT', 'REJECT', 'PENDING'
  screenshot_url TEXT -- Store image in S3/Storage Bucket, save URL here
);

-- Store Statistics
CREATE TABLE visitor_stats (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  browsers INT DEFAULT 0,
  recruiters INT DEFAULT 0,
  bots INT DEFAULT 0
);

-- Store Admin/Security Config
CREATE TABLE admin_config (
  id UUID PRIMARY KEY,
  salary_threshold INT DEFAULT 6500,
  auth_mode TEXT DEFAULT 'normal', -- 'normal' or 'morse'
  morse_pairs JSONB -- Array of { id, text, audioData (or audioUrl) }
);
```

### 2. Service Integration
You need to modify the files in the `services/` directory.

#### `services/contentService.ts`
Replace `localStorage.getItem` with `fetch` or your DB client.

```typescript
// BEFORE
export const getPortfolioConfig = () => JSON.parse(localStorage.getItem(PORTFOLIO_KEY));

// AFTER (Example)
export const getPortfolioConfig = async () => {
  const response = await fetch('https://api.your-backend.com/portfolio');
  return await response.json();
};
```

#### `services/auditService.ts`
Replace `saveToLocal` with a POST request.

```typescript
// AFTER (Example)
export const logAttempt = async (entry) => {
  // Upload screenshot to S3/Supabase Storage first, get URL
  // const screenshotUrl = await uploadImage(entry.screenshot); 
  
  await fetch('https://api.your-backend.com/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...entry, screenshot: screenshotUrl })
  });
};
```

#### `services/statsService.ts`
Implement atomic increments on your server to prevent race conditions.

```typescript
// AFTER (Example)
export const incrementStat = async (type) => {
  await fetch(`https://api.your-backend.com/stats/increment?type=${type}`, { method: 'POST' });
};
```

### 3. Authentication & GitHub Stats Autofill
The current `LoginScreen.tsx` is a simulation.
1.  Integrate **Firebase Auth**, **Supabase Auth**, or **Auth0**.
2.  In `LoginScreen.tsx`, replace `handleLogin` with your provider's login function.
3.  Protect your API endpoints using the JWT token received from the auth provider.
4.  **GitHub Stats**: If you implement GitHub OAuth login, your backend should extract the username from the OAuth profile and update the `github_json` field in `portfolio_config` automatically.

---

## 📜 Configuration & Schema Reference (JSON)

If you are manually populating the database or `localStorage`, adhere to these JSON structures.

### Portfolio Config (`portfolio_config` / `localStorage`)
```json
{
  "hero": {
    "visible": true,
    "title": "My Portfolio",
    "subtitle": "Full Stack Dev"
  },
  "projects": {
    "visible": true,
    "title": "My Projects",
    "items": [
      {
        "id": "uuid-1",
        "title": "Project A",
        "description": "Desc...",
        "tags": ["React", "Node"],
        "imageUrl": "https://example.com/img.png",
        "link": "https://github.com/myrepo"
      }
    ]
  },
  "about": {
    "visible": true,
    "title": "About Me",
    "content": "I am a developer..."
  },
  "stats": {
    "visible": true,
    "experience": "5 Years",
    "projects": "20+",
    "coffee": "1000+"
  },
  "github": {
    "visible": true,
    "username": "octocat"
  }
}
```

### Admin Config (`admin_config` / `localStorage`)
```json
{
  "botTrapKey": " Seahorse ",
  "salaryThreshold": 7000,
  "enableScreenshots": true,
  "authMode": "morse", 
  "morsePairs": [
     {
       "id": "uuid-1",
       "text": "-.-.",
       "audioData": "data:audio/wav;base64,UklGRi..." 
     }
  ]
}
```