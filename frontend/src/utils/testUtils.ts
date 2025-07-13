// frontend/src/utils/testUtils.ts
import { API_CONFIG, createApiUrl, getDefaultRequestOptions } from '../config/api';

// テスト回答の型定義
export interface TestAnswer {
  question_id: string;  // UUIDなので文字列型に変更
  answer_value: number;
}

export interface TestSubmitData {
  user_id: string;
  test_date: string;
  answers: TestAnswer[];
}

export interface TestResultResponse {
  result_id: string;
  user_id: string;
  test_date: string;
  // 自己肯定感関連
  self_determination: number;
  self_acceptance: number;
  self_worth: number;
  self_efficacy: number;
  // アスリートマインド
  commitment: number;        // こだわり（旧: thoroughness）
  result: number;            // 結果（旧: result_focus）
  steadiness: number;        // 堅実
  devotion: number;          // 献身（旧: dedication）
  self_control: number;      // 克己
  assertion: number;         // 主張
  sensitivity: number;       // 繊細
  intuition: number;         // 直感
  introspection: number;     // 内省
  comparison: number;        // 比較
  // スポーツマンシップ
  courage: number;
  resilience: number;
  cooperation: number;
  natural_acceptance: number;
  non_rationality: number;
  // 分析結果
  self_esteem_total: number;
  self_esteem_analysis: string;
  self_esteem_improvements: string[];
  athlete_type: string;
  athlete_type_description: string;
  athlete_type_percentages: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  sportsmanship_balance: string;
}

// 質問の型定義
interface Question {
  question_id: string;
  question_number: number;
  question_text: string;
  category: string;
  subcategory: string;
  target: string;
  is_active: boolean;
}

// API エラー型定義
interface APIError {
  response?: {
    status?: number;
    statusText?: string;
    data?: {
      detail?: string | ValidationError[];
    };
  };
  message?: string;
}

// バリデーションエラー型定義
interface ValidationError {
  loc?: string[];
  msg?: string;
  message?: string;
  type?: string;
}

/**
 * フロントエンドの回答形式をバックエンドの期待する形式に変換
 * @param answers - フロントエンドの回答データ Record<question_id, answer_value>（修正：question_idをキーとする）
 * @param questions - 質問データの配列
 * @returns バックエンドAPI用の回答データ（answersのみ）
 */
export const convertAnswersForAPI = (
  answers: Record<string, number>,  // 修正：number から string に変更（question_idはstring）
  questions: Question[]
): { answers: TestAnswer[] } => {
  console.log('🔄 convertAnswersForAPI 開始:', {
    answersCount: Object.keys(answers).length,
    questionsCount: questions.length,
    sampleAnswers: Object.entries(answers).slice(0, 3),
    sampleQuestions: questions.slice(0, 3).map(q => ({
      question_id: q.question_id,
      question_number: q.question_number,
      question_text: q.question_text.substring(0, 50) + '...'
    }))
  });

  // 回答データを変換（question_idをそのまま使用）
  const apiAnswers: TestAnswer[] = Object.entries(answers).map(([questionId, answerValue]) => {
    // questionIdが有効かチェック
    const question = questions.find(q => q.question_id === questionId);
    
    if (!question) {
      console.error(`Question not found for question ID: ${questionId}`, {
        questionId,
        availableQuestionIds: questions.slice(0, 10).map(q => q.question_id),
        totalQuestions: questions.length
      });
      throw new Error(`Question not found for question ID: ${questionId}`);
    }

    return {
      question_id: questionId,
      answer_value: answerValue
    };
  });

  console.log('回答データ変換完了:', {
    convertedCount: apiAnswers.length,
    sampleConvertedData: apiAnswers.slice(0, 3)
  });

  // 回答数のバリデーション（ユーザーの役割に応じた質問数）
  const activeQuestions = questions.filter(q => q.is_active);
  if (apiAnswers.length !== activeQuestions.length) {
    console.error('回答数バリデーションエラー:', {
      expected: activeQuestions.length,
      actual: apiAnswers.length,
      answersKeys: Object.keys(answers).slice(0, 10),
      questionsCount: questions.length,
      activeQuestionsCount: activeQuestions.length
    });
    throw new Error(`Expected ${activeQuestions.length} answers, but got ${apiAnswers.length}`);
  }

  console.log('convertAnswersForAPI 完了:', {
    finalAnswersCount: apiAnswers.length,
    isValid: apiAnswers.length === activeQuestions.length
  });

  return {
    answers: apiAnswers
  };
};

/**
 * テスト結果をバックエンドAPIに送信
 * @param answers - フロントエンドの回答データ（question_idをキー）
 * @param questions - 質問データの配列
 * @returns テスト結果のレスポンス
 */
export const submitTestResults = async (
  answers: Record<string, number>,
  questions: Question[],
  userId: string
): Promise<TestResultResponse> => {
  let submitData: TestSubmitData | null = null;
  
  try {
    console.log('🚀 submitTestResults 開始');
    
    // 回答データを変換
    const convertedData = convertAnswersForAPI(answers, questions);
    
    // 送信データを作成（user_idとtest_dateを追加）
    submitData = {
      user_id: userId,
      test_date: new Date().toISOString(),
      answers: convertedData.answers.map(ans => ({
        ...ans,
        answer_value: Math.round(ans.answer_value)
      }))
    };
    
    console.log('📤 API送信データ:', {
      url: '/api/v1/tests/submit',
      method: 'POST',
      dataPreview: {
        user_id: submitData.user_id,
        test_date: submitData.test_date,
        answersCount: submitData.answers.length,
        sampleAnswers: submitData.answers.slice(0, 3)
      }
    });
    
    // APIに送信
    const url = createApiUrl(API_CONFIG.endpoints.submitTest);
    console.log('🌐 Making API request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getDefaultRequestOptions().headers,
      body: JSON.stringify(submitData),
    });
    
    // レスポンスの詳細ログ
    console.log('📨 API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData;
      
      try {
        errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        
        // エラーメッセージの詳細を構築
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // バリデーションエラーの配列
            const errors = errorData.detail.map((err: any) => {
              const field = err.loc?.join('.') || 'unknown field';
              const message = err.msg || err.message || 'validation error';
              return `${field}: ${message}`;
            });
            errorMessage = `データ検証エラー:\n${errors.join('\n')}`;
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
        // JSONパースに失敗した場合はテキストとして取得
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `HTTP ${response.status}: ${errorText}`;
          }
        } catch (textError) {
          console.error('Error getting error text:', textError);
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();

    console.log('✅ API送信成功:', {
      resultId: result.result_id,
      testDate: result.test_date,
      athleteType: result.athlete_type
    });

    return result;
  } catch (error: any) {
    // エラーの詳細をログ出力
    console.error('❌ Test submission error:', {
      error: error,
      errorMessage: error.message,
      errorStack: error.stack,
      submitDataPreview: submitData ? {
        user_id: submitData.user_id,
        answersCount: submitData.answers.length,
        sampleAnswers: submitData.answers.slice(0, 3)
      } : 'submitData not available'
    });
    
    // モバイル用のより分かりやすいエラーメッセージ
    if (error.message.includes('fetch')) {
      throw new Error('ネットワークエラー: インターネット接続を確認してください');
    }
    
    throw new Error(`テスト送信エラー: ${error.message}`);
  }
};

/**
 * 回答データの整合性をチェック
 * @param answers - フロントエンドの回答データ（question_idをキー）
 * @param questions - 質問データの配列
 * @returns 整合性チェックの結果
 */
export const validateAnswers = (
  answers: Record<string, number>,  // 修正：number から string に変更
  questions: Question[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // アクティブな質問のみを対象にする
  const activeQuestions = questions.filter(q => q.is_active);
  
  // 回答数チェック
  const answerCount = Object.keys(answers).length;
  if (answerCount !== activeQuestions.length) {
    errors.push(`回答数が不正です。期待値: ${activeQuestions.length}問, 実際: ${answerCount}問`);
  }
  
  // 全質問への回答チェック
  activeQuestions.forEach(question => {
    if (!answers[question.question_id]) {
      errors.push(`問${question.question_number}への回答がありません`);
    }
  });
  
  // 回答値の範囲チェック
  Object.entries(answers).forEach(([questionId, answerValue]) => {
    const question = questions.find(q => q.question_id === questionId);
    if (question && (answerValue < 0 || answerValue > 10)) {
      errors.push(`問${question.question_number}の回答値が範囲外です (値: ${answerValue})`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * テスト進捗の保存（ローカルストレージ）- 役割別に保存
 * @param answers - 回答データ（question_idをキー）
 * @param userRole - ユーザーの役割
 */
export const saveTestProgress = (answers: Record<string, number>, userRole: string): void => {
  try {
    const key = `test_progress_${userRole}`;
    const progressData = {
      answers,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(progressData));
    console.log(`進捗を保存しました: ${key}`, {
      answersCount: Object.keys(answers).length
    });
  } catch (error) {
    console.warn('Failed to save test progress:', error);
  }
};

/**
 * テスト進捗の読み込み（ローカルストレージ）- 役割別に読み込み
 * @param userRole - ユーザーの役割
 * @returns 保存された回答データ
 */
export const loadTestProgress = (userRole: string): Record<string, number> | null => {
  try {
    const key = `test_progress_${userRole}`;
    const savedData = localStorage.getItem(key);
    if (!savedData) return null;
    
    const progressData = JSON.parse(savedData);
    console.log(`進捗を読み込みました: ${key}`, {
      answersCount: Object.keys(progressData.answers).length,
      timestamp: progressData.timestamp
    });
    
    return progressData.answers;
  } catch (error) {
    console.warn('Failed to load test progress:', error);
    return null;
  }
};

/**
 * テスト進捗をクリア
 * @param userRole - 特定の役割の進捗のみクリア（省略時は全クリア）
 */
export const clearTestProgress = (userRole?: string): void => {
  try {
    if (userRole) {
      // 特定の役割の進捗のみクリア
      const key = `test_progress_${userRole}`;
      localStorage.removeItem(key);
      console.log(`進捗をクリアしました: ${key}`);
    } else {
      // すべての役割の進捗をクリア
      const roles = ['player', 'coach', 'mother', 'father', 'adult'];
      roles.forEach(role => {
        const key = `test_progress_${role}`;
        localStorage.removeItem(key);
      });
      console.log('すべての進捗をクリアしました');
    }
  } catch (error) {
    console.warn('Failed to clear test progress:', error);
  }
};