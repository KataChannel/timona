'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { UPDATE_COURSE, GET_MY_COURSES, GET_COURSE_CATEGORIES } from '@/graphql/lms/courses.graphql';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react';

// Query để lấy course detail theo ID
const GET_COURSE_BY_ID = gql`
  query GetCourseById($id: ID!) {
    course(id: $id) {
      id
      title
      slug
      description
      thumbnail
      trailer
      price
      level
      status
      duration
      metaTitle
      metaDescription
      tags
      whatYouWillLearn
      requirements
      targetAudience
      categoryId
    }
  }
`;

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    trailer: '',
    price: 0,
    level: 'BEGINNER',
    status: 'DRAFT',
    duration: 0,
    metaTitle: '',
    metaDescription: '',
    tags: [] as string[],
    whatYouWillLearn: [] as string[],
    requirements: [] as string[],
    targetAudience: [] as string[],
    categoryId: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [audienceInput, setAudienceInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load course data
  const { data: courseData, loading: loadingCourse } = useQuery(GET_COURSE_BY_ID, {
    variables: { id: courseId },
    skip: !courseId,
    onCompleted: (data) => {
      if (data?.course) {
        const course = data.course;
        setFormData({
          title: course.title || '',
          description: course.description || '',
          thumbnail: course.thumbnail || '',
          trailer: course.trailer || '',
          price: course.price || 0,
          level: course.level || 'BEGINNER',
          status: course.status || 'DRAFT',
          duration: course.duration || 0,
          metaTitle: course.metaTitle || '',
          metaDescription: course.metaDescription || '',
          tags: course.tags || [],
          whatYouWillLearn: course.whatYouWillLearn || [],
          requirements: course.requirements || [],
          targetAudience: course.targetAudience || [],
          categoryId: course.categoryId || '',
        });
      }
    },
  });

  const { data: categoriesData } = useQuery(GET_COURSE_CATEGORIES);
  const [updateCourse, { loading }] = useMutation(UPDATE_COURSE, {
    refetchQueries: [{ query: GET_MY_COURSES }],
    onCompleted: () => {
      router.push('/lms/instructor');
    },
    onError: (error) => {
      console.error('Error updating course:', error);
      setErrors({ submit: error.message });
    },
  });

  const categories = categoriesData?.courseCategoryTree || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }
    if (formData.title.length > 200) {
      newErrors.title = 'Tiêu đề không được quá 200 ký tự';
    }
    if (formData.price < 0) {
      newErrors.price = 'Giá không được âm';
    }
    if (formData.duration && formData.duration < 0) {
      newErrors.duration = 'Thời lượng không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const input = {
        id: courseId,
        ...formData,
        duration: formData.duration || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        categoryId: formData.categoryId || undefined,
        thumbnail: formData.thumbnail || undefined,
        trailer: formData.trailer || undefined,
      };

      await updateCourse({ variables: { input } });
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/instructor"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa khóa học</h1>
                <p className="text-sm text-gray-600">{courseData?.course?.title}</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cơ bản</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2`}
                  placeholder="Ví dụ: Lập trình Web với React & Next.js"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả khóa học
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết về khóa học, nội dung, lợi ích học viên nhận được..."
                />
              </div>

              {/* Category & Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((category: any) => (
                      <React.Fragment key={category.id}>
                        <option value={category.id}>{category.name}</option>
                        {category.children?.map((child: any) => (
                          <option key={child.id} value={child.id}>
                            &nbsp;&nbsp;└─ {child.name}
                          </option>
                        ))}
                      </React.Fragment>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BEGINNER">Cơ bản</option>
                    <option value="INTERMEDIATE">Trung cấp</option>
                    <option value="ADVANCED">Nâng cao</option>
                    <option value="EXPERT">Chuyên gia</option>
                  </select>
                </div>
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Giá (USD)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.duration ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="0"
                  />
                  {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PUBLISHED">Công khai</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Learning Outcomes & Requirements - Same as Create page */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nội dung & Yêu cầu</h2>

            <div className="space-y-6">
              {/* What You'll Learn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bạn sẽ học được gì?
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={learnInput}
                    onChange={(e) => setLearnInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (learnInput.trim() && !formData.whatYouWillLearn.includes(learnInput.trim())) {
                          setFormData(prev => ({
                            ...prev,
                            whatYouWillLearn: [...prev.whatYouWillLearn, learnInput.trim()],
                          }));
                          setLearnInput('');
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Xây dựng ứng dụng web hoàn chỉnh..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (learnInput.trim() && !formData.whatYouWillLearn.includes(learnInput.trim())) {
                        setFormData(prev => ({
                          ...prev,
                          whatYouWillLearn: [...prev.whatYouWillLearn, learnInput.trim()],
                        }));
                        setLearnInput('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span className="flex-1 text-gray-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index),
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (requirementInput.trim() && !formData.requirements.includes(requirementInput.trim())) {
                          setFormData(prev => ({
                            ...prev,
                            requirements: [...prev.requirements, requirementInput.trim()],
                          }));
                          setRequirementInput('');
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kiến thức cơ bản về HTML, CSS..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (requirementInput.trim() && !formData.requirements.includes(requirementInput.trim())) {
                        setFormData(prev => ({
                          ...prev,
                          requirements: [...prev.requirements, requirementInput.trim()],
                        }));
                        setRequirementInput('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.requirements.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 mt-1">•</span>
                      <span className="flex-1 text-gray-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            requirements: prev.requirements.filter((_, i) => i !== index),
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng học viên
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (audienceInput.trim() && !formData.targetAudience.includes(audienceInput.trim())) {
                          setFormData(prev => ({
                            ...prev,
                            targetAudience: [...prev.targetAudience, audienceInput.trim()],
                          }));
                          setAudienceInput('');
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Người mới bắt đầu học lập trình web..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (audienceInput.trim() && !formData.targetAudience.includes(audienceInput.trim())) {
                        setFormData(prev => ({
                          ...prev,
                          targetAudience: [...prev.targetAudience, audienceInput.trim()],
                        }));
                        setAudienceInput('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.targetAudience.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-purple-600 mt-1">👤</span>
                      <span className="flex-1 text-gray-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            targetAudience: prev.targetAudience.filter((_, i) => i !== index),
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Media</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <div className="flex gap-4 items-start">
                  <input
                    type="text"
                    id="thumbnail"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <Upload className="w-5 h-5" />
                    Upload
                  </button>
                </div>
                {formData.thumbnail && (
                  <div className="mt-3">
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="trailer" className="block text-sm font-medium text-gray-700 mb-2">
                  Video giới thiệu
                </label>
                <input
                  type="text"
                  id="trailer"
                  name="trailer"
                  value={formData.trailer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* SEO & Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">SEO & Tags</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO title..."
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tag và Enter..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button - Mobile Fixed */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>

        <div className="md:hidden h-20" />
      </div>
    </div>
  );
}
