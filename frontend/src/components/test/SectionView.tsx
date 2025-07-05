//file: frontend/src/components/test/SectionView.tsx

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import QuestionCard from './QuestionCard';

interface Question {
  question_id: string;
  question_number: number;
  question_text: string;
  category: string;
  subcategory: string;
  target: string;
  is_active: boolean;
}

interface SectionInfo {
  category: string;
  categoryIndex: number;
  section: string;
  sectionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  isCompleted: boolean;
  questions: Question[];
  title: string;
  description: string;
}

interface SectionViewProps {
  section: SectionInfo;
  answers: Record<number, number>;
  onAnswerChange: (questionNumber: number, value: number) => void;
}

const SectionView: React.FC<SectionViewProps> = ({
  section,
  answers,
  onAnswerChange
}) => {
  return (
    <div className="space-y-6">
      {/* セクションヘッダー（タイトルを非表示、進捗のみ表示） */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            section.isCompleted 
              ? 'bg-green-100 text-green-600' 
              : 'bg-indigo-100 text-indigo-600'
          }`}>
            {section.isCompleted ? (
              <CheckCircleIcon className="w-8 h-8" />
            ) : (
              <span className="text-2xl font-bold">
                {section.answeredQuestions}/{section.totalQuestions}
              </span>
            )}
          </div>
        </div>

        {/* セクション進捗バー */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>進捗</span>
            <span>{Math.round(section.completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                section.isCompleted 
                  ? 'bg-green-500' 
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${section.completionPercentage}%` }}
            />
          </div>
          
          {section.isCompleted && (
            <div className="mt-3 text-green-600 font-semibold flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              セクション完了！
            </div>
          )}
        </div>
      </div>

      {/* 質問一覧 */}
      <div className="space-y-4">
        {section.questions.map((question, index) => (
          <QuestionCard
            key={question.question_id}
            question={question}
            index={index}
            category={section.category}
            answer={answers[question.question_number]}
            onAnswerChange={(value) => onAnswerChange(question.question_number, value)}
          />
        ))}
      </div>

      {/* セクション完了時のメッセージ */}
      {section.isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            セクション完了！
          </h3>
          <p className="text-green-700">
            {section.totalQuestions}問すべてに回答いただきました。
            次のセクションに自動で進みます。
          </p>
        </div>
      )}
    </div>
  );
};

export default SectionView;