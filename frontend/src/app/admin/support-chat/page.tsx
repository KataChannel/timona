import AdminChatDashboard from '@/components/support-chat/AdminChatDashboard';

export const metadata = {
  title: 'Chat Hỗ Trợ Khách Hàng | Admin',
  description: 'Quản lý hội thoại hỗ trợ khách hàng',
};

export default function SupportChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminChatDashboard />
    </div>
  );
}
