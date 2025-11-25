'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  FileText,
  Video,
  Music,
  File,
  Link as LinkIcon,
  Image as ImageIcon,
  Download,
  Eye,
  CheckCircle,
  Play,
} from 'lucide-react';
import { GET_COURSE_DOCUMENTS } from '@/graphql/lms/source-documents';
import {
  VideoPlayer,
  AudioPlayer,
  PDFViewer,
  MarkdownRenderer,
} from '@/components/lms/viewers';

const TYPE_ICONS = {
  FILE: File,
  VIDEO: Video,
  TEXT: FileText,
  AUDIO: Music,
  LINK: LinkIcon,
  IMAGE: ImageIcon,
};

const TYPE_COLORS = {
  FILE: 'text-blue-600 bg-blue-50',
  VIDEO: 'text-purple-600 bg-purple-50',
  TEXT: 'text-green-600 bg-green-50',
  AUDIO: 'text-orange-600 bg-orange-50',
  LINK: 'text-cyan-600 bg-cyan-50',
  IMAGE: 'text-pink-600 bg-pink-50',
};

export default function StudentCourseDocumentsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const { data, loading, error } = useQuery(GET_COURSE_DOCUMENTS, {
    variables: { courseId },
    fetchPolicy: 'cache-and-network',
  });

  const courseDocuments = data?.courseDocuments || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center text-red-600">
            Lỗi: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Tài liệu khóa học
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Xem và học từ tài liệu nguồn
        </p>
      </div>

      {/* Documents List */}
      {courseDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Khóa học chưa có tài liệu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courseDocuments.map((link: any) => {
            const doc = link.document;
            const TypeIcon = TYPE_ICONS[doc.type as keyof typeof TYPE_ICONS];
            const typeColorClass = TYPE_COLORS[doc.type as keyof typeof TYPE_COLORS];

            return (
              <Card key={link.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${typeColorClass}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl">
                          {doc.title}
                        </CardTitle>
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {link.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{doc.type}</Badge>
                          {link.isRequired && (
                            <Badge className="bg-orange-100 text-orange-700">
                              Bắt buộc
                            </Badge>
                          )}
                          {doc.category && (
                            <Badge variant="outline" style={{ color: doc.category.color }}>
                              {doc.category.icon} {doc.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Viewer based on type */}
                  {doc.type === 'VIDEO' && doc.url && (
                    <div className="p-4">
                      <VideoPlayer
                        url={doc.url}
                        thumbnail={doc.thumbnailUrl}
                        className="border-0 shadow-none"
                      />
                    </div>
                  )}

                  {doc.type === 'AUDIO' && doc.url && (
                    <div className="p-4">
                      <AudioPlayer
                        url={doc.url}
                        title={doc.title}
                        thumbnail={doc.thumbnailUrl}
                        className="border-0 shadow-none"
                      />
                    </div>
                  )}

                  {doc.type === 'FILE' && doc.url && doc.mimeType?.includes('pdf') && (
                    <div className="p-4">
                      <PDFViewer
                        url={doc.url}
                        title={doc.title}
                        className="border-0 shadow-none"
                      />
                    </div>
                  )}

                  {doc.type === 'TEXT' && doc.content && (
                    <div className="p-4">
                      <MarkdownRenderer
                        content={doc.content}
                        className="border-0 shadow-none"
                      />
                    </div>
                  )}

                  {doc.type === 'IMAGE' && doc.url && (
                    <div className="p-4">
                      <img
                        src={doc.url}
                        alt={doc.title}
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}

                  {doc.type === 'LINK' && doc.url && (
                    <div className="p-6 text-center">
                      <LinkIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Tài liệu bên ngoài</p>
                      <Button onClick={() => window.open(doc.url, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Mở liên kết
                      </Button>
                    </div>
                  )}

                  {/* Download button for FILE type */}
                  {doc.type === 'FILE' && doc.url && !doc.mimeType?.includes('pdf') && (
                    <div className="p-6 text-center bg-gray-50">
                      <File className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2 font-medium">{doc.fileName}</p>
                      <p className="text-sm text-gray-500 mb-4">
                        {doc.fileSize ? `${(Number(doc.fileSize) / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                      </p>
                      <Button onClick={() => window.open(doc.url, '_blank')}>
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống
                      </Button>
                    </div>
                  )}

                  {/* Description */}
                  {doc.description && (
                    <div className="p-4 border-t bg-gray-50">
                      <p className="text-sm text-gray-700">{doc.description}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 px-4 py-3 border-t text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {doc.viewCount} lượt xem
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {doc.downloadCount} lượt tải
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
