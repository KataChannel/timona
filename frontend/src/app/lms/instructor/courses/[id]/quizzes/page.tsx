'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { useFindUnique, useCreateOne, useUpdateOne, useDeleteOne } from '@/hooks/useDynamicGraphQL';

type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

interface Answer {
  text: string;
  isCorrect: boolean;
  order: number;
}

export default function ManageQuizzesPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: 30,
  });

  const [questionFormData, setQuestionFormData] = useState({
    type: 'MULTIPLE_CHOICE' as QuestionType,
    question: '',
    points: 10,
    explanation: '',
    answers: [
      { text: '', isCorrect: true, order: 0 },
      { text: '', isCorrect: false, order: 1 },
    ] as Answer[],
  });

  const { data: course, refetch } = useFindUnique('course', courseId, {
    include: { 
      modules: {
        include: { 
          lessons: { 
            where: { type: 'QUIZ' },
            include: {
              quizzes: {
                include: {
                  questions: {
                    include: { answers: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' }
                  }
                }
              }
            },
            orderBy: { order: 'asc' } 
          } 
        },
        orderBy: { order: 'asc' }
      }
    },
  });

  const [createQuiz] = useCreateOne('quiz');
  const [updateQuiz] = useUpdateOne('quiz');
  const [deleteQuiz] = useDeleteOne('quiz');
  const [createQuestion] = useCreateOne('question');
  const [deleteQuestion] = useDeleteOne('question');

  const modules = course?.modules || [];
  const quizLessons = modules.flatMap((m: any) => 
    (m.lessons || []).map((l: any) => ({ ...l, moduleName: m.title }))
  );

  const resetQuizForm = () => {
    setQuizFormData({ title: '', description: '', passingScore: 70, timeLimit: 30 });
    setSelectedLesson('');
    setEditingQuiz(null);
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      type: 'MULTIPLE_CHOICE',
      question: '',
      points: 10,
      explanation: '',
      answers: [
        { text: '', isCorrect: true, order: 0 },
        { text: '', isCorrect: false, order: 1 },
      ],
    });
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createQuiz({
      data: {
        lessonId: selectedLesson,
        ...quizFormData,
      },
    });
    
    setShowQuizForm(false);
    resetQuizForm();
    refetch();
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm('Bạn có chắc muốn xóa quiz này? Tất cả câu hỏi sẽ bị xóa!')) {
      await deleteQuiz({ where: { id: quizId } });
      refetch();
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentQuiz) return;

    // Create question with answers
    await createQuestion({
      data: {
        quizId: currentQuiz.id,
        type: questionFormData.type,
        question: questionFormData.question,
        points: questionFormData.points,
        explanation: questionFormData.explanation,
        order: currentQuiz.questions?.length || 0,
        answers: {
          create: questionFormData.answers.map((a, i) => ({
            text: a.text,
            isCorrect: a.isCorrect,
            order: i,
          })),
        },
      },
    });

    setShowQuestionForm(false);
    resetQuestionForm();
    refetch();
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      await deleteQuestion({ where: { id: questionId } });
      refetch();
    }
  };

  const addAnswer = () => {
    setQuestionFormData({
      ...questionFormData,
      answers: [
        ...questionFormData.answers,
        { text: '', isCorrect: false, order: questionFormData.answers.length },
      ],
    });
  };

  const removeAnswer = (index: number) => {
    setQuestionFormData({
      ...questionFormData,
      answers: questionFormData.answers.filter((_, i) => i !== index),
    });
  };

  const updateAnswer = (index: number, field: keyof Answer, value: any) => {
    const newAnswers = [...questionFormData.answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    
    // If setting this answer as correct for MULTIPLE_CHOICE (single answer)
    if (field === 'isCorrect' && value === true && questionFormData.type !== 'MULTIPLE_CHOICE') {
      newAnswers.forEach((a, i) => {
        if (i !== index) a.isCorrect = false;
      });
    }
    
    setQuestionFormData({ ...questionFormData, answers: newAnswers });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/lms/instructor"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại Dashboard</span>
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/lms/instructor/courses/${courseId}/manage`}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Quản lý Module
              </Link>
              <Link
                href={`/lms/instructor/courses/${courseId}/lessons`}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Quản lý Bài học
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Quiz</h1>
          <p className="text-gray-600">Tạo và quản lý câu hỏi cho các bài kiểm tra</p>
        </div>

        {quizLessons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có Lesson loại Quiz</h3>
            <p className="text-gray-600 mb-6">Bạn cần tạo lesson type QUIZ trước khi thêm câu hỏi</p>
            <Link
              href={`/lms/instructor/courses/${courseId}/lessons`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Tạo Lesson Quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quiz List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Danh Sách Quiz</h2>
                
                {quizLessons.map((lesson: any) => (
                  <div key={lesson.id} className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">{lesson.moduleName}</div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                      
                      {lesson.quizzes && lesson.quizzes.length > 0 ? (
                        lesson.quizzes.map((quiz: any) => (
                          <div key={quiz.id} className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {quiz.questions?.length || 0} câu hỏi • Điểm đạt: {quiz.passingScore}%
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setCurrentQuiz(quiz);
                                    setShowQuestionForm(false);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Xem chi tiết"
                                >
                                  <HelpCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson.id);
                            setShowQuizForm(true);
                          }}
                          className="w-full mt-2 p-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          + Tạo Quiz
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quiz Details & Questions */}
            <div className="lg:col-span-2">
              {currentQuiz ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentQuiz.title}</h2>
                      {currentQuiz.description && (
                        <p className="text-gray-600 mt-1">{currentQuiz.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>Điểm đạt: {currentQuiz.passingScore}%</span>
                        {currentQuiz.timeLimit && <span>Thời gian: {currentQuiz.timeLimit} phút</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowQuestionForm(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm Câu Hỏi
                    </button>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                    {currentQuiz.questions && currentQuiz.questions.length > 0 ? (
                      currentQuiz.questions.map((q: any, index: number) => (
                        <div key={q.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-500">Câu {index + 1}</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                  {q.type}
                                </span>
                                <span className="text-sm text-gray-500">{q.points} điểm</span>
                              </div>
                              <h4 className="font-medium text-gray-900">{q.question}</h4>
                            </div>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2 pl-4">
                            {q.answers?.map((a: any) => (
                              <div key={a.id} className="flex items-center gap-2">
                                {a.isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span className={a.isCorrect ? 'text-green-900 font-medium' : 'text-gray-600'}>
                                  {a.text}
                                </span>
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <div className="mt-3 pl-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Giải thích:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">Chưa có câu hỏi nào</p>
                        <button
                          onClick={() => setShowQuestionForm(true)}
                          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Thêm câu hỏi đầu tiên
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn Quiz</h3>
                  <p className="text-gray-600">Chọn một quiz từ danh sách bên trái để quản lý câu hỏi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Quiz Modal */}
        {showQuizForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Tạo Quiz Mới</h2>
              </div>

              <form onSubmit={handleCreateQuiz} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề Quiz *
                  </label>
                  <input
                    type="text"
                    value={quizFormData.title}
                    onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
                    placeholder="VD: Quiz: Kiểm tra Module 1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={quizFormData.description}
                    onChange={(e) => setQuizFormData({ ...quizFormData, description: e.target.value })}
                    placeholder="Mô tả về quiz..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm đạt (%)
                    </label>
                    <input
                      type="number"
                      value={quizFormData.passingScore}
                      onChange={(e) => setQuizFormData({ ...quizFormData, passingScore: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian (phút)
                    </label>
                    <input
                      type="number"
                      value={quizFormData.timeLimit}
                      onChange={(e) => setQuizFormData({ ...quizFormData, timeLimit: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Tạo Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuizForm(false);
                      resetQuizForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Question Modal */}
        {showQuestionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Thêm Câu Hỏi Mới</h2>
              </div>

              <form onSubmit={handleAddQuestion} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại câu hỏi *
                  </label>
                  <select
                    value={questionFormData.type}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, type: e.target.value as QuestionType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice (Nhiều đáp án)</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Câu hỏi *
                  </label>
                  <textarea
                    value={questionFormData.question}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                    placeholder="VD: React là gì?"
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm số
                  </label>
                  <input
                    type="number"
                    value={questionFormData.points}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Answers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đáp án *
                  </label>
                  <div className="space-y-2">
                    {questionFormData.answers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={answer.isCorrect}
                          onChange={(e) => updateAnswer(index, 'isCorrect', e.target.checked)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                          placeholder={`Đáp án ${index + 1}`}
                          required
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {questionFormData.answers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeAnswer(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addAnswer}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Thêm đáp án
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giải thích (tùy chọn)
                  </label>
                  <textarea
                    value={questionFormData.explanation}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                    placeholder="Giải thích đáp án đúng..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Thêm Câu Hỏi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false);
                      resetQuestionForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
