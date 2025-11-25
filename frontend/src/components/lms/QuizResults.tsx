// ✅ MIGRATED TO DYNAMIC GRAPHQL - 2025-10-29
// Original backup: QuizResults.tsx.backup

'use client';

import React from 'react';
import { useFindUnique } from '@/hooks/useDynamicGraphQL';
import { CheckCircle, XCircle, Trophy, Clock, Target, AlertCircle } from 'lucide-react';

interface QuizResultsProps {
  attemptId: string;
  onRetake?: () => void;
  onContinue?: () => void;
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Question {
  id: string;
  question: string;
  type: string;
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
  questions: Question[];
}

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  answers: string;
  timeSpent?: number;
  startedAt: string;
  completedAt: string;
  quiz: Quiz;
}

export default function QuizResults({ attemptId, onRetake, onContinue }: QuizResultsProps) {
  // ✅ Migrated to Dynamic GraphQL
  const { data: attempt, loading, error } = useFindUnique('quizAttempt', attemptId, {
    include: {
      quiz: {
        include: {
          questions: {
            include: { answers: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load results</h3>
        <p className="text-red-700">{error?.message || 'Results not found'}</p>
      </div>
    );
  }

  if (!attempt.quiz || !attempt.quiz.questions) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Incomplete Data</h3>
        <p className="text-yellow-700">Quiz data is not available for this attempt</p>
      </div>
    );
  }

  const userAnswersMap = JSON.parse(attempt.answers || '{}');
  const totalQuestions = attempt.quiz.questions.length;
  
  // Calculate correct answers
  let correctCount = 0;
  attempt.quiz.questions.forEach((question: any) => {
    const userAnswers = userAnswersMap[question.id] || [];
    const correctAnswers = question.answers.filter((a: any) => a.isCorrect).map((a: any) => a.id);
    
    const isCorrect =
      userAnswers.length === correctAnswers.length &&
      userAnswers.every((id: string) => correctAnswers.includes(id)) &&
      correctAnswers.every((id: any) => userAnswers.includes(id));
    
    if (isCorrect) correctCount++;
  });

  const formatTime = (seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Results Header */}
      <div className={`rounded-xl shadow-lg border-2 p-8 mb-8 ${
        attempt.passed
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
      }`}>
        <div className="text-center">
          {attempt.passed ? (
            <Trophy className="w-20 h-20 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {attempt.passed ? 'Congratulations!' : 'Keep Trying!'}
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            {attempt.passed
              ? `You passed the quiz with ${attempt.score.toFixed(1)}%`
              : `You scored ${attempt.score.toFixed(1)}%. You need ${attempt.quiz.passingScore}% to pass.`}
          </p>

          {/* Score Circle */}
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-lg mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${
                attempt.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {attempt.score.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{correctCount}</span>
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">{totalQuestions - correctCount}</span>
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{formatTime(attempt.timeSpent)}</span>
              </div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Question Review
        </h2>

        <div className="space-y-6">
          {[...attempt.quiz.questions]
            .sort((a: any, b: any) => a.order - b.order)
            .map((question: any, index: any) => {
              const userAnswers = userAnswersMap[question.id] || [];
              const correctAnswers = question.answers.filter((a: any) => a.isCorrect).map((a: any) => a.id);
              
              const isCorrect =
                userAnswers.length === correctAnswers.length &&
                userAnswers.every((id: string) => correctAnswers.includes(id)) &&
                correctAnswers.every((id: any) => userAnswers.includes(id));

              return (
                <div
                  key={question.id}
                  className={`border-2 rounded-lg p-6 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-600">
                          Question {index + 1}
                        </span>
                        <span className="px-2 py-1 bg-white text-gray-700 text-xs font-medium rounded">
                          {question.points} pts
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {question.question}
                      </h3>

                      {/* Answer Options */}
                      <div className="space-y-2">
                        {[...question.answers]
                          .sort((a: any, b: any) => a.order - b.order)
                          .map((answer: any) => {
                            const isUserAnswer = userAnswers.includes(answer.id);
                            const isCorrectAnswer = answer.isCorrect;

                            return (
                              <div
                                key={answer.id}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectAnswer && isUserAnswer
                                    ? 'border-green-500 bg-green-100'
                                    : isCorrectAnswer
                                    ? 'border-green-300 bg-green-50'
                                    : isUserAnswer
                                    ? 'border-red-500 bg-red-100'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {isCorrectAnswer && (
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                  )}
                                  <span className={`flex-1 ${
                                    isCorrectAnswer ? 'font-semibold text-green-900' : 'text-gray-700'
                                  }`}>
                                    {answer.text}
                                  </span>
                                  {isCorrectAnswer && (
                                    <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                                      Correct
                                    </span>
                                  )}
                                  {isUserAnswer && (
                                    <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                                      Your answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Explanation</h4>
                            <p className="text-blue-800 text-sm">{question.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        {onRetake && (
          <button
            onClick={onRetake}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Retake Quiz
          </button>
        )}
        {onContinue && (
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Continue Learning
          </button>
        )}
      </div>
    </div>
  );
}
