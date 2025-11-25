// ✅ MIGRATED TO DYNAMIC GRAPHQL - 2025-10-29
// Original backup: QuizTaker.tsx.backup

'use client';

import React, { useState, useEffect } from 'react';
import { useFindUnique } from '@/hooks/useDynamicGraphQL';
import { useMutation } from '@apollo/client';
import { SUBMIT_QUIZ } from '@/graphql/lms/quizzes.graphql';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface QuizTakerProps {
  quizId: string;
  enrollmentId: string;
  onComplete: (attemptId: string) => void;
}

interface Answer {
  id: string;
  text: string;
  order: number;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  type: string;
  question: string;
  points: number;
  order: number;
  explanation?: string;
  answers: Answer[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  questions: Question[];
}

export default function QuizTaker({ quizId, enrollmentId, onComplete }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  // ✅ Migrated to Dynamic GraphQL
  const { data: quiz, loading, error } = useFindUnique('quiz', quizId, {
    include: {
      questions: {
        include: { answers: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  // ✅ Use custom mutation instead of dynamic CRUD
  const [submitQuiz] = useMutation(SUBMIT_QUIZ);

  // Initialize timer
  useEffect(() => {
    if (quiz?.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answerId: string, isMultiple: boolean) => {
    setUserAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      
      if (isMultiple) {
        // Multiple choice: toggle answer
        if (currentAnswers.includes(answerId)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((id) => id !== answerId),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, answerId],
          };
        }
      } else {
        // Single choice: replace answer
        return {
          ...prev,
          [questionId]: [answerId],
        };
      }
    });
  };

    const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const answers = Object.entries(userAnswers).map(([questionId, selectedAnswerIds]) => ({
        questionId,
        selectedAnswerIds,
      }));

      const { data } = await submitQuiz({
        variables: {
          input: {
            quizId,
            enrollmentId,
            answers,
            timeSpent,
          },
        },
      });

      if (data?.submitQuiz?.id) {
        onComplete(data.submitQuiz.id);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load quiz</h3>
        <p className="text-red-700">{error?.message || 'Quiz not found'}</p>
      </div>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Questions Available</h3>
        <p className="text-yellow-700">This quiz does not have any questions yet.</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(userAnswers).length;
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const allQuestionsAnswered = answeredQuestions === totalQuestions;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 mt-1">{quiz.description}</p>
            )}
          </div>
          {timeRemaining !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="text-lg font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {answeredQuestions}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Questions</h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((question: any, index: any) => {
            const isAnswered = userAnswers[question.id]?.length > 0;
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={question.id}
                onClick={() => goToQuestion(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : isAnswered
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-500">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {[...currentQuestion.answers]
            .sort((a: any, b: any) => a.order - b.order)
            .map((answer: any) => {
              const isSelected = userAnswers[currentQuestion.id]?.includes(answer.id);
              const isMultipleChoice = currentQuestion.type === 'MULTIPLE_CHOICE' && 
                currentQuestion.answers.filter((a: any) => a.isCorrect).length > 1;

              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(currentQuestion.id, answer.id, isMultipleChoice)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-gray-900 font-medium">{answer.text}</span>
                  </div>
                </button>
              );
            })}
        </div>

        {currentQuestion.type === 'MULTIPLE_CHOICE' && 
          currentQuestion.answers.filter((a: any) => a.isCorrect).length > 1 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
            <AlertCircle className="w-4 h-4" />
            <span>Select all correct answers</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
        >
          Previous
        </button>

        <div className="flex gap-3">
          {!isLastQuestion ? (
            <button
              onClick={nextQuestion}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit Quiz
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {!allQuestionsAnswered && isLastQuestion && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            Please answer all questions before submitting.
            Unanswered: {totalQuestions - answeredQuestions}
          </p>
        </div>
      )}
    </div>
  );
}
