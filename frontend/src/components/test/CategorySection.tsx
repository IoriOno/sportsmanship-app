//file: frontend/src/components/test/CategorySection.tsx

import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface Question {
  question_id: string;
  question_number: number;
  question_text: string;
  category: string;
  subcategory: string;
  target: string;
  is_active: boolean;
}

interface CategorySectionProps {
  category: string;
  title: string;
  description: string;
  questions: Question[];
  answers: Record<number, number>;
  isActive: boolean;
  isCompleted: boolean;
  onActivate?: () => void;
  children?: React.ReactNode;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  title,
  description,
  questions,
  answers,
  isActive,
  isCompleted,
  onActivate,
  children
}) => {
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => 
    answers[q.question_number] !== undefined
  ).length;
  
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sportsmanship':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          accent: 'text-blue-600',
          progress: 'bg-blue-600'
        };
      case 'athlete_mind':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          accent: 'text-green-600',
          progress: 'bg-green-600'
        };
      case 'self_affirmation':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-900',
          accent: 'text-purple-600',
          progress: 'bg-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          accent: 'text-gray-600',
          progress: 'bg-gray-600'
        };
    }
  };

  const colors = getCategoryColor(category);

  return (
    <div className={`border-2 rounded-lg transition-all duration-300 ${
      isActive 
        ? `${colors.border} ${colors.bg} shadow-lg` 
        : isCompleted 
          ? `border-gray-300 bg-gray-50` 
          : `border-gray-200 bg-white hover:${colors.bg} hover:${colors.border}`
    }`}>
      {/* Header */}
      <div 
        className={`p-6 cursor-pointer ${!isActive && !isCompleted ? 'hover:opacity-80' : ''}`}
        onClick={!isActive && !isCompleted ? onActivate : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircleIconSolid className="w-8 h-8 text-green-500" />
              ) : (
                <div className={`w-8 h-8 rounded-full border-2 ${
                  isActive ? colors.border : 'border-gray-300'
                } flex items-center justify-center`}>
                  {isActive && (
                    <div className={`w-4 h-4 rounded-full ${colors.progress}`} />
                  )}
                </div>
              )}
            </div>
            
            <div>
              <h2 className={`text-xl font-bold ${
                isActive ? colors.text : isCompleted ? 'text-gray-600' : 'text-gray-800'
              }`}>
                {title}
              </h2>
              <p className={`text-sm ${
                isActive ? colors.accent : 'text-gray-500'
              } mt-1`}>
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-sm font-medium ${
                isActive ? colors.text : 'text-gray-600'
              }`}>
                {answeredQuestions} / {totalQuestions}
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(progressPercentage)}% 完了
              </div>
            </div>

            {!isActive && !isCompleted && (
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : colors.progress
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isActive && (
        <div className="px-6 pb-6">
          <div className="border-t border-gray-200 pt-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySection;