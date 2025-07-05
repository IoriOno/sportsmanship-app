//file: frontend/src/components/test/QuestionCard.tsx

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Question {
  question_id: string;
  question_number: number;
  question_text: string;
  category: string;
  subcategory: string;
  target: string;
  is_active: boolean;
}

interface QuestionCardProps {
  question: Question;
  answer?: number;
  onAnswerChange: (value: number) => void;
  index: number;
  category: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answer,
  onAnswerChange,
  index,
  category
}) => {
  const isAnswered = answer !== undefined;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sportsmanship':
        return {
          border: 'border-blue-200',
          selectedBg: 'bg-blue-600',
          selectedBorder: 'border-blue-600',
          hoverBg: 'hover:bg-blue-50',
          text: 'text-blue-900'
        };
      case 'athlete_mind':
        return {
          border: 'border-green-200',
          selectedBg: 'bg-green-600',
          selectedBorder: 'border-green-600',
          hoverBg: 'hover:bg-green-50',
          text: 'text-green-900'
        };
      case 'self_affirmation':
        return {
          border: 'border-purple-200',
          selectedBg: 'bg-purple-600',
          selectedBorder: 'border-purple-600',
          hoverBg: 'hover:bg-purple-50',
          text: 'text-purple-900'
        };
      default:
        return {
          border: 'border-gray-200',
          selectedBg: 'bg-gray-600',
          selectedBorder: 'border-gray-600',
          hoverBg: 'hover:bg-gray-50',
          text: 'text-gray-900'
        };
    }
  };

  const colors = getCategoryColor(category);

  const getScaleColor = (value: number) => {
    if (value <= 3) return 'border-red-300 hover:bg-red-50';
    if (value <= 7) return 'border-yellow-300 hover:bg-yellow-50';
    return 'border-green-300 hover:bg-green-50';
  };

  return (
    <div className={`bg-white border rounded-lg p-4 transition-all duration-200 ${
      isAnswered ? 'border-gray-300 shadow-sm' : `${colors.border} hover:shadow-md`
    }`}>
      {/* Question Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
            isAnswered 
              ? 'bg-green-100 border-green-300 text-green-700' 
              : `${colors.border} text-gray-600`
          }`}>
            {isAnswered ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs text-gray-500 font-medium">
              問{question.question_number}
            </span>
            {question.target !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {question.target}向け
              </span>
            )}
          </div>
          
          <p className="text-gray-900 text-sm leading-relaxed">
            {question.question_text}
          </p>
        </div>
      </div>

      {/* Answer Scale */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-gray-500">
          <span>そう思わない</span>
          <span>そう思う</span>
        </div>
        
        <div className="grid grid-cols-11 gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => onAnswerChange(value)}
              className={`aspect-square rounded-full border-2 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                answer === value
                  ? `${colors.selectedBg} ${colors.selectedBorder} text-white shadow-md transform scale-110`
                  : `bg-white ${getScaleColor(value)} hover:shadow-sm`
              }`}
              aria-label={`${value}点を選択`}
            >
              {value}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-11 gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <div key={value} className="text-center">
              <span className="text-xs text-gray-400">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Answer Feedback */}
      {isAnswered && (
        <div className="mt-3 p-2 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">回答済み:</span>
            <span className={`font-medium ${colors.text}`}>
              {answer}点
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;