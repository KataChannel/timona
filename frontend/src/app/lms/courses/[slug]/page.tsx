'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_COURSE_BY_SLUG, GET_ENROLLMENT } from '@/graphql/lms/courses.graphql';
import { GET_COURSE_DISCUSSIONS, CREATE_DISCUSSION } from '@/graphql/lms/discussions.graphql';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import EnrollButton from '@/components/lms/EnrollButton';
import RatingStars from '@/components/lms/RatingStars';
import ReviewsSection from '@/components/lms/ReviewsSection';
import DiscussionThread from '@/components/lms/DiscussionThread';
import { Clock, Users, BookOpen, Globe, Award, CheckCircle, PlayCircle, FileText, MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'reviews' | 'discussions'>('overview');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');

  const { data, loading, error } = useQuery(GET_COURSE_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const { data: enrollmentData, refetch: refetchEnrollment } = useQuery(GET_ENROLLMENT, {
    variables: { courseId: data?.courseBySlug?.id || '' },
    skip: !data?.courseBySlug?.id || !isAuthenticated,
  });

  // Refetch enrollment when user authentication changes
  useEffect(() => {
    if (isAuthenticated && data?.courseBySlug?.id) {
      refetchEnrollment();
    }
  }, [isAuthenticated, data?.courseBySlug?.id, refetchEnrollment]);

  const { data: discussionsData, refetch: refetchDiscussions } = useQuery(GET_COURSE_DISCUSSIONS, {
    variables: { courseId: data?.courseBySlug?.id },
    skip: !data?.courseBySlug?.id || activeTab !== 'discussions',
  });

  const [createDiscussion] = useMutation(CREATE_DISCUSSION, {
    onCompleted: () => {
      setShowNewDiscussion(false);
      setDiscussionTitle('');
      setDiscussionContent('');
      refetchDiscussions();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <Skeleton className="h-10 w-3/4 mb-4 bg-primary-foreground/20" />
            <Skeleton className="h-6 w-1/2 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-[500px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.courseBySlug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Không tìm thấy khóa học</CardTitle>
            <CardDescription>
              Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const course = data.courseBySlug;
  const totalLessons = course.modules?.reduce(
    (acc: number, mod: any) => acc + (mod.lessons?.length || 0),
    0
  ) || 0;

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionTitle.trim() || !discussionContent.trim()) return;

    try {
      await createDiscussion({
        variables: {
          input: {
            courseId: course.id,
            title: discussionTitle,
            content: discussionContent,
          },
        },
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Category Badge */}
              {course.category && (
                <Badge variant="secondary" className="mb-2">
                  {course.category.name}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-primary-foreground/90">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <RatingStars 
                  rating={course.avgRating} 
                  size="lg" 
                  showNumber 
                  reviewCount={course.reviewCount}
                />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">{course.enrollmentCount} học viên</span>
                </div>
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="w-10 h-10 md:w-12 md:h-12">
                    <AvatarImage src={course.instructor.avatar || ''} alt={course.instructor.username} />
                    <AvatarFallback>
                      {course.instructor.firstName?.[0] || course.instructor.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs md:text-sm text-primary-foreground/70">Tạo bởi</p>
                    <p className="font-medium text-sm md:text-base">
                      {course.instructor.firstName && course.instructor.lastName
                        ? `${course.instructor.firstName} ${course.instructor.lastName}`
                        : course.instructor.username}
                    </p>
                  </div>
                </div>
              )}
{/* Main Content */}
      <div className="bg-white rounded-lg container mx-auto px-4 py-6 md:py-8 lg:py-12 pb-24 lg:pb-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs md:text-sm">
              <BookOpen className="w-4 h-4 mr-1.5" />
              Nội dung
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs md:text-sm">
              Đánh giá
            </TabsTrigger>
            <TabsTrigger value="discussions" className="text-xs md:text-sm">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Thảo luận
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Mobile Course Info Card */}
            <Card className="lg:hidden">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin khóa học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cấp độ</p>
                      <p className="text-sm font-medium">{course.level}</p>
                    </div>
                  </div>
                  {course.duration && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Thời lượng</p>
                        <p className="text-sm font-medium">
                          {Math.floor(course.duration / 60)}h {course.duration % 60}m
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bài học</p>
                      <p className="text-sm font-medium">{totalLessons} bài học</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ngôn ngữ</p>
                      <p className="text-sm font-medium">Tiếng Việt</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bạn sẽ học được gì</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {course.whatYouWillLearn.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 md:gap-3">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm md:text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Yêu cầu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 md:gap-3 text-sm md:text-base">
                        <span className="text-muted-foreground">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung khóa học</CardTitle>
                <CardDescription>
                  {course.modules?.length || 0} chương • {totalLessons} bài học
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.modules && course.modules.length > 0 ? (
                  <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                    {course.modules.map((module: any, moduleIndex: number) => (
                      <AccordionItem key={module.id} value={`item-${moduleIndex}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4 text-left">
                            <span className="font-semibold text-sm md:text-base">
                              {moduleIndex + 1}. {module.title}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {module.lessons?.length || 0} bài
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1 pt-2">
                            {module.lessons?.map((lesson: any, lessonIndex: number) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-accent rounded-lg transition-colors"
                              >
                                {lesson.type === 'VIDEO' ? (
                                  <PlayCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <span className="text-sm md:text-base flex-1">
                                  {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                </span>
                                {lesson.duration && (
                                  <span className="text-xs md:text-sm text-muted-foreground">
                                    {lesson.duration} phút
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Chưa có nội dung khóa học.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-4 md:p-6">
                <ReviewsSection
                  courseId={course.id}
                  currentUserId={user?.id}
                  isEnrolled={!!enrollmentData?.enrollment}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="mt-6">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-6">
                {/* New Discussion Button */}
                {enrollmentData?.enrollment && !showNewDiscussion && (
                  <Button
                    onClick={() => setShowNewDiscussion(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Bắt đầu thảo luận mới
                  </Button>
                )}

                {/* New Discussion Form */}
                {showNewDiscussion && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Thảo luận mới</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateDiscussion} className="space-y-4">
                        <div>
                          <Input
                            type="text"
                            value={discussionTitle}
                            onChange={(e) => setDiscussionTitle(e.target.value)}
                            placeholder="Tiêu đề thảo luận..."
                            required
                          />
                        </div>
                        <div>
                          <Textarea
                            value={discussionContent}
                            onChange={(e) => setDiscussionContent(e.target.value)}
                            placeholder="Bạn muốn thảo luận điều gì?"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button type="submit" className="flex-1 sm:flex-none">
                            Đăng thảo luận
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowNewDiscussion(false);
                              setDiscussionTitle('');
                              setDiscussionContent('');
                            }}
                            className="flex-1 sm:flex-none"
                          >
                            Hủy
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Discussions List */}
                {!enrollmentData?.enrollment ? (
                  <Alert>
                    <MessageSquare className="w-4 h-4" />
                    <AlertDescription>
                      Ghi danh khóa học này để tham gia thảo luận
                    </AlertDescription>
                  </Alert>
                ) : discussionsData?.courseDiscussions && discussionsData.courseDiscussions.length > 0 ? (
                  <div className="space-y-4">
                    {discussionsData.courseDiscussions.map((discussion: any) => (
                      <DiscussionThread
                        key={discussion.id}
                        discussion={discussion}
                        refetch={refetchDiscussions}
                        canModerate={course.instructor?.id === user?.id}
                        isOwner={discussion.user.id === user?.id}
                      />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <MessageSquare className="w-4 h-4" />
                    <AlertDescription>
                      Chưa có thảo luận nào. Hãy là người đầu tiên bắt đầu!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div> 
            </div>

            {/* Sidebar Card - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <Card className="sticky top-4 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  {/* Thumbnail */}
                  {course.thumbnail && (
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-3xl font-bold">
                    {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                  </div>

                  {/* Enroll Button */}
                  <EnrollButton 
                    courseId={course.id}
                    courseSlug={course.slug}
                    price={course.price}
                    isEnrolled={!!enrollmentData?.enrollment}
                  />

                  <Separator />

                  {/* Course Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Cấp độ</p>
                        <p className="font-medium">{course.level}</p>
                      </div>
                    </div>

                    {course.duration && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Thời lượng</p>
                          <p className="font-medium">
                            {Math.floor(course.duration / 60)}h {course.duration % 60}m
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Bài học</p>
                        <p className="font-medium">{totalLessons} bài học</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Ngôn ngữ</p>
                        <p className="font-medium">Tiếng Việt</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer - Course Info */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Giá khóa học</p>
            <p className="text-xl font-bold">
              {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
            </p>
          </div>
          <EnrollButton 
            courseId={course.id}
            courseSlug={course.slug}
            price={course.price}
            isEnrolled={!!enrollmentData?.enrollment}
          />
        </div>
      </div>


    </div>
  );
}
