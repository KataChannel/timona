'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Star, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    price: number;
    level: string;
    duration?: number;
    avgRating: number;
    enrollmentCount: number;
    reviewCount: number;
    sourceDocumentsCount?: number;
    categoryId?: string;
    instructor?: {
      firstName?: string;
      lastName?: string;
      username: string;
      avatar?: string;
    };
  };
  showInstructor?: boolean;
}

const LEVEL_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  BEGINNER: 'default',
  INTERMEDIATE: 'secondary',
  ADVANCED: 'outline',
  EXPERT: 'destructive',
};

const LEVEL_LABELS: Record<string, string> = {
  'BEGINNER': 'Cơ bản',
  'INTERMEDIATE': 'Trung cấp',
  'ADVANCED': 'Nâng cao',
  'EXPERT': 'Chuyên gia'
};

export default function CourseCard({ course, showInstructor = true }: CourseCardProps) {
  const levelVariant = LEVEL_VARIANTS[course.level as keyof typeof LEVEL_VARIANTS] || 'secondary';

  return (
    <Link href={`/lms/courses/${course.slug}`} className="block h-full">
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            {course.price > 0 ? (
              <Badge variant="secondary" className="shadow-sm">
                {course.price.toLocaleString('vi-VN')}đ
              </Badge>
            ) : (
              <Badge className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                Miễn phí
              </Badge>
            )}
          </div>

          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={levelVariant} className="text-xs">
              {LEVEL_LABELS[course.level] || course.level}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
              {course.description}
            </p>
          )}

          {/* Instructor */}
          {showInstructor && course.instructor && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Avatar className="w-6 h-6">
                <AvatarImage src={course.instructor.avatar || ''} alt={course.instructor.username} />
                <AvatarFallback className="text-xs">
                  {course.instructor.firstName?.[0] || course.instructor.username[0]}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-muted-foreground">
                {course.instructor.firstName && course.instructor.lastName
                  ? `${course.instructor.firstName} ${course.instructor.lastName}`
                  : course.instructor.username}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t flex-wrap">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-foreground">{course.avgRating.toFixed(1)}</span>
              <span className="text-xs">({course.reviewCount})</span>
            </div>

            {/* Students */}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollmentCount}</span>
            </div>

            {/* Duration */}
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
              </div>
            )}

            {/* Source Documents */}
            {course.sourceDocumentsCount && course.sourceDocumentsCount > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-xs">{course.sourceDocumentsCount} TL</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
