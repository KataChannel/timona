// ✅ MIGRATED TO DYNAMIC GRAPHQL - 2025-10-29
// Original backup: PublishStep.tsx.backup

'use client';

import { useState } from 'react';
import { useFindUnique, useUpdateOne } from '@/hooks/useDynamicGraphQL';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Rocket, Eye } from 'lucide-react';

interface PublishStepProps {
  courseId: string;
  courseData: any;
  onBack: () => void;
}

export default function PublishStep({ courseId, courseData, onBack }: PublishStepProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  // ✅ Migrated to Dynamic GraphQL
  const { data: course } = useFindUnique('course', {
    id: courseId,
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  const [publishCourse, { loading: publishing }] = useUpdateOne('course');

  const courseDetails = course || courseData;
  const modules = courseDetails?.modules || [];
  const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);

  // Validation checklist
  const checks = [
    {
      label: 'Course has a title',
      passed: !!courseDetails.title,
    },
    {
      label: 'Course has a description',
      passed: !!courseDetails.description,
    },
    {
      label: 'Course has a category',
      passed: !!courseDetails.categoryId,
    },
    {
      label: 'Course has at least one module',
      passed: modules.length > 0,
    },
    {
      label: 'Course has at least one lesson',
      passed: totalLessons > 0,
    },
    {
      label: 'Course has learning objectives',
      passed: courseDetails.whatYouWillLearn?.length > 0,
    },
  ];

  const allPassed = checks.every(check => check.passed);
  const passedCount = checks.filter(check => check.passed).length;

  const handlePublish = async () => {
    if (!allPassed) {
      alert('Please complete all requirements before publishing');
      return;
    }

    if (confirm('Are you sure you want to publish this course? It will be visible to all students.')) {
      await publishCourse({
        where: { id: courseId },
        data: { 
          status: 'PUBLISHED',
          publishedAt: new Date()
        },
      });
      alert('Course published successfully!');
      router.push('/instructor/courses');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish</h2>
        <p className="text-gray-600">Review your course and publish when ready</p>
      </div>

      {/* Course Summary */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{course.title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Modules</div>
            <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Lessons</div>
            <div className="text-2xl font-bold text-blue-600">{totalLessons}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Level</div>
            <div className="text-sm font-semibold text-gray-900">{course.level}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Price</div>
            <div className="text-sm font-semibold text-gray-900">
              {course.price > 0 ? `$${course.price}` : 'Free'}
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Requirements Checklist ({passedCount}/{checks.length})
        </h3>
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center gap-3">
              {check.passed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <span className={check.passed ? 'text-gray-900' : 'text-gray-500'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>

        {!allPassed && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              Complete all requirements above before publishing your course
            </p>
          </div>
        )}
      </div>

      {/* Course Content Preview */}
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
        <div className="space-y-4">
          {modules.map((module: any, index: number) => (
            <div key={module.id} className="border-l-4 border-blue-500 pl-4">
              <div className="font-medium text-gray-900">
                Module {index + 1}: {module.title}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {module.lessons?.length || 0} lessons
              </div>
              {module.lessons && module.lessons.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {module.lessons.map((lesson: any, lessonIndex: number) => (
                    <li key={lesson.id} className="text-sm text-gray-600">
                      {index + 1}.{lessonIndex + 1} {lesson.title} ({lesson.type})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/courses/${course.slug}`)}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Preview Course
          </button>
          <button
            onClick={handlePublish}
            disabled={!allPassed || publishing}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            {publishing ? 'Publishing...' : 'Publish Course'}
          </button>
        </div>
      </div>
    </div>
  );
}
