//frontend/src/components/result/ResultHeader.tsx
import React from 'react';
import { CalendarIcon, UserIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { UserRole } from '../../types/auth';

interface ResultHeaderProps {
  userName: string;
  userRole: UserRole;  // UserRole型に変更
  testDate: string;
  athleteType: string;
  overallScore?: number;  // オプショナルに変更
  maxScore?: number;      // オプショナルに変更
  onExportPDF?: () => void;
  onShare?: () => void;
}

const ResultHeader: React.FC<ResultHeaderProps> = ({
  userName,
  userRole,
  testDate,
  overallScore,
  maxScore,
  athleteType,
  onExportPDF,
  onShare
}) => {
  const scorePercentage = (overallScore && maxScore) ? (overallScore / maxScore) * 100 : 0;
  const showScore = overallScore !== undefined && maxScore !== undefined;
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 80) return 'from-green-400 to-emerald-600';
    if (percentage >= 60) return 'from-blue-400 to-indigo-600';
    if (percentage >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-red-500';
  };

  const getRoleLabel = (role: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      [UserRole.PLAYER]: '選手',
      [UserRole.COACH]: 'コーチ',
      [UserRole.FATHER]: '父親',
      [UserRole.MOTHER]: '母親',
      [UserRole.ADULT]: '一般成人'
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-xl border border-gray-100">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-30"></div>
      
      <div className="relative p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Section - User Info & Test Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                テスト結果
              </h1>
              <p className="text-lg text-gray-600">
                メンタルヘルス・スポーツマンシップ診断
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-sm text-gray-500">受験者</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{userName}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {getRoleLabel(userRole)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-sm text-gray-500">実施日</span>
                  <div className="font-semibold text-gray-900">
                    {new Date(testDate).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <TrophyIcon className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-sm text-gray-500">アスリートタイプ</span>
                  <div className="font-semibold text-gray-900">{athleteType}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              {onExportPDF && (
                <button
                  onClick={onExportPDF}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDFで保存
                </button>
              )}
              
              {onShare && (
                <button
                  onClick={onShare}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  シェア
                </button>
              )}
            </div>
          </div>

          {/* Right Section - Overall Score Display (条件付き表示) */}
          {showScore && (
            <div className="flex justify-center">
              <div className="relative">
                {/* Score Circle */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#scoreGradient)"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - scorePercentage / 100)}`}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className={`stop-color ${getScoreGradient(scorePercentage).split(' ')[0].replace('from-', '')}`} />
                        <stop offset="100%" className={`stop-color ${getScoreGradient(scorePercentage).split(' ')[1].replace('to-', '')}`} />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Score Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(scorePercentage)}`}>
                        {overallScore}
                      </div>
                      <div className="text-sm text-gray-500">/ {maxScore}</div>
                      <div className={`text-lg font-semibold ${getScoreColor(scorePercentage)} mt-1`}>
                        {Math.round(scorePercentage)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Label */}
                <div className="text-center mt-4">
                  <div className="text-sm text-gray-500 mb-1">総合スコア</div>
                  <div className={`text-sm font-medium ${getScoreColor(scorePercentage)}`}>
                    {scorePercentage >= 80 ? '優秀' : 
                     scorePercentage >= 60 ? '良好' : 
                     scorePercentage >= 40 ? '標準' : '要改善'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultHeader;