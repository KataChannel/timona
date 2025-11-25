// ✅ MIGRATED TO DYNAMIC GRAPHQL - 2025-10-29
// Original backup: CourseWizard.tsx.backup

'use client';

import { useState } from 'react';
import { useFindMany, useFindUnique, useCreateOne, useUpdateOne, useDeleteOne } from '@/hooks/useDynamicGraphQL';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Layers, 
  PlayCircle, 
  Rocket 
} from 'lucide-react';
import BasicInfoStep from './wizard/BasicInfoStep';
import ModulesStep from './wizard/ModulesStep';
import LessonsStep from './wizard/LessonsStep';
import PublishStep from './wizard/PublishStep';

interface CourseWizardProps {
  existingCourse?: any;
}

const STEPS = [
  { id: 1, name: 'Basic Info', icon: Info, description: 'Course details' },
  { id: 2, name: 'Modules', icon: Layers, description: 'Organize content' },
  { id: 3, name: 'Lessons', icon: PlayCircle, description: 'Add lessons' },
  { id: 4, name: 'Publish', icon: Rocket, description: 'Review & publish' },
];

export default function CourseWizard({ existingCourse }: CourseWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState(existingCourse || {
    title: '',
    description: '',
    categoryId: '',
    level: 'BEGINNER',
    price: 0,
    thumbnail: '',
    whatYouWillLearn: [],
    requirements: [],
    status: 'DRAFT',
  });

  // ✅ Migrated to Dynamic GraphQL
  const [createCourse, { loading: creating }] = useCreateOne('course');
  const [updateCourse, { loading: updating }] = useUpdateOne('course');

  const loading = creating || updating;

  const handleStepComplete = async (stepData: any) => {
    const updatedData = { ...courseData, ...stepData };
    setCourseData(updatedData);

    // Save draft after each step
    try {
      if (courseData.id) {
        await updateCourse({
          where: { id: courseData.id },
          data: stepData,
        });
      } else if (currentStep === 1) {
        // Create course after first step
        const result = await createCourse({
          data: updatedData,
        });
        setCourseData({ ...updatedData, id: result.id });
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            courseData={courseData}
            onComplete={(data) => {
              handleStepComplete(data);
              handleNext();
            }}
            onBack={() => router.push('/lms/instructor/courses')}
          />
        );
      case 2:
        return (
          <ModulesStep
            courseId={courseData.id}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <LessonsStep
            courseId={courseData.id}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <PublishStep
            courseId={courseData.id}
            courseData={courseData}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {existingCourse ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-gray-600">
            Follow the steps below to create your course
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex-1 flex items-center">
                  {/* Step */}
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div
                        className={`font-medium ${
                          isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {step.name}
                      </div>
                      <div className="text-sm text-gray-500">{step.description}</div>
                    </div>
                  </div>

                  {/* Connector */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStep()}
        </div>

        {/* Auto-save Indicator */}
        {loading && (
          <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-gray-600">Saving draft...</span>
          </div>
        )}
      </div>
    </div>
  );
}
