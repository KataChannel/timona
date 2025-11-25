'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useSearchParams } from 'next/navigation';
import { GET_COURSE_BY_SLUG, GET_ENROLLMENT } from '@/graphql/lms/courses.graphql';
import LessonViewer from '@/components/lms/LessonViewer';
import { CheckCircle, Lock, PlayCircle, FileText, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function LearnCoursePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const lessonIdParam = searchParams?.get('lesson');

  const { data: courseData, loading: courseLoading } = useQuery(GET_COURSE_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const { data: enrollmentData, loading: enrollmentLoading, refetch: refetchEnrollment } = useQuery(GET_ENROLLMENT, {
    variables: { courseId: courseData?.courseBySlug?.id || '' },
    skip: !courseData?.courseBySlug?.id,
  });

  const course = courseData?.courseBySlug;
  const enrollment = enrollmentData?.enrollment;

  // Flatten lessons with module info
  const allLessons = course?.modules?.flatMap((module: any) =>
    module.lessons.map((lesson: any) => ({
      ...lesson,
      moduleName: module.title,
      moduleOrder: module.order,
    }))
  ).sort((a: any, b: any) => {
    if (a.moduleOrder !== b.moduleOrder) return a.moduleOrder - b.moduleOrder;
    return a.order - b.order;
  }) || [];

  // Get current lesson
  const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
    if (lessonIdParam) {
      return allLessons.findIndex((l: any) => l.id === lessonIdParam);
    }
    return 0;
  });

  const currentLesson = allLessons[currentLessonIndex];
  const nextLesson = allLessons[currentLessonIndex + 1];

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.lessonProgress?.some(
      (progress: any) => progress.lessonId === lessonId && progress.completed
    );
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handleSelectLesson = (index: number) => {
    setCurrentLessonIndex(index);
  };

  if (courseLoading || enrollmentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải khóa học...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h1 className="text-2xl font-bold">Không tìm thấy khóa học</h1>
            <p className="text-muted-foreground">Bạn có thể chưa đăng ký khóa học này</p>
            <Button asChild>
              <Link href="/lms/courses">
                Khám phá khóa học
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Course Content */}
        <aside className="w-full lg:w-96 bg-card border-b lg:border-r lg:border-b-0 lg:h-screen lg:sticky lg:top-0">
          <ScrollArea className="h-[400px] lg:h-screen">
            {/* Course Header */}
            <div className="p-4 md:p-6 border-b">
              <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
                <Link href={`/lms/courses/${slug}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Link>
              </Button>
              <h2 className="text-lg font-bold mb-4">{course.title}</h2>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tiến độ của bạn</span>
                  <span className="text-sm font-bold text-primary">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
            </div>

            {/* Lesson List */}
            <div className="p-4">
              {course.modules?.map((module: any, moduleIndex: number) => (
                <div key={module.id} className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 px-2">
                    {moduleIndex + 1}. {module.title}
                  </h3>
                  <div className="space-y-1">
                    {module.lessons.map((lesson: any, lessonIndex: number) => {
                      const globalIndex = allLessons.findIndex((l: any) => l.id === lesson.id);
                      const isCompleted = isLessonCompleted(lesson.id);
                      const isCurrent = globalIndex === currentLessonIndex;

                      return (
                        <Button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(globalIndex)}
                          variant={isCurrent ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start h-auto py-3 px-3",
                            isCurrent && "bg-primary text-primary-foreground"
                          )}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="flex-shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : lesson.type === 'VIDEO' ? (
                                <PlayCircle className={cn(
                                  "w-5 h-5",
                                  isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                                )} />
                              ) : (
                                <FileText className={cn(
                                  "w-5 h-5",
                                  isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                                )} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium">
                                {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className={cn(
                                  "text-xs mt-1",
                                  isCurrent ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {lesson.duration} phút
                                </p>
                              )}
                            </div>
                            {isCurrent && (
                              <ChevronRight className="w-5 h-5 flex-shrink-0" />
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          {currentLesson ? (
            <LessonViewer
              lesson={currentLesson}
              enrollmentId={enrollment.id}
              isCompleted={isLessonCompleted(currentLesson.id)}
              onComplete={() => refetchEnrollment()}
              nextLesson={nextLesson}
              onNextLesson={handleNextLesson}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <p className="text-muted-foreground">Chưa có bài học nào</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
