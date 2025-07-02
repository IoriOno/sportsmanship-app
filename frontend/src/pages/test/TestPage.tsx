// frontend/src/pages/test/TestPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import SectionView from '../../components/test/SectionView';
import SectionNavigation from '../../components/test/SectionNavigation';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { useAuthStore } from '../../store/authStore';
import { User, UserRole } from '../../types/auth';
import { 
  submitTestResults, 
  validateAnswers, 
  saveTestProgress, 
  clearTestProgress 
} from '../../utils/testUtils';
import { v4 as uuidv4 } from 'uuid';  // UUID生成用


interface Question {
  question_id: string;
  question_number: number;
  question_text: string;
  category: string;
  subcategory: string;
  target: string;
  is_active: boolean;
}

const TestPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // useSectionProgressフックを使用
  const {
    answers,
    currentSection,
    currentCategory,
    allSections,
    categoryInfos,
    overallProgress,
    setAnswer,
    moveToNextSection,
    moveToPreviousSection,
    moveToSection,
    canMoveToNextSection,
    canMoveToPreviousSection
  } = useSectionProgress(questions);

  // 回答変更時の自動保存
  useEffect(() => {
    if (user?.role && Object.keys(answers).length > 0) {
      saveTestProgress(answers, user.role);
    }
  }, [answers, user?.role]);

  // ローカルストレージからユーザー情報を取得
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        
        // user_idが有効なUUID形式でない場合は修正
        if (!isValidUUID(userData.user_id)) {
          console.warn('無効なuser_idを検出:', userData.user_id);
          userData.user_id = uuidv4();  // 新しいUUIDを生成
          console.log('新しいuser_idを生成:', userData.user_id);
          
          // 修正したユーザー情報を保存
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        setUser(userData);
        console.log('ユーザー情報取得成功:', userData);
      } catch (err) {
        console.error('ユーザー情報の取得に失敗:', err);
        // サンプルユーザーデータを作成
        createSampleUser();
      }
    } else {
      // ローカルストレージにユーザー情報がない場合はサンプルユーザーを作成
      createSampleUser();
    }
  }, []);

  // UUID形式をチェックする関数
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // サンプルユーザーを作成する関数
  const createSampleUser = () => {
    const sampleUser: User = {
      user_id: uuidv4(),  // 有効なUUIDを生成
      name: '田中太郎',
      role: UserRole.PLAYER,
      email: 'tanaka@example.com',
      club_id: uuidv4(),  // club_idも有効なUUIDに
      parent_function: false,
      head_coach_function: false,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    
    setUser(sampleUser);
    // ローカルストレージにも保存
    localStorage.setItem('user', JSON.stringify(sampleUser));
    // 認証状態を更新
    login({
      user: sampleUser,
      access_token: 'sample-token',
      token_type: 'bearer'
    });
    console.log('サンプルユーザー作成:', sampleUser);
  };

  // ユーザーの対象に応じた質問をAPIから取得
  useEffect(() => {
    const loadQuestions = async () => {
      if (!user) {
        console.log('ユーザー情報がないため質問取得をスキップ');
        return;
      }

      try {
        setLoading(true);
        console.log('📥 Backend API から質問データ取得開始:', { user: user.name, role: user.role });
        
        // 修正：services/api.ts の fetchQuestions を使用
        const userTarget = user.role;
        const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/questions/for-user/${userTarget}`;
        console.log('API URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        let questionsData; // ← 先に宣言

        if (response.ok && data.questions) {
          console.log('質問データ取得成功:', {
            questionsCount: data.questions.length
          });
          questionsData = data.questions;
        } else {
          throw new Error(`API エラー: ${response.status} - ${data.message || 'Unknown error'}`);
        }        
        console.log('✅ Backend API から質問データ取得成功:', {
          questionsCount: questionsData.length,
          sampleQuestions: questionsData.slice(0, 3).map((q: any) => ({
            question_id: q.question_id,
            question_number: q.question_number,
            question_text: q.question_text.substring(0, 50) + '...',
            category: q.category,
            subcategory: q.subcategory
          }))
        });
        
        setQuestions(questionsData);
        setError(null);
        
      } catch (err: any) {
        console.error('❌ Backend API質問データ取得エラー:', err);
        setError(`質問の取得に失敗しました: ${err.message}`);
        
        // フォールバックとしてサンプルデータを使用
        console.log('🔄 フォールバックとしてサンプルデータを使用');
        const sampleQuestions: Question[] = Array.from({ length: 99 }, (_, i) => {
          const questionNumber = i + 1;
          
          // カテゴリーとサブカテゴリーを適切に割り当て
          let category = 'sportsmanship';
          let subcategory = 'courage';
          
          if (questionNumber <= 20) {
            category = 'sportsmanship';
            if (questionNumber <= 4) subcategory = 'courage';
            else if (questionNumber <= 8) subcategory = 'resilience';
            else if (questionNumber <= 12) subcategory = 'cooperation';
            else if (questionNumber <= 16) subcategory = 'natural_acceptance';
            else subcategory = 'non_rationality';
          } else if (questionNumber <= 60) {
            category = 'athlete_mind';
            // 10個のサブカテゴリーに4問ずつ
            const mindIndex = Math.floor((questionNumber - 21) / 4);
            const mindSubcategories = [
              'introspection', 'self_control', 'devotion', 'intuition', 'sensitivity',
              'steadiness', 'comparison', 'result', 'assertion', 'commitment'
            ];
            subcategory = mindSubcategories[mindIndex] || 'introspection';
          } else {
            category = 'self_esteem';
            if (questionNumber <= 74) subcategory = 'self_determination';
            else if (questionNumber <= 84) subcategory = 'self_acceptance';
            else if (questionNumber <= 94) subcategory = 'self_worth';
            else subcategory = 'self_efficacy';
          }
          
          return {
            question_id: uuidv4(),  // 有効なUUIDを生成
            question_number: questionNumber,
            question_text: `フォールバック質問${questionNumber}: これはサンプル質問です。`,
            category: category,
            subcategory: subcategory,
            target: user.role,
            is_active: true
          };
        });
        setQuestions(sampleQuestions);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user]);

  // ユーザーの役割を日本語に変換
  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'player': '選手',
      'father': '父親',
      'mother': '母親',
      'coach': 'コーチ',
      'adult': '一般成人'
    };
    return roleLabels[role] || role;
  };

  // テスト提出処理
  const handleSubmit = async () => {
    // エラー状態をクリア
    setSubmitError(null);
    setValidationErrors([]);

    // 全体の完了チェック
    if (!overallProgress.isCompleted) {
      setSubmitError('すべての質問に回答してください。');
      return;
    }

    // 詳細なバリデーション
    const validation = validateAnswers(answers, questions);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSubmitError('回答データに問題があります。詳細をご確認ください。');
      return;
    }

    if (!user) {
      setSubmitError('ユーザー情報が見つかりません。再度ログインしてください。');
      return;
    }

    // user_idの最終チェック
    if (!isValidUUID(user.user_id)) {
      console.error('無効なuser_id:', user.user_id);
      setSubmitError('ユーザーIDが無効です。ページを再読み込みしてください。');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('テスト提出開始:', {
        user: user.name,
        user_id: user.user_id,
        role: user.role,
        totalQuestions: overallProgress.totalQuestions,
        answeredQuestions: overallProgress.answeredQuestions,
        totalSections: overallProgress.totalSections,
        completedSections: overallProgress.completedSections
      });

      // バックエンドAPIにテスト結果を送信
      const result = await submitTestResults(answers, questions, user.user_id);
      
      console.log('テスト提出成功:', result);

      // 成功時は進捗データをクリア
      clearTestProgress();

      // 結果ページに遷移（result_idを使用）
      navigate(`/test/result/${result.result_id}`, {
        state: { 
          testResult: result,
          isNewResult: true 
        }
      });

    } catch (error: any) {
      console.error('テスト提出エラー:', error);
      setSubmitError(error.message || 'テストの提出に失敗しました。もう一度お試しください。');
      
      // ネットワークエラーの場合は進捗を保持
      if (user?.role) {
        saveTestProgress(answers, user.role);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">テストを準備中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            再試行
          </Button>
        </div>
      </div>
    );
  }

  // メインコンテンツ
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ナビゲーション */}
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          ダッシュボードに戻る
        </Button>
      </div>

      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          スポーツマンシップテスト
        </h1>
        <p className="text-gray-600">
          あなたの役割: <span className="font-semibold">{user ? getRoleLabel(user.role) : ''}</span>
        </p>
      </div>

      {/* セクションナビゲーション */}
      <div className="mb-8">
        <SectionNavigation
          currentSection={currentSection}
          currentCategory={currentCategory}
          allSections={allSections}
          categoryInfos={categoryInfos}
          overallProgress={overallProgress}
          onMoveToNextSection={moveToNextSection}
          onMoveToPreviousSection={moveToPreviousSection}
          onMoveToSection={moveToSection}
          canMoveToNextSection={canMoveToNextSection}
          canMoveToPreviousSection={canMoveToPreviousSection}
          onSubmitTest={handleSubmit}
        />
      </div>

      {/* セクション表示 */}
      {currentSection && (
        <div className="mb-8">
          <SectionView
            section={currentSection}
            answers={answers}
            onAnswerChange={setAnswer}
          />
        </div>
      )}

      {/* エラー表示 */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">
                エラーが発生しました
              </h3>
              <p className="text-sm text-red-700">{submitError}</p>
              {validationErrors.length > 0 && (
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 提出ボタン（最終セクション完了時） */}
      {overallProgress.isCompleted && (
        <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            全セクション完了！
          </h3>
          <p className="text-green-700 mb-4">
            {overallProgress.totalSections}個のセクション、{overallProgress.totalQuestions}問すべてに回答いただきました。
            テストを提出して結果を確認しましょう。
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? '提出中...' : 'テスト結果を提出'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TestPage;