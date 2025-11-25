'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import {
  GET_SYSTEM_GUIDE_BY_SLUG,
  INCREMENT_GUIDE_VIEW,
  VOTE_GUIDE_HELPFUL,
} from '@/graphql/release-hub/guide.queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Book,
  FileText,
  Video,
  Code,
  HelpCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const GUIDE_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  QUICK_START: { label: 'Bắt đầu nhanh', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
  TUTORIAL: { label: 'Hướng dẫn', icon: Book, color: 'bg-blue-100 text-blue-800' },
  USER_GUIDE: { label: 'Hướng dẫn sử dụng', icon: FileText, color: 'bg-cyan-100 text-cyan-800' },
  API_REFERENCE: { label: 'Tài liệu API', icon: Code, color: 'bg-purple-100 text-purple-800' },
  VIDEO_GUIDE: { label: 'Video hướng dẫn', icon: Video, color: 'bg-pink-100 text-pink-800' },
  FAQ: { label: 'Câu hỏi thường gặp', icon: HelpCircle, color: 'bg-green-100 text-green-800' },
  TROUBLESHOOTING: { label: 'Khắc phục sự cố', icon: HelpCircle, color: 'bg-red-100 text-red-800' },
  BEST_PRACTICES: { label: 'Best Practices', icon: Book, color: 'bg-indigo-100 text-indigo-800' },
};

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);

  const { data, loading, error } = useQuery(GET_SYSTEM_GUIDE_BY_SLUG, {
    variables: { slug: params.slug },
    skip: !params.slug,
    onCompleted: (data) => {
      if (data?.systemGuideBySlug) {
        incrementView({ variables: { id: data.systemGuideBySlug.id } });
      }
    },
  });

  const [incrementView] = useMutation(INCREMENT_GUIDE_VIEW);

  const [voteHelpful] = useMutation(VOTE_GUIDE_HELPFUL, {
    onCompleted: () => {
      toast({
        type: 'success',
        title: 'Cảm ơn đánh giá',
        description: 'Phản hồi của bạn đã được ghi nhận',
      });
      setHasVoted(true);
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
    refetchQueries: [GET_SYSTEM_GUIDE_BY_SLUG],
  });

  if (loading) {
    return (
      <div className="container max-w-7xl py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-12 bg-gray-200 animate-pulse rounded" />
            <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.systemGuideBySlug) {
    return (
      <div className="container max-w-7xl py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold mb-2">Không tìm thấy hướng dẫn</p>
            <p className="text-gray-600 mb-4">Hướng dẫn không tồn tại hoặc đã bị xóa</p>
            <Button onClick={() => router.push('/guides')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const guide = data.systemGuideBySlug;
  const typeConfig = GUIDE_TYPE_CONFIG[guide.type] || GUIDE_TYPE_CONFIG.USER_GUIDE;
  const TypeIcon = typeConfig.icon;

  const handleVote = (isHelpful: boolean) => {
    voteHelpful({
      variables: {
        id: guide.id,
        isHelpful,
      },
    });
  };

  // Generate TOC from content headings
  const generateTOC = (content: string) => {
    const headingRegex = /^#{1,3}\s+(.+)$/gm;
    const headings: { level: number; text: string; id: string }[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[0].indexOf(' ');
      const text = match[1];
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }

    return headings;
  };

  const toc = guide.content ? generateTOC(guide.content) : [];

  return (
    <div className="container max-w-7xl py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/guides" className="hover:text-blue-600">
              Hướng dẫn
            </Link>
            {guide.parent && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/guides/${guide.parent.slug}`} className="hover:text-blue-600">
                  {guide.parent.title}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{guide.title}</span>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-6 w-6" />
              <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{guide.title}</h1>
            {guide.description && (
              <p className="text-lg text-gray-600">{guide.description}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(guide.updatedAt), 'PPP', { locale: vi })}</span>
              </div>
              {guide.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{guide.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{guide.viewCount || 0} lượt xem</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h3>
                    ),
                  }}
                >
                  {guide.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Child Guides */}
          {guide.children?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bài viết liên quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guide.children.map((child: any) => (
                    <Link
                      key={child.id}
                      href={`/guides/${child.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-semibold group-hover:text-blue-600 transition-colors">
                            {child.title}
                          </p>
                          {child.description && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {child.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Helpful Feedback */}
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="font-semibold text-lg">Hướng dẫn này có hữu ích không?</p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleVote(true)}
                    disabled={hasVoted}
                    className="gap-2"
                  >
                    <ThumbsUp className="h-5 w-5" />
                    Có ({guide.helpfulCount || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleVote(false)}
                    disabled={hasVoted}
                    className="gap-2"
                  >
                    <ThumbsDown className="h-5 w-5" />
                    Không ({guide.notHelpfulCount || 0})
                  </Button>
                </div>
                {hasVoted && (
                  <p className="text-sm text-green-600">
                    Cảm ơn bạn đã đánh giá!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Table of Contents */}
          {toc.length > 0 && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Mục lục</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2 text-sm">
                  {toc.map((item, index) => (
                    <a
                      key={index}
                      href={`#${item.id}`}
                      className={`block hover:text-blue-600 transition-colors ${
                        item.level === 2 ? 'pl-0' : item.level === 3 ? 'pl-4' : 'pl-8'
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lượt xem</span>
                <Badge variant="outline">{guide.viewCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hữu ích</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {guide.helpfulCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Chưa hữu ích</span>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {guide.notHelpfulCount || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 space-y-3">
              <p className="font-semibold text-center">Cần thêm trợ giúp?</p>
              <p className="text-sm text-gray-600 text-center">
                Nếu bạn vẫn gặp khó khăn, hãy liên hệ với chúng tôi
              </p>
              <Button asChild className="w-full">
                <Link href="/support/new">Tạo ticket hỗ trợ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
