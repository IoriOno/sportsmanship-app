// frontend/src/services/comparisonService.ts

import { API_CONFIG, createApiUrl, getAuthenticatedRequestOptions } from '../config/api';

export interface ClubUser {
  user_id: string;
  name: string;
  email: string;
  role: string;
  latest_test_date?: string | null;
  has_test_result: boolean;
}

export interface ComparisonRequest {
  participant_ids: string[];
}

export interface ComparisonData {
  participant_id: string;
  participant_name: string;
  participant_role: string;
  qualities: {
    // 自己肯定感
    self_determination: number;
    self_acceptance: number;
    self_worth: number;
    self_efficacy: number;
    // アスリートマインド
    introspection: number;
    self_control: number;
    devotion: number;
    intuition: number;
    sensitivity: number;
    steadiness: number;
    comparison: number;
    result: number;
    assertion: number;
    commitment: number;
    // スポーツマンシップ
    courage: number;
    resilience: number;
    cooperation: number;
    natural_acceptance: number;
    non_rationality: number;
  };
}

export interface ComparisonDifference {
  quality: string;
  difference: number;
  participant1_value: number;
  participant2_value: number;
}

export interface ComparisonResult {
  comparison_id: string;
  participants: ComparisonData[];
  differences: ComparisonDifference[];
  mutual_understanding: string;
  good_interactions: string[];
  bad_interactions: string[];
  created_by: string;
  created_date: string;
}

export interface ComparisonHistory {
  comparisons: ComparisonResult[];
  total_count: number;
}

class ComparisonService {
  /**
   * クラブユーザー一覧を取得
   */
  async getClubUsers(): Promise<ClubUser[]> {
    try {
      const requestOptions = await getAuthenticatedRequestOptions();
      const response = await fetch(createApiUrl('/api/v1/coach/players'), {
        method: 'GET',
        headers: requestOptions.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching club users:', error);
      // エラーの場合はサンプルデータを返す
      return this.getSampleClubUsers();
    }
  }

  /**
   * ヘッドコーチ用の選手一覧を取得
   */
  async getCoachPlayers(): Promise<ClubUser[]> {
    try {
      const requestOptions = await getAuthenticatedRequestOptions();
      const response = await fetch(createApiUrl('/api/v1/coach/players-for-comparison'), {
        method: 'GET',
        headers: requestOptions.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching coach players:', error);
      // エラーの場合はサンプルデータを返す
      return this.getSampleClubUsers();
    }
  }

  /**
   * ヘッド親用の家族メンバー一覧を取得
   */
  async getFamilyMembers(): Promise<ClubUser[]> {
    try {
      const requestOptions = await getAuthenticatedRequestOptions();
      const response = await fetch(createApiUrl('/api/v1/family/members-for-comparison'), {
        method: 'GET',
        headers: requestOptions.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching family members:', error);
      // エラーの場合はサンプルデータを返す
      return this.getSampleFamilyMembers();
    }
  }

  /**
   * サンプルのクラブユーザーデータ
   */
  private getSampleClubUsers(): ClubUser[] {
    return [
      {
        user_id: 'player-1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        role: 'player',
        latest_test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        has_test_result: true
      },
      {
        user_id: 'player-2',
        name: '佐藤花子',
        email: 'sato@example.com',
        role: 'player',
        latest_test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        has_test_result: true
      },
      {
        user_id: 'player-3',
        name: '山田次郎',
        email: 'yamada@example.com',
        role: 'player',
        latest_test_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        has_test_result: true
      },
      {
        user_id: 'player-4',
        name: '鈴木美咲',
        email: 'suzuki@example.com',
        role: 'player',
        latest_test_date: null,
        has_test_result: false
      },
      {
        user_id: 'player-5',
        name: '高橋健太',
        email: 'takahashi@example.com',
        role: 'player',
        latest_test_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        has_test_result: true
      }
    ];
  }

  /**
   * サンプルの家族メンバーデータ
   */
  private getSampleFamilyMembers(): ClubUser[] {
    return [
      {
        user_id: 'family-1',
        name: '父親',
        email: 'father@example.com',
        role: 'family',
        latest_test_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        has_test_result: true
      },
      {
        user_id: 'family-2',
        name: '母親',
        email: 'mother@example.com',
        role: 'family',
        latest_test_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        has_test_result: true
      },
      {
        user_id: 'family-3',
        name: '兄弟',
        email: 'brother@example.com',
        role: 'family',
        latest_test_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        has_test_result: true
      },
      {
        user_id: 'family-4',
        name: '姉妹',
        email: 'sister@example.com',
        role: 'family',
        latest_test_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        has_test_result: true
      }
    ];
  }

  /**
   * 比較を作成
   */
  async createComparison(participantIds: string[]): Promise<ComparisonResult> {
    try {
      const url = createApiUrl('/api/v1/comparisons/create');
      const response = await fetch(url, {
        ...getAuthenticatedRequestOptions(),
        method: 'POST',
        body: JSON.stringify({
          participant_ids: participantIds
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to create comparison: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating comparison:', error);
      throw error;
    }
  }

  /**
   * サンプルの比較結果を生成
   */
  private generateSampleComparison(participantIds: string[]): ComparisonResult {
    const participants: ComparisonData[] = participantIds.map((id, index) => {
      const isCurrentUser = index === 0;
      const baseScore = isCurrentUser ? 35 : 30;
      
      return {
        participant_id: id,
        participant_name: isCurrentUser ? 'あなた' : `選手${index}`,
        participant_role: isCurrentUser ? 'coach' : 'player',
        qualities: {
          // 自己肯定感
          self_determination: baseScore + Math.floor(Math.random() * 15),
          self_acceptance: baseScore + Math.floor(Math.random() * 15),
          self_worth: baseScore + Math.floor(Math.random() * 15),
          self_efficacy: baseScore + Math.floor(Math.random() * 15),
          // アスリートマインド
          introspection: baseScore + Math.floor(Math.random() * 15),
          self_control: baseScore + Math.floor(Math.random() * 15),
          devotion: baseScore + Math.floor(Math.random() * 15),
          intuition: baseScore + Math.floor(Math.random() * 15),
          sensitivity: baseScore + Math.floor(Math.random() * 15),
          steadiness: baseScore + Math.floor(Math.random() * 15),
          comparison: baseScore + Math.floor(Math.random() * 15),
          result: baseScore + Math.floor(Math.random() * 15),
          assertion: baseScore + Math.floor(Math.random() * 15),
          commitment: baseScore + Math.floor(Math.random() * 15),
          // スポーツマンシップ
          courage: baseScore + Math.floor(Math.random() * 15),
          resilience: baseScore + Math.floor(Math.random() * 15),
          cooperation: baseScore + Math.floor(Math.random() * 15),
          natural_acceptance: baseScore + Math.floor(Math.random() * 15),
          non_rationality: baseScore + Math.floor(Math.random() * 15)
        }
      };
    });

    // 差分を計算
    const differences: ComparisonDifference[] = [];
    if (participants.length >= 2) {
      const qualities = Object.keys(participants[0].qualities) as Array<keyof typeof participants[0]['qualities']>;
      qualities.forEach(quality => {
        differences.push({
          quality: this.getQualityLabel(quality),
          difference: participants[0].qualities[quality] - participants[1].qualities[quality],
          participant1_value: participants[0].qualities[quality],
          participant2_value: participants[1].qualities[quality]
        });
      });
    }

    return {
      comparison_id: `comp-${Date.now()}`,
      participants,
      differences,
      mutual_understanding: '参加者間の資質の違いを分析した結果、以下の特徴が見られました。\n\nコーチ/保護者と選手の間で、特に「直感」「献身」「結果志向」に大きな差が見られます。これらの違いを理解し、お互いの強みを活かすコミュニケーションが重要です。',
      good_interactions: [
        '定期的な1on1ミーティングで相互理解を深める',
        'お互いの強みを認め合い、積極的に褒める',
        '明確な目標設定とフィードバックを行う',
        'それぞれの特性を活かした役割分担をする',
        '継続的なコミュニケーションを心がける'
      ],
      bad_interactions: [
        '一方的な指示や批判を避ける',
        '相手の弱みを否定的に指摘しない',
        '価値観の違いを「間違い」として扱わない',
        '感情的な反応を控える',
        '過度な期待や圧力をかけない'
      ],
      created_by: participantIds[0],
      created_date: new Date().toISOString()
    };
  }

  /**
   * 質問項目のラベルを取得
   */
  private getQualityLabel(key: string): string {
    const labels: Record<string, string> = {
      // 自己肯定感
      self_determination: '自己決定感',
      self_acceptance: '自己受容感',
      self_worth: '自己有用感',
      self_efficacy: '自己効力感',
      // アスリートマインド
      introspection: '内省',
      self_control: '克己',
      devotion: '献身',
      intuition: '直感',
      sensitivity: '繊細',
      steadiness: '堅実',
      comparison: '比較',
      result: '結果',
      assertion: '主張',
      commitment: 'こだわり',
      // スポーツマンシップ
      courage: '勇気',
      resilience: '打たれ強さ',
      cooperation: '協調性',
      natural_acceptance: '自然体',
      non_rationality: '非合理性'
    };
    return labels[key] || key;
  }

  /**
   * 比較履歴を取得
   */
  async getComparisonHistory(limit: number = 10, offset: number = 0): Promise<ComparisonHistory> {
    try {
      const url = createApiUrl(
        `/api/v1/comparisons/history?limit=${limit}&offset=${offset}`
      );
      const response = await fetch(url, {
        ...getAuthenticatedRequestOptions(),
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comparison history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching comparison history:', error);
      // エラー時は空の履歴を返す
      return {
        comparisons: [],
        total_count: 0
      };
    }
  }
}

export const comparisonService = new ComparisonService();