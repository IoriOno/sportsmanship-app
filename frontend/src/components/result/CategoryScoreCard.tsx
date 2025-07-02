import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  subcategories?: {
    name: string;
    score: number;
    maxScore: number;
    description: string;
  }[];
}

interface CategoryScoreCardProps {
  category: CategoryScore;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isExpandable?: boolean;
  defaultExpanded?: boolean;
}

const CategoryScoreCard: React.FC<CategoryScoreCardProps> = ({
  category,
  color = 'blue',
  isExpandable = true,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const percentage = (category.score / category.maxScore) * 100;
  
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      accent: 'text-blue-600',
      progress: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      accent: 'text-green-600',
      progress: 'bg-green-500',
      gradient: 'from-green-400 to-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      accent: 'text-purple-600',
      progress: 'bg-purple-500',
      gradient: 'from-purple-400 to-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      accent: 'text-orange-600',
      progress: 'bg-orange-500',
      gradient: 'from-orange-400 to-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      accent: 'text-red-600',
      progress: 'bg-red-500',
      gradient: 'from-red-400 to-red-600'
    }
  };

  const colors = colorClasses[color];

  const getScoreLevel = (pct: number) => {
    if (pct >= 90) return { label: '非常に優秀', color: 'text-emerald-600' };
    if (pct >= 80) return { label: '優秀', color: 'text-green-600' };
    if (pct >= 70) return { label: '良好', color: 'text-blue-600' };
    if (pct >= 60) return { label: '標準', color: 'text-yellow-600' };
    if (pct >= 40) return { label: '要改善', color: 'text-orange-600' };
    return { label: '要強化', color: 'text-red-600' };
  };

  const scoreLevel = getScoreLevel(percentage);

  return (
    <div className={`rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${colors.bg} ${colors.border}`}>
      {/* Header */}
      <div 
        className={`p-6 ${isExpandable ? 'cursor-pointer' : ''}`}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-xl font-bold ${colors.text}`}>
                {category.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${colors.accent}`}>
                  {category.score}
                </span>
                <span className="text-gray-500">/ {category.maxScore}</span>
              </div>
            </div>
            
            <p className={`text-sm ${colors.accent} mb-4`}>
              {category.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">達成度</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${scoreLevel.color}`}>
                    {Math.round(percentage)}%
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${scoreLevel.color} bg-white`}>
                    {scoreLevel.label}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-white bg-opacity-60 rounded-full h-3 shadow-inner">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {/* Score indicator */}
                <div 
                  className="absolute top-0 h-3 w-1 bg-white rounded-full shadow-md transform -translate-x-0.5"
                  style={{ left: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {isExpandable && (
            <div className="ml-4">
              {isExpanded ? (
                <ChevronDownIcon className={`w-5 h-5 ${colors.accent} transition-transform duration-200`} />
              ) : (
                <ChevronRightIcon className={`w-5 h-5 ${colors.accent} transition-transform duration-200`} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpandable && isExpanded && category.subcategories && (
        <div className="px-6 pb-6">
          <div className="border-t border-white border-opacity-50 pt-4">
            <h4 className={`font-semibold ${colors.text} mb-4`}>詳細分析</h4>
            <div className="space-y-4">
              {category.subcategories.map((sub, index) => {
                const subPercentage = (sub.score / sub.maxScore) * 100;
                const subScoreLevel = getScoreLevel(subPercentage);
                
                return (
                  <div key={index} className="bg-white bg-opacity-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className={`font-medium ${colors.text}`}>{sub.name}</h5>
                        <p className="text-xs text-gray-600 mt-1">{sub.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`text-lg font-bold ${colors.accent}`}>
                          {sub.score}
                        </div>
                        <div className="text-xs text-gray-500">/ {sub.maxScore}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={subScoreLevel.color}>
                          {subScoreLevel.label}
                        </span>
                        <span className="font-medium">
                          {Math.round(subPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${colors.progress}`}
                          style={{ width: `${subPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// プリセットカテゴリコンポーネント
export const SportsmanshipScoreCard: React.FC<{ scores: any }> = ({ scores }) => (
  <CategoryScoreCard
    category={{
      name: "スポーツマンシップ",
      score: scores.courage + scores.resilience + scores.cooperation + scores.natural_acceptance + scores.non_rationality,
      maxScore: 500,
      description: "スポーツにおける基本的な心構えや姿勢",
      subcategories: [
        { name: "勇気", score: scores.courage, maxScore: 100, description: "困難な状況でも挑戦し続ける力" },
        { name: "打たれ強さ", score: scores.resilience, maxScore: 100, description: "失敗や困難に負けない心の強さ" },
        { name: "協調性", score: scores.cooperation, maxScore: 100, description: "チームワークを大切にする姿勢" },
        { name: "自然体", score: scores.natural_acceptance, maxScore: 100, description: "ありのままの自分を受け入れる力" },
        { name: "非合理性", score: scores.non_rationality, maxScore: 100, description: "論理にとらわれすぎない柔軟性" }
      ]
    }}
    color="blue"
  />
);

export const AthleteMinScoreCard: React.FC<{ scores: any }> = ({ scores }) => (
  <CategoryScoreCard
    category={{
      name: "アスリートマインド",
      score: scores.introspection + scores.self_control,
      maxScore: 200,
      description: "アスリートとしての精神的な特性",
      subcategories: [
        { name: "内省", score: scores.introspection, maxScore: 100, description: "自分自身を深く見つめる力" },
        { name: "克己", score: scores.self_control, maxScore: 100, description: "自分をコントロールする力" }
      ]
    }}
    color="green"
  />
);

export const SelfEsteemScoreCard: React.FC<{ scores: any }> = ({ scores }) => (
  <CategoryScoreCard
    category={{
      name: "自己肯定感",
      score: scores.self_determination,
      maxScore: 100,
      description: "自分自身に対する肯定的な感情",
      subcategories: [
        { name: "自己決定感", score: scores.self_determination, maxScore: 100, description: "自分で決断し行動する力" }
      ]
    }}
    color="purple"
  />
);

export default CategoryScoreCard;