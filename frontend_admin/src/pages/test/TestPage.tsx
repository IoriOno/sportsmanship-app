// ファイル: frontend/src/pages/test/TestPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

interface Question {
  question_id: string;
  question_number: number;
  question_text: string;
  category: string;
  section: string;
  target: string;
  is_active: boolean;
}

interface User {
  user_id: string;
  name: string;
  role: string;
  email: string;
}

const TestPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // ローカルストレージからユーザー情報を取得
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (err) {
        console.error('ユーザー情報の取得に失敗:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // ユーザーの対象に応じた質問をAPIから取得
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) return;

      try {
        // ユーザーの role を target に変換
        const userTarget = user.role;
        
        // ユーザー対象に応じた質問を取得
        const url = `${process.env.REACT_APP_API_URL}/api/v1/questions/for-user/${userTarget}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          setQuestions(data.questions);
          setError(null);
        } else {
          setError('質問の取得に失敗しました');
        }
      } catch (err) {
        setError('ネットワークエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user]);

  const handleAnswerSelect = (value: number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit test
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // TODO: Submit test to backend
    console.log('Submitting test:', answers);
    console.log('User:', user);
    console.log('Questions answered:', questions.length);
    navigate('/test/result/latest');
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  // ユーザー情報の役割を日本語に変換
  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'player': '選手',
      'father': '父親',
      'mother': '母親',
      'coach': 'コーチ'
    };
    return roleLabels[role] || role;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 text-center">
          <div className="text-lg">質問を読み込み中...</div>
          {user && (
            <div className="text-sm text-gray-500 mt-2">
              {getRoleLabel(user.role)}向けの質問を準備しています
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 text-center">
          <div className="text-red-600 text-lg">{error}</div>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            再試行
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 text-center">
          <div className="text-lg">
            {user ? `${getRoleLabel(user.role)}向けの` : ''}質問がまだ登録されていません
          </div>
          <p className="text-gray-500 mt-2">
            管理者にお問い合わせください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            メンタルヘルステスト
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              以下の質問に0〜10の11段階で回答してください。
            </p>
            {user && (
              <div className="text-sm">
                <span className="text-gray-500">対象: </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getRoleLabel(user.role)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>進捗状況</span>
            <span>{currentQuestion + 1} / {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-500">
              {questions[currentQuestion]?.section}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {questions[currentQuestion]?.category}
            </span>
            {questions[currentQuestion]?.target !== 'all' && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  {getRoleLabel(questions[currentQuestion]?.target)}向け
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-6">
            {questions[currentQuestion]?.question_text}
          </h2>

          {/* Answer Scale */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex justify-between w-full text-sm text-gray-500">
              <span>そう思わない</span>
              <span>そう思う</span>
            </div>
            
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswerSelect(value)}
                  className={`w-12 h-12 rounded-full border-2 transition-colors ${
                    answers[currentQuestion] === value
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : value <= 5
                      ? 'border-blue-300 hover:bg-blue-50'
                      : 'border-red-300 hover:bg-red-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between w-full text-xs text-gray-400">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <span key={value} className="w-12 text-center">{value}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            前の質問
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
          >
            {currentQuestion === questions.length - 1 ? 'テスト完了' : '次の質問'}
          </Button>
        </div>

        {/* Debug Info (開発用) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Debug Info:</strong><br />
            User Role: {user?.role}<br />
            Current Question Target: {questions[currentQuestion]?.target}<br />
            Total Questions: {questions.length}<br />
            Question ID: {questions[currentQuestion]?.question_id}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;