import React, { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import Button from '../common/Button';

interface SectionInfo {
  category: string;
  categoryIndex: number;
  section: string;
  sectionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  isCompleted: boolean;
  questions: any[];
  title: string;
  description: string;
}

interface CategoryInfo {
  category: string;
  title: string;
  totalSections: number;
  completedSections: number;
  totalQuestions: number;
  answeredQuestions: number;
  isCompleted: boolean;
}

interface OverallProgress {
  totalSections: number;
  completedSections: number;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  isCompleted: boolean;
}

interface SectionNavigationProps {
  currentSection: SectionInfo;
  currentCategory: CategoryInfo;
  allSections: SectionInfo[];
  categoryInfos: CategoryInfo[];
  overallProgress: OverallProgress;
  onMoveToNextSection: () => void;
  onMoveToPreviousSection: () => void;
  onMoveToSection: (categoryIndex: number, sectionIndex: number) => void;
  canMoveToNextSection: boolean;
  canMoveToPreviousSection: boolean;
  onSubmitTest?: () => void;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  currentSection,
  currentCategory,
  allSections,
  categoryInfos,
  overallProgress,
  onMoveToNextSection,
  onMoveToPreviousSection,
  onMoveToSection,
  canMoveToNextSection,
  canMoveToPreviousSection,
  onSubmitTest
}) => {
  const [showSectionList, setShowSectionList] = useState(false);

  // ブレッドクラム表示
  const getBreadcrumb = () => {
    const categoryProgress = `${currentCategory.completedSections}/${currentCategory.totalSections}`;
    const overallProgressText = `${overallProgress.completedSections}/${overallProgress.totalSections}`;
    
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="font-medium">{currentCategory.title}</span>
        <span>({categoryProgress})</span>
        <span>•</span>
        <span className="font-medium">{currentSection.title}</span>
        <span>•</span>
        <span>全体進捗: {overallProgressText}</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* ヘッダー部分 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            {getBreadcrumb()}
            <div className="mt-2 flex items-center space-x-4">
              <div className="text-xs text-gray-500">
                全体進捗: {Math.round(overallProgress.completionPercentage)}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowSectionList(!showSectionList)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span>セクション一覧</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showSectionList ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* セクション一覧 (折りたたみ可能) */}
      {showSectionList && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            {categoryInfos.map((category, categoryIndex) => (
              <div key={category.category}>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  {category.isCompleted && <CheckCircleIconSolid className="w-4 h-4 text-green-500 mr-2" />}
                  {category.title}
                  <span className="ml-2 text-xs text-gray-500">
                    ({category.completedSections}/{category.totalSections})
                  </span>
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {allSections
                    .filter(s => s.categoryIndex === categoryIndex)
                    .map((section) => {
                      const isCurrent = section.categoryIndex === currentSection.categoryIndex && 
                                       section.sectionIndex === currentSection.sectionIndex;
                      const canJump = section.isCompleted || isCurrent;
                      
                      return (
                        <button
                          key={`${section.categoryIndex}-${section.sectionIndex}`}
                          onClick={() => canJump ? onMoveToSection(section.categoryIndex, section.sectionIndex) : null}
                          disabled={!canJump}
                          className={`p-2 text-xs rounded-lg border transition-colors ${
                            isCurrent
                              ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                              : section.isCompleted
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                              : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{section.title}</span>
                            {section.isCompleted ? (
                              <CheckCircleIcon className="w-3 h-3 flex-shrink-0 ml-1" />
                            ) : (
                              <ClockIcon className="w-3 h-3 flex-shrink-0 ml-1" />
                            )}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {section.answeredQuestions}/{section.totalQuestions}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ナビゲーションボタン */}
      <div className="p-4 flex items-center justify-between">
        <Button
          onClick={onMoveToPreviousSection}
          disabled={!canMoveToPreviousSection}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>前のセクション</span>
        </Button>

        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {currentSection.title}
          </div>
          <div className="text-xs text-gray-500">
            {currentSection.answeredQuestions}/{currentSection.totalQuestions} 問完了
          </div>
        </div>

        {canMoveToNextSection ? (
          <Button
            onClick={onMoveToNextSection}
            className="flex items-center space-x-2"
          >
            <span>次のセクション</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        ) : overallProgress.isCompleted ? (
          <Button
            onClick={onSubmitTest}
            className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>テスト提出</span>
          </Button>
        ) : (
          <Button
            disabled
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <span>最終セクション</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SectionNavigation;