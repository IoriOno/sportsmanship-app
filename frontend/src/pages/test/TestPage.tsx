// frontend/src/pages/test/TestPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { v4 as uuidv4 } from 'uuid';

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
  const [isDataReady, setIsDataReady] = useState(false);

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

  // 回答変更ハンドラー（question_idベース）
  const handleAnswerChange = useCallback((questionId: string, value: number) => {
    setAnswer(questionId, value);
  }, [setAnswer]);

  // UUID形式をチェックする関数
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // サンプルユーザーを作成する関数
  const createSampleUser = useCallback(() => {
    const existingUserStr = localStorage.getItem('user');
    if (existingUserStr) {
      try {
        const existingUser = JSON.parse(existingUserStr);
        if (existingUser.user_id && isValidUUID(existingUser.user_id)) {
          setUser(existingUser);
          return;
        }
      } catch (e) {
        console.error('既存ユーザー情報の読み込みエラー:', e);
      }
    }

    const sampleUser: User = {
      user_id: uuidv4(),
      name: '田中太郎',
      role: UserRole.PLAYER,
      email: 'tanaka@example.com',
      club_id: 'sample-club',
      parent_function: false,
      head_coach_function: false,
      head_parent_function: false,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    
    setUser(sampleUser);
    localStorage.setItem('user', JSON.stringify(sampleUser));
    login({
      user: sampleUser,
      access_token: 'sample-token',
      token_type: 'bearer'
    });
    console.log('サンプルユーザー作成:', sampleUser);
  }, [login]);

  // ユーザー情報の初期化
  useEffect(() => {
    const initUser = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          
          if (!isValidUUID(userData.user_id)) {
            console.warn('無効なuser_idを検出:', userData.user_id);
            createSampleUser();
          } else {
            setUser(userData);
            console.log('ユーザー情報取得成功:', userData);
          }
        } catch (err) {
          console.error('ユーザー情報の取得に失敗:', err);
          createSampleUser();
        }
      } else {
        createSampleUser();
      }
    };

    initUser();
  }, [createSampleUser]);

  // 質問データの取得
  useEffect(() => {
    const loadQuestions = async () => {
      if (!user) {
        console.log('ユーザー情報がないため質問取得をスキップ');
        return;
      }

      try {
        setLoading(true);
        setIsDataReady(false);
        console.log('📥 Backend API から質問データ取得開始:', { user: user.name, role: user.role });
        
        const userTarget = user.role;
        const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/questions/for-user/${userTarget}`;
        console.log('API URL:', url);

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.questions) {
          console.log('質問データ取得成功:', {
            questionsCount: data.questions.length,
            sampleQuestions: data.questions.slice(0, 5).map((q: Question) => ({
              question_number: q.question_number,
              category: q.category,
              subcategory: q.subcategory,
              target: q.target
            }))
          });
          
          // バックエンドから正しいデータが来ているはずなので、そのまま使用
          setQuestions(data.questions);
          setError(null);
          setIsDataReady(true);
        } else {
          throw new Error(`API エラー: ${response.status} - ${data.message || 'Unknown error'}`);
        }
      } catch (err: any) {
        console.error('❌ Backend API質問データ取得エラー:', err);
        setError(`質問の取得に失敗しました: ${err.message}`);
        
        // エラー時はフォールバックデータを使用しない（データの整合性を保つため）
        setQuestions([]);
        setIsDataReady(false);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user]);

  // 回答の自動保存（データ準備完了後のみ）
  useEffect(() => {
    if (isDataReady && user?.role && Object.keys(answers).length > 0) {
      const timeoutId = setTimeout(() => {
        saveTestProgress(answers, user.role);
        console.log('進捗を保存しました');
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [answers, user?.role, isDataReady]);

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

  // デバッグ用：現在の進捗状況をログ出力
  useEffect(() => {
    if (overallProgress && currentSection) {
      console.log('進捗状況:', {
        currentSection: currentSection.title,
        currentCategory: currentCategory,
        totalSections: overallProgress.totalSections,
        completedSections: overallProgress.completedSections,
        totalQuestions: overallProgress.totalQuestions,
        answeredQuestions: overallProgress.answeredQuestions,
        isCompleted: overallProgress.isCompleted,
        sectionProgress: allSections.map(s => ({
          title: s.title,
          answered: s.answeredQuestions,
          total: s.totalQuestions
        }))
      });
    }
  }, [overallProgress, currentSection, currentCategory, allSections]);

  // デバッグ用：カテゴリ情報の詳細ログ
  useEffect(() => {
    if (categoryInfos && categoryInfos.length > 0) {
      console.log('カテゴリ情報詳細:', {
        categoryInfos: categoryInfos.map(cat => ({
          category: cat.category,
          title: cat.title,
          totalSections: cat.totalSections,
          totalQuestions: cat.totalQuestions,
          answeredQuestions: cat.answeredQuestions,
          isCompleted: cat.isCompleted
        })),
        allSectionsCount: allSections.length,
        questionsCount: questions.length
      });
    }
  }, [categoryInfos, allSections, questions]);

  // テスト提出処理
  const handleSubmit = async () => {
    setSubmitError(null);
    setValidationErrors([]);

    if (!isDataReady) {
      setSubmitError('データの準備が完了していません。しばらくお待ちください。');
      return;
    }

    if (!overallProgress.isCompleted) {
      // 未回答の質問を特定
      const unansweredQuestions = questions.filter(q => !answers[q.question_id]);
      console.error('未回答の質問:', unansweredQuestions);
      
      setSubmitError(`すべての質問に回答してください。未回答: ${unansweredQuestions.length}問`);
      return;
    }

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
        answersCount: Object.keys(answers).length
      });

      // 送信前に全ての回答値を整数化
      const roundedAnswers = Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, Math.round(v)])
      );

      const result = await submitTestResults(roundedAnswers, questions, user.user_id);
      
      console.log('テスト提出成功:', result);

      clearTestProgress();

      navigate(`/test/result/${result.result_id}`, {
        state: { 
          testResult: result,
          isNewResult: true 
        }
      });

    } catch (error: any) {
      console.error('テスト提出エラー:', error);
      setSubmitError(error.message || 'テストの提出に失敗しました。もう一度お試しください。');
      
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
  if (error && questions.length === 0) {
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

  // currentSectionがundefinedの場合の処理
  if (!currentSection) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">セクションを読み込んでいます...</p>
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
      <div className="mb-8">
        <SectionView
          section={currentSection}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
      </div>

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