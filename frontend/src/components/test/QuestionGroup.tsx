import React from 'react';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
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

interface QuestionGroupProps {
  subcategory: string;
  title: string;
  description?: string;
  questions: Question[];
  answers: Record<number, number>;
  onAnswerChange: (questionNumber: number, value: number) => void;
  category: string;
}

const QuestionGroup: React.FC<QuestionGroupProps> = ({
  subcategory,
  title,
  description,
  questions,
  answers,
  onAnswerChange,
  category
}) => {
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => 
    answers[q.question_number] !== undefined
  ).length;
  const isCompleted = answeredQuestions === totalQuestions && totalQuestions > 0;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const getSubcategoryInfo = (subcategory: string, category: string) => {
    const subcategoryLabels: Record<string, { title: string; description: string }> = {
      // スポーツマンシップ
      'courage': {
        title: '勇気',
        description: '困難な状況でも挑戦し続ける力'
      },
      'resilience': {
        title: '打たれ強さ',
        description: '失敗や困難に負けない心の強さ'
      },
      'cooperation': {
        title: '協調性',
        description: 'チームワークを大切にする姿勢'
      },
      'natural_acceptance': {
        title: '自然体',
        description: 'ありのままの自分を受け入れる力'
      },
      'non_rationality': {
        title: '非合理性',
        description: '論理にとらわれすぎない柔軟性'
      },
      // アスリートマインド
      'introspection': {
        title: '内省',
        description: '自分自身を深く見つめる力'
      },
      'self_control': {
        title: '克己',
        description: '自分をコントロールする力'
      },
      // 自己肯定感
      'self_determination': {
        title: '自己決定感',
        description: '自分で決断し行動する力'
      }
    };

    return subcategoryLabels[subcategory] || { title: title, description: description || '' };
  };

  const subcategoryInfo = getSubcategoryInfo(subcategory, category);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sportsmanship':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          accent: 'text-blue-600',
          progress: 'bg-blue-500'
        };
      case 'athlete_mind':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          accent: 'text-green-600',
          progress: 'bg-green-500'
        };
      case 'self_affirmation':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-900',
          accent: 'text-purple-600',
          progress: 'bg-purple-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          accent: 'text-gray-600',
          progress: 'bg-gray-500'
        };
    }
  };

  const colors = getCategoryColor(category);

  return (
    <div className={`border rounded-lg ${colors.bg} ${colors.border} mb-6`}>
      {/* Group Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 ${colors.border} flex items-center justify-center`}>
                  {answeredQuestions > 0 && (
                    <div className={`w-3 h-3 rounded-full ${colors.progress}`} />
                  )}
                </div>
              )}
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold ${colors.text}`}>
                {subcategoryInfo.title}
              </h3>
              {subcategoryInfo.description && (
                <p className={`text-sm ${colors.accent} mt-1`}>
                  {subcategoryInfo.description}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className={`text-sm font-medium ${colors.text}`}>
              {answeredQuestions} / {totalQuestions}
            </div>
            <div className="text-xs text-gray-600">
              {Math.round(progressPercentage)}% 完了
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : colors.progress
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.question_id}
              question={question}
              answer={answers[question.question_number]}
              onAnswerChange={(value) => onAnswerChange(question.question_number, value)}
              index={index + 1}
              category={category}
            />
          ))}
        </div>

        {/* Group Summary */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-800">
                {subcategoryInfo.title}の質問がすべて完了しました！
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGroup;