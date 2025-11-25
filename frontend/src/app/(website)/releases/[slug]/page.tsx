'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SYSTEM_RELEASE_BY_SLUG, INCREMENT_RELEASE_DOWNLOAD } from '@/graphql/release-hub/release.queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Download, 
  Eye, 
  CheckCircle2, 
  Wrench, 
  Bug, 
  AlertTriangle,
  Package,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function ReleaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data, loading, error } = useQuery(GET_SYSTEM_RELEASE_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const [incrementDownload] = useMutation(INCREMENT_RELEASE_DOWNLOAD);

  const release = data?.systemReleaseBySlug;

  const handleDownload = async () => {
    if (release?.id) {
      await incrementDownload({ variables: { id: release.id } });
      // Trigger actual download or redirect
      window.open(`/api/download/release/${release.version}`, '_blank');
    }
  };

  const getReleaseTypeColor = (type: string) => {
    switch (type) {
      case 'MAJOR':
        return 'bg-red-500 text-white';
      case 'MINOR':
        return 'bg-blue-500 text-white';
      case 'PATCH':
        return 'bg-green-500 text-white';
      case 'HOTFIX':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-20 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Không tìm thấy phiên bản này</p>
          <Button asChild variant="outline">
            <Link href="/releases">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/releases">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Link>
      </Button>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Badge className={`${getReleaseTypeColor(release.releaseType)} text-lg px-3 py-1`}>
                {release.version}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {release.releaseType}
              </Badge>
            </div>
            <Button onClick={handleDownload} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Tải xuống
            </Button>
          </div>

          <CardTitle className="text-3xl mb-2">{release.title}</CardTitle>
          <CardDescription className="text-base">{release.summary}</CardDescription>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {release.releaseDate
                ? format(new Date(release.releaseDate), 'dd/MM/yyyy', { locale: vi })
                : 'Chưa phát hành'}
              {release.releaseDate && (
                <span className="text-xs">
                  ({formatDistanceToNow(new Date(release.releaseDate), { addSuffix: true, locale: vi })})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {release.viewCount} lượt xem
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {release.downloadCount} lượt tải
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
          <TabsTrigger value="upgrade">Hướng dẫn nâng cấp</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Description */}
          {release.description && (
            <Card>
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{release.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {release.features && release.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Tính năng mới ({release.features.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {release.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {release.improvements && release.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  Cải tiến ({release.improvements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {release.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">⚡</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Bug Fixes */}
          {release.bugfixes && release.bugfixes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-orange-600" />
                  Sửa lỗi ({release.bugfixes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {release.bugfixes.map((bugfix: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">🐛</span>
                      <span>{bugfix}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Breaking Changes */}
          {release.breakingChanges && release.breakingChanges.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Thay đổi phá vỡ tương thích ({release.breakingChanges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {release.breakingChanges.map((change: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-red-800">
                      <span className="mt-1">⚠️</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Screenshots */}
          {release.screenshotUrls && release.screenshotUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Screenshots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {release.screenshotUrls.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="rounded-lg border w-full h-auto"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Changelog Tab */}
        <TabsContent value="changelog">
          <Card>
            <CardHeader>
              <CardTitle>Release Notes</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              {release.releaseNotes ? (
                <ReactMarkdown>{release.releaseNotes}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">Chưa có release notes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Guide Tab */}
        <TabsContent value="upgrade">
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn nâng cấp</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              {release.upgradeGuide ? (
                <ReactMarkdown>{release.upgradeGuide}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">
                  Phiên bản này không yêu cầu các bước nâng cấp đặc biệt
                </p>
              )}
            </CardContent>
          </Card>

          {/* Deprecations */}
          {release.deprecations && release.deprecations.length > 0 && (
            <Card className="mt-6 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-700">Các tính năng sẽ bị loại bỏ</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {release.deprecations.map((deprecation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-yellow-800">
                      <span className="mt-1">⚠️</span>
                      <span>{deprecation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
