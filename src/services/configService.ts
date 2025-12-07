
import { AdminConfig } from '../types';
import { supabase } from './supabaseClient';

const TABLE = 'admin_config';

// Default values if no config is saved
const DEFAULT_CONFIG: AdminConfig = {
  botTrapKey: ' Seahorse ',
  salaryThreshold: 6500,
  enableScreenshots: true,
  authMode: 'normal',
  useAI: false,
  morsePairs: []
};

export const getConfig = async (): Promise<AdminConfig> => {
  try {
    const { data: queryData, error: queryError } = await supabase
      .from(TABLE)
      .select('config_json')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (queryError || !queryData || queryData.length === 0) return DEFAULT_CONFIG;

    return queryData[0].config_json as AdminConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = async (config: AdminConfig) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .insert([
        { config_json: config }
      ]);

    if (error) console.error("Failed to save admin config to DB", error);
  } catch (e) {
    console.error("Failed to save config", e);
  }
};
