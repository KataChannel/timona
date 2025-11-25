'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_COURSES, GET_COURSE_CATEGORIES } from '@/graphql/lms/courses.graphql';
import CourseList from '@/components/lms/CourseList';
import { Search, Filter, X, Grid, List, BookOpen, GraduationCap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Icon mapping cho categories
const categoryIcons: Record<string, any> = {
  'basic-skills': GraduationCap,
  'advanced-skills': Award,
  'default': BookOpen,
};

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: categoriesData } = useQuery(GET_COURSE_CATEGORIES);

  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: {
      filters: {
        search: searchTerm || undefined,
        categoryId: selectedCategory || undefined,
        level: selectedLevel || undefined,
        status: 'PUBLISHED',
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    },
  });

  const courses = data?.courses?.data || [];
  const categories = categoriesData?.courseCategories || [];

  // Đếm số khóa học theo category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    courses.forEach((course: any) => {
      if (course.categoryId) {
        counts[course.categoryId] = (counts[course.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [courses]);

  const levels = [
    { value: 'BEGINNER', label: 'Cơ bản' },
    { value: 'INTERMEDIATE', label: 'Trung cấp' },
    { value: 'ADVANCED', label: 'Nâng cao' },
    { value: 'EXPERT', label: 'Chuyên gia' },
  ];

  const hasActiveFilters = useMemo(
    () => searchTerm || selectedCategory || selectedLevel,
    [searchTerm, selectedCategory, selectedLevel]
  );

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedLevel(null);
  };

  const getCategoryIcon = (slug: string) => {
    const Icon = categoryIcons[slug] || categoryIcons.default;
    return Icon;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                Khám phá Khóa học
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mt-2 md:mt-4 max-w-2xl">
                Học kỹ năng mới, thăng tiến sự nghiệp và đạt được mục tiêu với các khóa học chuyên nghiệp
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm khóa học, giảng viên, kỹ năng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 md:h-12 text-base text-white placeholder:text-white/70 bg-white/20 border-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="space-y-6 pr-4">
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa tất cả bộ lọc
                  </Button>
                )}

                {/* Category Filter */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Danh mục</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value || null)}>
                      <div className="flex items-center space-x-2 mb-3 p-2 rounded-md hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="" id="category-all" />
                        <Label htmlFor="category-all" className="font-normal cursor-pointer flex items-center gap-2 flex-1">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>Tất cả danh mục</span>
                          <Badge variant="secondary" className="ml-auto">
                            {courses.length}
                          </Badge>
                        </Label>
                      </div>
                      {categories.map((category: any) => {
                        const Icon = getCategoryIcon(category.slug);
                        const count = categoryCounts[category.id] || 0;
                        
                        return (
                          <div 
                            key={category.id} 
                            className="flex items-center space-x-2 mb-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                          >
                            <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                            <Label 
                              htmlFor={`category-${category.id}`} 
                              className="font-normal cursor-pointer flex items-center gap-2 flex-1"
                            >
                              <Icon className="w-4 h-4 text-primary" />
                              <span>{category.name}</span>
                              {count > 0 && (
                                <Badge variant="secondary" className="ml-auto">
                                  {count}
                                </Badge>
                              )}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Level Filter */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Cấp độ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={selectedLevel || ''} onValueChange={(value) => setSelectedLevel(value || null)}>
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value="" id="level-all" />
                        <Label htmlFor="level-all" className="font-normal cursor-pointer">
                          Tất cả cấp độ
                        </Label>
                      </div>
                      {levels.map((level) => (
                        <div key={level.value} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={level.value} id={`level-${level.value}`} />
                          <Label htmlFor={`level-${level.value}`} className="font-normal cursor-pointer">
                            {level.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </aside>

          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Bộ lọc
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    Đang lọc
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Bộ lọc</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full pr-4 mt-6">
                <div className="space-y-6">
                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Xóa tất cả
                    </Button>
                  )}

                  {/* Category Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Danh mục</h3>
                    <RadioGroup value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value || null)}>
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value="" id="m-category-all" />
                        <Label htmlFor="m-category-all" className="font-normal cursor-pointer">
                          Tất cả danh mục
                        </Label>
                      </div>
                      {categories.map((category: any) => (
                        <div key={category.id} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={category.id} id={`m-category-${category.id}`} />
                          <Label htmlFor={`m-category-${category.id}`} className="font-normal cursor-pointer">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <h3 className="font-semibold mb-3">Cấp độ</h3>
                    <RadioGroup value={selectedLevel || ''} onValueChange={(value) => setSelectedLevel(value || null)}>
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value="" id="m-level-all" />
                        <Label htmlFor="m-level-all" className="font-normal cursor-pointer">
                          Tất cả cấp độ
                        </Label>
                      </div>
                      {levels.map((level) => (
                        <div key={level.value} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={level.value} id={`m-level-${level.value}`} />
                          <Label htmlFor={`m-level-${level.value}`} className="font-normal cursor-pointer">
                            {level.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Course Grid */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {loading ? 'Đang tải...' : `${courses.length} khóa học`}
                </h2>
                {hasActiveFilters && (
                  <p className="text-muted-foreground text-sm mt-2">
                    Hiển thị kết quả đã lọc
                  </p>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Lưới</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Danh sách</span>
                </Button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Card className="border-destructive bg-destructive/10 mb-6">
                <CardContent className="pt-6">
                  <p className="text-destructive">Không thể tải khóa học. Vui lòng thử lại.</p>
                </CardContent>
              </Card>
            )}

            {/* Course List */}
            <CourseList
              courses={courses}
              loading={loading}
              emptyMessage={hasActiveFilters ? 'Không có khóa học phù hợp với bộ lọc' : 'Chưa có khóa học nào'}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
