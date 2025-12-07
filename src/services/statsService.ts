
import { VisitorStats } from '../types';
import { supabase } from './supabaseClient';

const TABLE = 'visitor_stats';
const ROW_ID = 'main';

const DEFAULT_STATS: VisitorStats = {
  browsers: 0,
  recruiters: 0,
  bots: 0
};

export const getStats = async (): Promise<VisitorStats> => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('browsers, recruiters, bots')
      .eq('id', ROW_ID)
      .single();

    if (error || !data) return DEFAULT_STATS;

    return {
      browsers: data.browsers || 0,
      recruiters: data.recruiters || 0,
      bots: data.bots || 0
    };
  } catch {
    return DEFAULT_STATS;
  }
};

export const incrementStat = async (type: keyof VisitorStats) => {
  try {
    // 1. Fetch current (Naive approach since we don't have an RPC function setup)
    // A better way is creating a Postgres Function `increment(row_id, column_name)`
    // But for this client-side demo, we read-then-write or use simple update syntax if possible.
    // Supabase JS doesn't support 'increment' directly on update without RPC.

    // We will do a optimistic RPC call if it existed, simply fetch-update here with the risk of race conditions
    // acceptable for this low-stakes portfolio.

    const { data } = await supabase
      .from(TABLE)
      .select(type)
      .eq('id', ROW_ID)
      .single();

    const currentValue = data ? (data as any)[type] : 0;

    await supabase
      .from(TABLE)
      .update({ [type]: currentValue + 1 })
      .eq('id', ROW_ID);

  } catch (e) {
    console.error("Failed to increment stat", e);
  }
};
