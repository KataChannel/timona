// ✅ MIGRATED TO DYNAMIC GRAPHQL - 2025-10-29
// Original backup: LessonsStep.tsx.backup

'use client';

import { useState } from 'react';
import { useFindUnique, useCreateOne, useUpdateOne, useDeleteOne } from '@/hooks/useDynamicGraphQL';
import { Plus, Edit2, Trash2, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import FileUpload from '../FileUpload';
import RichTextEditor from '../RichTextEditor';

interface LessonsStepProps {
  courseId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function LessonsStep({ courseId, onNext, onBack }: LessonsStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'VIDEO',
    content: '',
    duration: 0,
  });

  // ✅ Migrated to Dynamic GraphQL
  const { data: course, refetch } = useFindUnique('course', {
    id: courseId,
    include: { 
      modules: {
        include: { lessons: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' }
      }
    },
  });

  const [createLesson, { loading: creating }] = useCreateOne('lesson');
  const [updateLesson, { loading: updating }] = useUpdateOne('lesson');
  const [deleteLesson] = useDeleteOne('lesson');

  const modules = course?.modules || [];
  const hasLessons = modules.some((m: any) => m.lessons?.length > 0);

  const resetForm = () => {
    setFormData({ title: '', description: '', type: 'VIDEO', content: '', duration: 0 });
    setSelectedModule('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLesson) {
      await updateLesson({
        where: { id: editingLesson.id },
        data: formData,
      });
      setEditingLesson(null);
      resetForm();
      refetch();
    } else {
      await createLesson({
        data: {
          moduleId: selectedModule,
          ...formData,
        },
      });
      setShowForm(false);
      resetForm();
      refetch();
    }
  };

  const handleEdit = (lesson: any, moduleId: string) => {
    setEditingLesson(lesson);
    setSelectedModule(moduleId);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      type: lesson.type,
      content: lesson.content || '',
      duration: lesson.duration || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      await deleteLesson({ where: { id: lessonId } });
      refetch();
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case 'TEXT':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'QUIZ':
        return <HelpCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Lessons</h2>
        <p className="text-gray-600">Add lessons to your modules</p>
      </div>

      {/* Modules with Lessons */}
      <div className="space-y-6">
        {modules.map((module: any) => (
          <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
              <p className="text-sm text-gray-600">{module.lessons?.length || 0} lessons</p>
            </div>

            <div className="divide-y">
              {module.lessons?.map((lesson: any, index: number) => (
                <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getLessonIcon(lesson.type)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {index + 1}. {lesson.title}
                        </div>
                        {lesson.duration && (
                          <div className="text-sm text-gray-500">{lesson.duration} min</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(lesson, module.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {module.lessons?.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No lessons yet. Click "Add Lesson" to get started.
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50">
              <button
                onClick={() => {
                  setSelectedModule(module.id);
                  setShowForm(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lesson to this Module
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Lesson Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-xl font-bold mb-6">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VIDEO">Video</option>
                    <option value="TEXT">Text/Article</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === 'VIDEO' ? 'Upload Video' : formData.type === 'TEXT' ? 'Content' : 'Quiz ID'}
                  </label>
                  {formData.type === 'VIDEO' ? (
                    <FileUpload
                      type="video"
                      uploadType="video"
                      courseId={courseId}
                      label=""
                      previewUrl={formData.content}
                      onUploadComplete={(url: string) => setFormData({ ...formData, content: url })}
                      onError={(error: string) => console.error('Upload error:', error)}
                    />
                  ) : formData.type === 'TEXT' ? (
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content: string) => setFormData({ ...formData, content })}
                      placeholder="Write your lesson content here..."
                      minHeight="300px"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter Quiz ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating || updating ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Add Lesson'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLesson(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasLessons}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Publish Course
        </button>
      </div>

      {!hasLessons && (
        <p className="text-sm text-amber-600 text-center">
          Please add at least one lesson to continue
        </p>
      )}
    </div>
  );
}
