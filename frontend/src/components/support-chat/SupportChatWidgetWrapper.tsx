'use client';

import { useQuery, gql } from '@apollo/client';
import SupportChatWidget from './SupportChatWidget';

const GET_SUPPORT_CHAT_SETTINGS = gql`
  query GetSupportChatSettings {
    websiteSettings(
      category: "SUPPORT_CHAT"
      isActive: true
    ) {
      key
      value
      type
    }
  }
`;

interface SupportChatSettings {
  enabled: boolean;
  widget_position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primary_color: string;
  welcome_message: string;
  offline_message: string;
  ai_enabled: boolean;
  show_agent_typing: boolean;
  enable_file_upload: boolean;
  enable_emojis: boolean;
  sound_notification: boolean;
  desktop_notification: boolean;
}

export default function SupportChatWidgetWrapper() {
  const { data, loading } = useQuery(GET_SUPPORT_CHAT_SETTINGS);

  if (loading) return null;

  const settings = data?.websiteSettings || [];
  
  // Parse settings into object with proper key mapping
  const config: Partial<SupportChatSettings> = {};
  settings.forEach((setting: any) => {
    // Remove 'support_chat.' prefix to get the actual key
    const key = setting.key.replace('support_chat.', '');
    let value = setting.value;

    // Parse based on type
    if (setting.type === 'BOOLEAN') {
      value = value === 'true';
    } else if (setting.type === 'NUMBER') {
      value = parseFloat(value);
    } else if (setting.type === 'JSON') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        console.error('Failed to parse JSON setting:', key, value);
      }
    } else if (setting.type === 'COLOR') {
      // Ensure color value is valid
      value = value || '#16a34a';
    }

    config[key as keyof SupportChatSettings] = value;
  });

  // Nếu disabled, không render widget
  if (config.enabled === false) {
    return null;
  }

  // Debug: Log config để kiểm tra
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Support Chat Config:', {
      enabled: config.enabled,
      primary_color: config.primary_color,
      widget_position: config.widget_position,
      raw_settings: settings
    });
  }

  // Get API URLs from env
  const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace('/graphql', '') || 
                 "http://116.118.49.243:12001";
  const websocketUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace('/graphql', '/support-chat') || 
                       "http://116.118.49.243:12001/support-chat";

  return (
    <SupportChatWidget
      apiUrl={apiUrl}
      websocketUrl={websocketUrl}
      primaryColor={config.primary_color || '#16a34a'}
      position={(config.widget_position as 'bottom-right' | 'bottom-left') || 'bottom-right'}
    />
  );
}
