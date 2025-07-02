// src/services/testService.ts

import { TestResult, TestResultWithAnalysis } from '../types/test';
import { API_CONFIG, createApiUrl, getAuthenticatedRequestOptions } from '../config/api';

interface TestHistoryResponse {
  results: TestResultWithAnalysis[];
  total_count: number;
}

interface FetchHistoryParams {
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'score';
  filterPeriod?: 'all' | '1month' | '3months' | '6months';
}

class TestService {
  private static instance: TestService;
  
  private constructor() {}
  
  static getInstance(): TestService {
    if (!TestService.instance) {
      TestService.instance = new TestService();
    }
    return TestService.instance;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // 複数のキーからトークンを探す（auth-tokenを追加）
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('auth-token') || 
                  localStorage.getItem('access_token');
    
    console.log('TestService: トークン確認', token ? '存在' : '存在しない');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('TestService: Authorizationヘッダーを追加');
    } else {
      console.warn('TestService: トークンが見つかりません');
    }
    
    return headers;
  }

  async fetchTestHistory(params: FetchHistoryParams): Promise<TestHistoryResponse> {
    try {
      const queryParams = new URLSearchParams({
        limit: String(params.limit || 10),
        offset: String(params.offset || 0),
      });

      // バックエンドがサポートするパラメータを追加
      if (params.sortBy) {
        queryParams.append('sort_by', params.sortBy);
      }
      if (params.filterPeriod && params.filterPeriod !== 'all') {
        queryParams.append('filter_period', params.filterPeriod);
      }

      const url = createApiUrl(`${API_CONFIG.endpoints.getTestHistory}?${queryParams}`);
      console.log('TestService: リクエストURL', url);
      
      const headers = await this.getAuthHeaders();
      console.log('TestService: 送信するヘッダー', JSON.stringify(headers, null, 2));

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        credentials: 'include' // クッキーを含める
      });

      console.log('TestService: レスポンスステータス', response.status);
      console.log('TestService: レスポンスヘッダー', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TestService: エラーレスポンス', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching test history:', error);
      throw error;
    }
  }

  async getTestResult(resultId: string): Promise<TestResultWithAnalysis> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        createApiUrl(`${API_CONFIG.endpoints.getTestResult}/${resultId}`),
        {
          method: 'GET',
          headers: headers
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching test result:', error);
      throw error;
    }
  }

  async exportHistory(
    format: 'csv' | 'pdf',
    params: {
      filterPeriod?: string;
      resultIds?: string[];
    }
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({ format });
      
      if (params.filterPeriod) {
        queryParams.append('filter_period', params.filterPeriod);
      }
      
      if (params.resultIds && params.resultIds.length > 0) {
        queryParams.append('result_ids', params.resultIds.join(','));
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        createApiUrl(`${API_CONFIG.endpoints.exportHistory}?${queryParams}`),
        {
          method: 'GET',
          headers: headers
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting history:', error);
      throw error;
    }
  }

  // クライアントサイドでCSVエクスポートを実装
  exportToCSV(results: TestResultWithAnalysis[]): void {
    const headers = [
      'テスト日',
      'アスリートタイプ',
      '自己肯定感合計',
      '自己決定感',
      '自己受容感',
      '自己有用感',
      '自己効力感',
      '勇気',
      '復活力',
      '協調性',
      '自然体',
      '非合理性'
    ];

    const rows = results.map(result => [
      new Date(result.test_date).toLocaleDateString('ja-JP'),
      result.athlete_type,
      result.self_esteem_total,
      result.self_determination,
      result.self_acceptance,
      result.self_worth,
      result.self_efficacy,
      result.courage,
      result.resilience,
      result.cooperation,
      result.natural_acceptance,
      result.non_rationality
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `test_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // フロントエンドでのフィルタリング処理
  filterResults(
    results: TestResultWithAnalysis[],
    filters: {
      period?: 'all' | '1month' | '3months' | '6months';
      athleteTypes?: string[];
      scoreRange?: { min: number; max: number };
      showOnlyImproved?: boolean;
    }
  ): TestResultWithAnalysis[] {
    let filtered = [...results];

    // 期間フィルター
    if (filters.period && filters.period !== 'all') {
      const now = new Date();
      const periodMap = {
        '1month': 30,
        '3months': 90,
        '6months': 180
      };
      const days = periodMap[filters.period];
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(r => new Date(r.test_date) >= cutoffDate);
    }

    // アスリートタイプフィルター
    if (filters.athleteTypes && filters.athleteTypes.length > 0) {
      filtered = filtered.filter(r => filters.athleteTypes!.includes(r.athlete_type));
    }

    // スコア範囲フィルター
    if (filters.scoreRange) {
      filtered = filtered.filter(r => {
        const totalScore = r.self_esteem_total + r.courage + r.resilience + 
                          r.cooperation + r.natural_acceptance + r.non_rationality;
        return totalScore >= filters.scoreRange!.min && totalScore <= filters.scoreRange!.max;
      });
    }

    // 改善のみ表示フィルター
    if (filters.showOnlyImproved) {
      filtered = filtered.filter((r, index) => {
        if (index === filtered.length - 1) return false; // 最初の記録は除外
        const previous = filtered[index + 1];
        const currentTotal = r.self_esteem_total + r.courage + r.resilience + 
                           r.cooperation + r.natural_acceptance + r.non_rationality;
        const previousTotal = previous.self_esteem_total + previous.courage + previous.resilience + 
                            previous.cooperation + previous.natural_acceptance + previous.non_rationality;
        return currentTotal > previousTotal;
      });
    }

    return filtered;
  }
}

export const testService = TestService.getInstance();