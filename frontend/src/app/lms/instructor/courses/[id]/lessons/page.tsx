'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { useFindUnique, useCreateOne, useUpdateOne, useDeleteOne } from '@/hooks/useDynamicGraphQL';

type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ';

export default function ManageLessonsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const [showForm, setShowForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'VIDEO' as LessonType,
    content: '',
    videoUrl: '',
    duration: 0,
    isFree: false,
  });

  const { data: course, refetch } = useFindUnique('course', courseId, {
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

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      type: 'VIDEO', 
      content: '',
      videoUrl: '',
      duration: 0,
      isFree: false,
    });
    setSelectedModule('');
    setEditingLesson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare lesson data, excluding videoUrl (frontend-only field)
    const { videoUrl, ...formDataWithoutVideoUrl } = formData;
    const lessonData = {
      ...formDataWithoutVideoUrl,
      content: formData.type === 'VIDEO' ? formData.videoUrl : formData.content,
    };

    if (editingLesson) {
      await updateLesson({
        where: { id: editingLesson.id },
        data: lessonData,
      });
      setShowForm(false);
      resetForm();
      refetch();
    } else {
      await createLesson({
        data: {
          moduleId: selectedModule,
          ...lessonData,
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
      content: lesson.type === 'VIDEO' ? '' : (lesson.content || ''),
      videoUrl: lesson.type === 'VIDEO' ? (lesson.content || '') : '',
      duration: lesson.duration || 0,
      isFree: lesson.isFree || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (lessonId: string) => {
    if (confirm('Bạn có chắc muốn xóa bài học này?')) {
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
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/lms/instructor"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại Dashboard</span>
            </Link>
            <Link
              href={`/lms/instructor/courses/${courseId}/manage`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Quản lý Module
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Bài Học</h1>
          <p className="text-gray-600">Thêm video, text, hoặc quiz vào các module của khóa học</p>
        </div>

        {modules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có Module</h3>
            <p className="text-gray-600 mb-6">Bạn cần tạo module trước khi thêm bài học</p>
            <Link
              href={`/lms/instructor/courses/${courseId}/manage`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Tạo Module
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Modules List */}
            {modules.map((module: any, moduleIndex: number) => (
              <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {moduleIndex + 1}. {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  )}
                </div>

                <div className="p-6">
                  {/* Lessons List */}
                  {module.lessons && module.lessons.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {module.lessons.map((lesson: any, lessonIndex: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            {getLessonIcon(lesson.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                </h4>
                                {lesson.isFree && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    Miễn phí
                                  </span>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">{lesson.type}</span>
                                </span>
                                {lesson.duration > 0 && (
                                  <span>{lesson.duration} phút</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(lesson, module.id)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lesson.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-4">Chưa có bài học nào</p>
                  )}

                  {/* Add Lesson Button */}
                  <button
                    onClick={() => {
                      setSelectedModule(module.id);
                      setShowForm(true);
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Thêm bài học vào module này
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Lesson Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingLesson ? 'Sửa Bài Học' : 'Thêm Bài Học Mới'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề bài học *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: Giới thiệu về React Hooks"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả ngắn về bài học..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại bài học *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LessonType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="VIDEO">Video</option>
                    <option value="TEXT">Text/Tài liệu</option>
                    <option value="QUIZ">Quiz/Bài kiểm tra</option>
                  </select>
                </div>

                {formData.type === 'VIDEO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video URL *
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      required={formData.type === 'VIDEO'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Hỗ trợ YouTube, Vimeo, hoặc link video trực tiếp
                    </p>
                  </div>
                )}

                {formData.type === 'TEXT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Nhập nội dung bài học..."
                      rows={8}
                      required={formData.type === 'TEXT'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                )}

                {formData.type === 'QUIZ' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Lưu ý:</strong> Sau khi tạo bài học loại Quiz, bạn cần vào trang quản lý Quiz để thêm câu hỏi.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời lượng (phút)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFree}
                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Bài học miễn phí (preview)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {creating || updating ? 'Đang lưu...' : editingLesson ? 'Cập nhật' : 'Thêm bài học'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
