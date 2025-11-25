'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Eye, Clock, BookOpen, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { APPROVE_COURSE, REJECT_COURSE } from '@/graphql/lms/courses.graphql';
import { APPROVE_DOCUMENT, REJECT_DOCUMENT } from '@/graphql/lms/source-documents';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

// Query để lấy danh sách courses pending approval
const GET_PENDING_COURSES = gql`
  query GetPendingCourses {
    courses(filters: { status: DRAFT }) {
      data {
        id
        title
        slug
        description
        thumbnail
        approvalRequested
        approvalRequestedAt
        status
        createdAt
        instructor {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

// Query để lấy danh sách documents pending approval
const GET_PENDING_DOCUMENTS = gql`
  query GetPendingDocuments {
    sourceDocuments(filter: { statuses: [DRAFT] }) {
      id
      title
      description
      type
      status
      approvalRequested
      approvalRequestedAt
      createdAt
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

export default function ApprovalManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // Queries
  const { data: coursesData, loading: coursesLoading, refetch: refetchCourses } = useQuery(GET_PENDING_COURSES);
  const { data: documentsData, loading: documentsLoading, refetch: refetchDocuments } = useQuery(GET_PENDING_DOCUMENTS);

  // Mutations
  const [approveCourse] = useMutation(APPROVE_COURSE);
  const [rejectCourse] = useMutation(REJECT_COURSE);
  const [approveDocument] = useMutation(APPROVE_DOCUMENT);
  const [rejectDocument] = useMutation(REJECT_DOCUMENT);

  const pendingCourses = coursesData?.courses?.data?.filter((c: any) => c.approvalRequested) || [];
  const pendingDocuments = documentsData?.sourceDocuments?.filter((d: any) => d.approvalRequested) || [];

  const handleApprove = async (type: 'course' | 'document', id: string, title: string) => {
    try {
      if (type === 'course') {
        await approveCourse({ variables: { courseId: id } });
        refetchCourses();
      } else {
        await approveDocument({ variables: { documentId: id } });
        refetchDocuments();
      }

      toast({
        title: 'Phê duyệt thành công',
        description: `Đã phê duyệt ${type === 'course' ? 'khóa học' : 'tài liệu'} "${title}"`,
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể phê duyệt',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (activeTab === 'courses') {
        await rejectCourse({
          variables: {
            courseId: selectedItem.id,
            reason: rejectionReason,
          },
        });
        refetchCourses();
      } else {
        await rejectDocument({
          variables: {
            documentId: selectedItem.id,
            reason: rejectionReason,
          },
        });
        refetchDocuments();
      }

      toast({
        title: 'Đã từ chối',
        description: `Đã từ chối ${activeTab === 'courses' ? 'khóa học' : 'tài liệu'} "${selectedItem.title}"`,
      });

      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedItem(null);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể từ chối',
        variant: 'destructive',
      });
    }
  };

  const openRejectDialog = (item: any) => {
    setSelectedItem(item);
    setRejectDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý phê duyệt</h1>
        <p className="text-muted-foreground">
          Phê duyệt khóa học và tài liệu từ giảng viên
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Khóa học ({pendingCourses.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="w-4 h-4" />
            Tài liệu ({pendingDocuments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {coursesLoading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : pendingCourses.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Không có khóa học nào chờ phê duyệt</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingCourses.map((course: any) => (
                <Card key={course.id} className="p-6">
                  <div className="flex items-start gap-4">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(course.approvalRequestedAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-sm text-muted-foreground">
                          Giảng viên: {course.instructor.firstName} {course.instructor.lastName}
                        </span>
                        <div className="flex gap-2 ml-auto">
                          <Link href={`/admin/lms/courses/${course.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openRejectDialog(course)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove('course', course.id, course.title)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Phê duyệt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          {documentsLoading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : pendingDocuments.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Không có tài liệu nào chờ phê duyệt</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingDocuments.map((document: any) => (
                <Card key={document.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{document.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {document.description}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge variant="secondary">{document.type}</Badge>
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(document.approvalRequestedAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-sm text-muted-foreground">
                          Tác giả: {document.user.firstName} {document.user.lastName}
                        </span>
                        <div className="flex gap-2 ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openRejectDialog(document)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove('document', document.id, document.title)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Phê duyệt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối {activeTab === 'courses' ? 'khóa học' : 'tài liệu'}</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối "{selectedItem?.title}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Nhập lý do từ chối..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleReject} variant="destructive">
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
