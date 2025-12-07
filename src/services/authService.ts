
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export interface AuthState {
    session: Session | null;
    user: User | null;
    loading: boolean;
}

export const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) throw error;
};

export const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        }
    });
    if (error) throw error;
};

export const signInWithPassword = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
    });
    if (error) throw error;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
};
