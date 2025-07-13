// src/components/history/ExportOptions.tsx

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { TestResultWithAnalysis } from '../../types/test';
import { testService } from '../../services/testService';
import Button from '../common/Button';

interface ExportOptionsProps {
  results: TestResultWithAnalysis[];
  selectedResultIds?: Set<string>;
  chartRef?: React.RefObject<HTMLDivElement>;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  results,
  selectedResultIds,
  chartRef
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'image' | null>(null);

  const handleExportCSV = async () => {
    setIsExporting(true);
    setExportType('csv');
    
    try {
      // 選択された結果のみ、または全結果をエクスポート
      const resultsToExport = selectedResultIds && selectedResultIds.size > 0
        ? results.filter(r => selectedResultIds.has(r.result_id))
        : results;

      testService.exportToCSV(resultsToExport);
      
      // 成功通知（オプション）
      console.log('CSVエクスポートが完了しました');
    } catch (error) {
      console.error('CSVエクスポートエラー:', error);
      alert('CSVエクスポートに失敗しました');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    
    try {
      // PDFエクスポートのロジック
      // 注: 実際の実装では、jsPDFやpdfmakeなどのライブラリを使用
      alert('PDF機能は現在開発中です');
      
      // バックエンドAPIが実装されている場合:
      // const blob = await testService.exportHistory('pdf', {
      //   resultIds: Array.from(selectedResultIds || [])
      // });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `test_history_${new Date().toISOString().split('T')[0]}.pdf`;
      // a.click();
      // URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDFエクスポートエラー:', error);
      alert('PDFエクスポートに失敗しました');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    setExportType('image');
    
    try {
      if (!chartRef?.current) {
        alert('グラフが表示されていません');
        return;
      }

      // Chart.jsのcanvas要素を取得
      const canvas = chartRef.current.querySelector('canvas');
      if (!canvas) {
        alert('グラフが見つかりません');
        return;
      }

      // canvasを画像として保存
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `test_history_chart_${new Date().toISOString().split('T')[0]}.png`;
      a.click();
      
      console.log('グラフ画像を保存しました');
    } catch (error) {
      console.error('画像エクスポートエラー:', error);
      alert('画像エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // レポート生成用のヘルパー関数
  const generateReport = (resultsToExport: TestResultWithAnalysis[]) => {
    if (resultsToExport.length === 0) return '';

    const latestResult = resultsToExport[0];
    const oldestResult = resultsToExport[resultsToExport.length - 1];
    
    // 改善率の計算
    const latestTotal = latestResult.self_esteem_total + latestResult.courage + 
                       latestResult.resilience + latestResult.cooperation + 
                       latestResult.natural_acceptance + latestResult.non_rationality;
    const oldestTotal = oldestResult.self_esteem_total + oldestResult.courage + 
                       oldestResult.resilience + oldestResult.cooperation + 
                       oldestResult.natural_acceptance + oldestResult.non_rationality;
    const improvementRate = Math.round((latestTotal - oldestTotal) / oldestTotal * 100);

    return `
テスト履歴レポート
生成日: ${new Date().toLocaleDateString('ja-JP')}

期間: ${new Date(oldestResult.test_date).toLocaleDateString('ja-JP')} - ${new Date(latestResult.test_date).toLocaleDateString('ja-JP')}
テスト回数: ${resultsToExport.length}回

最新の結果:
- アスリートタイプ: ${latestResult.athlete_type}
- 総合スコア: ${latestTotal}
- 自己肯定感: ${latestResult.self_esteem_total}

期間中の改善:
- 総合改善率: ${improvementRate}%
- 最も改善した項目: ${getMaxImprovedCategory(oldestResult, latestResult)}
`;
  };

  const getMaxImprovedCategory = (oldest: TestResultWithAnalysis, latest: TestResultWithAnalysis): string => {
    const categories = [
      { name: '自己肯定感', old: oldest.self_esteem_total, new: latest.self_esteem_total },
      { name: '勇気', old: oldest.courage, new: latest.courage },
      { name: '復活力', old: oldest.resilience, new: latest.resilience },
      { name: '協調性', old: oldest.cooperation, new: latest.cooperation },
      { name: '自然体', old: oldest.natural_acceptance, new: latest.natural_acceptance },
      { name: '非合理性', old: oldest.non_rationality, new: latest.non_rationality }
    ];

    let maxImprovement = 0;
    let maxCategory = '';

    categories.forEach(cat => {
      const improvement = ((cat.new - cat.old) / cat.old) * 100;
      if (improvement > maxImprovement) {
        maxImprovement = improvement;
        maxCategory = cat.name;
      }
    });

    return `${maxCategory} (+${Math.round(maxImprovement)}%)`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExportCSV}
        disabled={isExporting || results.length === 0}
        className="inline-flex items-center"
      >
        {isExporting && exportType === 'csv' ? (
          <>
            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
            エクスポート中...
          </>
        ) : (
          <>
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            CSV
          </>
        )}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExporting || results.length === 0}
        className="inline-flex items-center"
      >
        {isExporting && exportType === 'pdf' ? (
          <>
            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <DocumentIcon className="w-4 h-4 mr-2" />
            PDFレポート
          </>
        )}
      </Button>

      {chartRef && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportImage}
          disabled={isExporting}
          className="inline-flex items-center"
        >
          {isExporting && exportType === 'image' ? (
            <>
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <PhotoIcon className="w-4 h-4 mr-2" />
              グラフを保存
            </>
          )}
        </Button>
      )}

      {selectedResultIds && selectedResultIds.size > 0 && (
        <span className="text-sm text-gray-600 self-center ml-2">
          {selectedResultIds.size}件選択中
        </span>
      )}
    </div>
  );
};

export default ExportOptions;