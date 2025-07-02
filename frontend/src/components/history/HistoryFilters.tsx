// src/components/history/HistoryFilters.tsx

import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface FilterOptions {
  period: 'all' | '1month' | '3months' | '6months';
  athleteTypes: string[];
  scoreRange: { min: number; max: number };
  showOnlyImproved: boolean;
}

interface HistoryFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableAthleteTypes: string[];
  initialFilters?: Partial<FilterOptions>;
}

const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  onFilterChange,
  availableAthleteTypes,
  initialFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    period: initialFilters?.period || 'all',
    athleteTypes: initialFilters?.athleteTypes || [],
    scoreRange: initialFilters?.scoreRange || { min: 0, max: 600 },
    showOnlyImproved: initialFilters?.showOnlyImproved || false
  });

  const [localScoreRange, setLocalScoreRange] = useState(filters.scoreRange);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handlePeriodChange = (period: FilterOptions['period']) => {
    setFilters(prev => ({ ...prev, period }));
  };

  const handleAthleteTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      athleteTypes: prev.athleteTypes.includes(type)
        ? prev.athleteTypes.filter(t => t !== type)
        : [...prev.athleteTypes, type]
    }));
  };

  const handleScoreRangeChange = (type: 'min' | 'max', value: number) => {
    setLocalScoreRange(prev => ({ ...prev, [type]: value }));
  };

  const handleScoreRangeCommit = () => {
    setFilters(prev => ({ ...prev, scoreRange: localScoreRange }));
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterOptions = {
      period: 'all',
      athleteTypes: [],
      scoreRange: { min: 0, max: 600 },
      showOnlyImproved: false
    };
    setFilters(defaultFilters);
    setLocalScoreRange(defaultFilters.scoreRange);
  };

  const hasActiveFilters = filters.period !== 'all' || 
                          filters.athleteTypes.length > 0 || 
                          filters.scoreRange.min > 0 || 
                          filters.scoreRange.max < 600 ||
                          filters.showOnlyImproved;

  return (
    <div className="relative">
      {/* フィルターボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          hasActiveFilters
            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <FunnelIcon className="w-4 h-4 mr-2" />
        フィルター
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
            {filters.athleteTypes.length + (filters.period !== 'all' ? 1 : 0) + (filters.showOnlyImproved ? 1 : 0)}
          </span>
        )}
      </button>

      {/* フィルターパネル */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="p-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">フィルター</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* 期間フィルター */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">期間</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: '全期間' },
                    { value: '1month', label: '過去1ヶ月' },
                    { value: '3months', label: '過去3ヶ月' },
                    { value: '6months', label: '過去6ヶ月' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        value={option.value}
                        checked={filters.period === option.value}
                        onChange={() => handlePeriodChange(option.value as FilterOptions['period'])}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* アスリートタイプフィルター */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">アスリートタイプ</h4>
                <div className="space-y-2">
                  {availableAthleteTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.athleteTypes.includes(type)}
                        onChange={() => handleAthleteTypeToggle(type)}
                        className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* スコア範囲フィルター */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  総合スコア範囲: {localScoreRange.min} - {localScoreRange.max}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">最小値</label>
                    <input
                      type="range"
                      min="0"
                      max="600"
                      step="10"
                      value={localScoreRange.min}
                      onChange={(e) => handleScoreRangeChange('min', parseInt(e.target.value))}
                      onMouseUp={handleScoreRangeCommit}
                      onTouchEnd={handleScoreRangeCommit}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">最大値</label>
                    <input
                      type="range"
                      min="0"
                      max="600"
                      step="10"
                      value={localScoreRange.max}
                      onChange={(e) => handleScoreRangeChange('max', parseInt(e.target.value))}
                      onMouseUp={handleScoreRangeCommit}
                      onTouchEnd={handleScoreRangeCommit}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* その他のオプション */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showOnlyImproved}
                    onChange={(e) => setFilters(prev => ({ ...prev, showOnlyImproved: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">改善があった結果のみ表示</span>
                </label>
              </div>

              {/* アクションボタン */}
              <div className="flex justify-between">
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  リセット
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                >
                  適用
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryFilters;