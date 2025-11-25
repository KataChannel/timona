import { useWebsiteSetting } from './useWebsiteSettings';

/**
 * Hook để lấy tên website từ settings
 * Mặc định trả về 'NoNameCore' nếu chưa có settings
 */
export function useSiteName() {
  const { value: siteName, loading } = useWebsiteSetting('site.name');
  
  return {
    siteName: siteName || 'NoNameCore',
    loading,
  };
}
