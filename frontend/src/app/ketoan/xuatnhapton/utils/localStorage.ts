import { UserConfig } from '../types';

const CONFIG_KEY = 'xuatnhapton_user_config';

/**
 * Get user configuration from localStorage
 */
export const getUserConfig = (): UserConfig | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as UserConfig;
  } catch (error) {
    console.error('Error reading user config:', error);
    return null;
  }
};

/**
 * Save user configuration to localStorage
 */
export const saveUserConfig = (config: UserConfig): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving user config:', error);
  }
};

/**
 * Clear user configuration from localStorage
 */
export const clearUserConfig = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error('Error clearing user config:', error);
  }
};
