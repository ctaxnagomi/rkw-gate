# OAuth Implementation Plan

## Goal

Replace mock login with real Supabase Auth (GitHub, Google, Email/Password).

## 1. Auth Service (`services/authService.ts`)

Create a new service to handle Supabase Auth interactions.

- `signInWithGithub()`
- `signInWithGoogle()`
- `signInWithPassword(email, password)`
- `signOut()`
- `getCurrentSession()`
- `onAuthStateChange(callback)`

## 2. Update Login Screen (`components/LoginScreen.tsx`)

Refactor the UI to use the real service.

- **GitHub**: Call `signInWithGithub`.
- **Google**: Call `signInWithGoogle`.
- **Credentials**: Call `signInWithPassword`.
- **Error Handling**: Display auth errors (e.g., "Invalid credentials").

## 3. App State Integration (`App.tsx`)

- Listen for Auth State changes.
- If user logs out, redirect to `GatekeeperState.ACTIVE` or `LOGIN`.
- (Optional) Auto-login if session exists? *Decision: Keep explicit login for Security feel.*

## 4. Admin Panel (`components/AdminPanel.tsx`)

- Update "Logout" button to call `authService.signOut()`.

## User Action Required

- User must enable GitHub/Google providers in Supabase Dashboard.
- User must set Redirect URLs in Supabase to `http://localhost:3000` (or production URL).
