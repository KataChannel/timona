'use client';

import { useQuery } from '@apollo/client';
import { useState } from 'react';
import Link from 'next/link';
import { GET_SYSTEM_GUIDES } from '@/graphql/release-hub/guide.queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Book,
  FileText,
  Video,
  Code,
  HelpCircle,
  Search,
  ChevronRight,
  Eye,
  ThumbsUp,
} from 'lucide-react';

const GUIDE_TYPES = [
  { value: '', label: 'Tất cả', icon: Book },
  { value: 'QUICK_START', label: 'Bắt đầu nhanh', icon: FileText },
  { value: 'TUTORIAL', label: 'Hướng dẫn', icon: Book },
  { value: 'USER_GUIDE', label: 'Hướng dẫn sử dụng', icon: FileText },
  { value: 'API_REFERENCE', label: 'Tài liệu API', icon: Code },
  { value: 'VIDEO_GUIDE', label: 'Video hướng dẫn', icon: Video },
  { value: 'FAQ', label: 'Câu hỏi thường gặp', icon: HelpCircle },
  { value: 'TROUBLESHOOTING', label: 'Khắc phục sự cố', icon: HelpCircle },
  { value: 'BEST_PRACTICES', label: 'Best Practices', icon: Book },
];

export default function GuidesPage() {
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error } = useQuery(GET_SYSTEM_GUIDES, {
    variables: {
      type: selectedType || undefined,
      search: searchQuery || undefined,
      parentId: null, // Chỉ lấy guides cấp cao nhất
    },
  });

  const getTypeIcon = (type: string) => {
    const typeConfig = GUIDE_TYPES.find((t) => t.value === type);
    const Icon = typeConfig?.icon || Book;
    return <Icon className="h-5 w-5" />;
  };

  const getTypeLabel = (type: string) => {
    return GUIDE_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      QUICK_START: 'bg-yellow-100 text-yellow-800',
      TUTORIAL: 'bg-blue-100 text-blue-800',
      USER_GUIDE: 'bg-cyan-100 text-cyan-800',
      API_REFERENCE: 'bg-purple-100 text-purple-800',
      VIDEO_GUIDE: 'bg-pink-100 text-pink-800',
      FAQ: 'bg-green-100 text-green-800',
      TROUBLESHOOTING: 'bg-red-100 text-red-800',
      BEST_PRACTICES: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <div className="container max-w-7xl py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">Có lỗi xảy ra: {error.message}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Hướng Dẫn & Tài Liệu</h1>
        <p className="text-gray-600">
          Tìm câu trả lời, hướng dẫn sử dụng và tài liệu kỹ thuật
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm hướng dẫn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        {GUIDE_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              variant={selectedType === type.value ? 'default' : 'outline'}
              onClick={() => setSelectedType(type.value)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Guides Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.systemGuides?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold mb-2">Không tìm thấy hướng dẫn</p>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.systemGuides?.map((guide: any) => (
            <Link key={guide.id} href={`/guides/${guide.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getTypeIcon(guide.type)}
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {guide.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeBadgeColor(guide.type)}>
                      {getTypeLabel(guide.type)}
                    </Badge>
                    {!guide.isPublished && (
                      <Badge variant="outline" className="text-xs">
                        Nháp
                      </Badge>
                    )}
                  </div>

                  {/* Children Count */}
                  {guide.children?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{guide.children.length} bài viết con</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{guide.viewCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{guide.helpfulCount || 0}</span>
                    </div>
                  </div>

                  {/* View Link */}
                  <div className="flex items-center text-sm text-blue-600 group-hover:underline">
                    <span>Xem chi tiết</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
