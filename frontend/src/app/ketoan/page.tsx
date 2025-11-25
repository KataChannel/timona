'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Package, ArrowRightLeft } from 'lucide-react';

export default function KeToanPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // if (!loading && isAuthenticated) {
    //   router.push('/admin');
    // }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const modules = [
    {
      name: 'Hóa Đơn',
      slug: '/ketoan/listhoadon',
      icon: FileText,
      description: 'Quản lý hóa đơn bán hàng, thu chi',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      name: 'Sản Phẩm',
      slug: '/ketoan/sanpham',
      icon: Package,
      description: 'Quản lý danh mục sản phẩm, giá bán',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      name: 'Xuất Nhập Tồn',
      slug: '/ketoan/xuatnhapton',
      icon: ArrowRightLeft,
      description: 'Quản lý kho hàng, xuất nhập tồn',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hệ Thống Kế Toán
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý tài chính và kế toán doanh nghiệp
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.slug}
                onClick={() => router.push(module.slug)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                {/* Icon Header */}
                <div className={`${module.color} p-6 transition-all duration-300 ${module.hoverColor}`}>
                  <Icon className="w-12 h-12 text-white mx-auto" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    {module.name}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {module.description}
                  </p>

                  {/* Action Button */}
                  <button
                    className={`w-full ${module.color} text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 ${module.hoverColor} transform group-hover:scale-105`}
                  >
                    Truy cập →
                  </button>
                </div>

                {/* Animated Border Effect */}
                <div className="h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              Hóa Đơn
            </div>
            <p className="text-gray-600">Quản lý thu chi</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              <Package className="w-8 h-8 mx-auto mb-2" />
              Sản Phẩm
            </div>
            <p className="text-gray-600">Danh mục hàng hóa</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-2" />
              Kho Hàng
            </div>
            <p className="text-gray-600">Báo cáo tồn kho</p>
          </div>
        </div>
      </div>
    </div>
  );
}
