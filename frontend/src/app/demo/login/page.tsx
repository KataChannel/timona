import AuthDemo from '@/components/auth/AuthDemo';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Authentication Demo
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Test OAuth authentication with Google, Facebook, and phone login
          </p>
          <AuthDemo />
        </div>
      </div>
    </div>
  );
}
