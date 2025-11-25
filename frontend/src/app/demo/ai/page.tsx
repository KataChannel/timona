import { Metadata } from 'next';
import AiDashboard from '@/components/ai/AiDashboard';

export const metadata: Metadata = {
  title: 'AI-Powered Task Management | rausachcore',
  description: 'Intelligent task management with AI-powered suggestions and analytics',
};

export default function AiPage() {
  return <AiDashboard />;
}