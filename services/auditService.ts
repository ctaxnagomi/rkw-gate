
import { AuditLog } from '../types';
import { supabase } from './supabaseClient';

declare global {
  interface Window {
    html2canvas: any;
  }
}

const TABLE = 'audit_logs';

export const logAttempt = async (
  question: string,
  answer: string,
  outcome: string = 'PENDING'
): Promise<void> => {
  try {
    let screenshotData = '';

    // 1. Capture Screenshot (Client Side)
    // In a full production app, you might upload this image to Storage (Bucket) and save the URL.
    // For this demo, we can save the Base64 (if small enough for TEXT type) or skip it if too large.
    // Given the retro nature, let's keep it simple or use a placeholder URL if upload logic isn't set up.

    if (window.html2canvas) {
      try {
        const canvas = await window.html2canvas(document.body, {
          backgroundColor: '#000000',
          ignoreElements: (element: Element) => element.classList.contains('crt'),
          scale: 0.5 // Reduce resolution
        });
        screenshotData = canvas.toDataURL('image/jpeg', 0.5); // JPEG compression
      } catch (e) {
        console.warn("Screenshot capture failed", e);
      }
    }

    // 2. Persist to Supabase
    const { error } = await supabase
      .from(TABLE)
      .insert([
        {
          question,
          answer,
          outcome,
          screenshot_url: screenshotData.length < 100000 ? screenshotData : 'SCREENSHOT_TOO_LARGE',
          visitor_ip: 'ANON' // IP logging usually done by server/middleware
        }
      ]);

    if (error) {
      console.error('[AUDIT] Supabase Error:', error);
    } else {
      console.log('[AUDIT] Attempt logged successfully');
    }

  } catch (error) {
    console.error('[AUDIT] Failed to log attempt:', error);
  }
};

export const getLogs = async (): Promise<AuditLog[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      question: row.question,
      answer: row.answer,
      outcome: row.outcome,
      screenshot: row.screenshot_url
    }));
  } catch (e) {
    console.error("Failed to fetch logs", e);
    return [];
  }
};