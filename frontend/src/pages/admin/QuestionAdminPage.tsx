// ファイル: frontend/src/pages/admin/QuestionAdminPage.tsx

import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';

interface Question {
  question_id: string;
  question_number: number;
  question_text: string;
  category: string;
  section: string;
  target: string;
  is_active: boolean;
  created_date: string;
  updated_date?: string;
}

// 対象の定義
const TARGETS = {
  'all': '全対象共通',
  'player': '選手',
  'father': '父親',
  'mother': '母親',
  'coach': 'コーチ'
};

// セクションとカテゴリの定義
const SECTIONS = {
  '自己肯定感': ['自己決定感', '自己受容感', '自己有用感', '自己効力感'],
  'アスリートマインド': ['内省', '克己', '献身', '直感', '繊細', '堅実', '比較', '結果', '主張', 'こだわり・丁寧'],
  'スポーツマンシップ': ['勇気', '打たれ強さ', '他者性・協調性', '自己受容・自然体', '非合理性・非論理性']
};

const QuestionAdminPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question_number: 0,
    question_text: '',
    category: '',
    section: '',
    target: 'all',
    is_active: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterTarget, setFilterTarget] = useState<string>(''); // フィルター用
  const [filterSection, setFilterSection] = useState<string>(''); // セクションフィルター追加
  const [sortBy, setSortBy] = useState<'number' | 'created'>('number'); // ソート順追加

  // 次の質問番号を自動取得
  const getNextQuestionNumber = () => {
    if (questions.length === 0) return 1;
    const maxNumber = Math.max(...questions.map(q => q.question_number));
    return maxNumber + 1;
  };

  // 新規追加フォームを表示する際に質問番号を自動設定
  const handleShowAddForm = () => {
    const nextNumber = getNextQuestionNumber();
    setNewQuestion({
      question_number: nextNumber,
      question_text: '',
      category: '',
      section: '',
      target: 'all',
      is_active: true
    });
    setShowAddForm(true);
  };

  // セクション変更時にカテゴリをリセット
  const handleSectionChange = (section: string, isNewQuestion: boolean = true) => {
    if (isNewQuestion) {
      setNewQuestion({
        ...newQuestion,
        section,
        category: '' // カテゴリをリセット
      });
    } else if (editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        section,
        category: '' // カテゴリをリセット
      });
    }
  };

  // 質問一覧を取得（ページネーション対応）
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // すべての質問を取得するために、まず総数を確認
      let allQuestions: Question[] = [];
      let page = 1;
      const limit = 100; // APIのデフォルトリミット
      let hasMore = true;
      
      while (hasMore) {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        if (filterTarget) {
          params.append('target', filterTarget);
        }
        
        const url = `${process.env.REACT_APP_API_URL}/api/v1/questions/?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          if (data.questions && data.questions.length > 0) {
            allQuestions = [...allQuestions, ...data.questions];
            
            // 次のページがあるかチェック
            if (data.questions.length < limit) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        } else {
          setError('質問の取得に失敗しました');
          hasMore = false;
        }
      }
      
      // ソート処理
      if (sortBy === 'number') {
        allQuestions.sort((a, b) => a.question_number - b.question_number);
      } else {
        allQuestions.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
      }
      
      setQuestions(allQuestions);
      setError(null);
      
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filterTarget, sortBy]);

  // フィルタリングされた質問一覧
  const filteredQuestions = questions.filter(q => {
    if (filterSection && q.section !== filterSection) {
      return false;
    }
    return true;
  });

  // 統計情報の計算
  const statistics = {
    total: questions.length,
    bySection: Object.keys(SECTIONS).reduce((acc, section) => {
      acc[section] = questions.filter(q => q.section === section).length;
      return acc;
    }, {} as Record<string, number>),
    byTarget: Object.keys(TARGETS).reduce((acc, target) => {
      acc[target] = questions.filter(q => q.target === target).length;
      return acc;
    }, {} as Record<string, number>),
    active: questions.filter(q => q.is_active).length,
    inactive: questions.filter(q => !q.is_active).length
  };

  // 新しい質問を作成
  const handleCreateQuestion = async () => {
    // バリデーション
    if (!newQuestion.question_text.trim()) {
      alert('質問文を入力してください');
      return;
    }
    if (!newQuestion.section) {
      alert('セクションを選択してください');
      return;
    }
    if (!newQuestion.category) {
      alert('カテゴリを選択してください');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/questions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      });

      if (response.ok) {
        setNewQuestion({
          question_number: 0,
          question_text: '',
          category: '',
          section: '',
          target: 'all',
          is_active: true
        });
        setShowAddForm(false);
        fetchQuestions();
        alert('質問が作成されました');
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail}`);
      }
    } catch (err) {
      alert('質問の作成に失敗しました');
    }
  };

  // 質問を更新
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    // バリデーション
    if (!editingQuestion.question_text.trim()) {
      alert('質問文を入力してください');
      return;
    }
    if (!editingQuestion.section) {
      alert('セクションを選択してください');
      return;
    }
    if (!editingQuestion.category) {
      alert('カテゴリを選択してください');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/questions/${editingQuestion.question_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_text: editingQuestion.question_text,
          category: editingQuestion.category,
          section: editingQuestion.section,
          target: editingQuestion.target,
          is_active: editingQuestion.is_active,
        }),
      });

      if (response.ok) {
        setEditingQuestion(null);
        fetchQuestions();
        alert('質問が更新されました');
      } else {
        alert('質問の更新に失敗しました');
      }
    } catch (err) {
      alert('質問の更新に失敗しました');
    }
  };

  // 質問を削除
  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('この質問を削除しますか？')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchQuestions();
        alert('質問が削除されました');
      } else {
        alert('質問の削除に失敗しました');
      }
    } catch (err) {
      alert('質問の削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>質問を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">質問管理</h1>
        
        {/* 統計情報 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                合計 <span className="text-primary-600">{statistics.total}</span> 問
              </p>
              <p className="text-sm text-gray-600">
                有効: {statistics.active} / 無効: {statistics.inactive}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">セクション別</p>
              {Object.entries(statistics.bySection).map(([section, count]) => (
                <p key={section} className="text-xs text-gray-600">
                  {section}: {count}問
                </p>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">対象別</p>
              {Object.entries(statistics.byTarget).map(([target, count]) => (
                <p key={target} className="text-xs text-gray-600">
                  {TARGETS[target as keyof typeof TARGETS]}: {count}問
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* フィルターとアクション */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {/* 対象フィルター */}
            <select
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value)}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            >
              <option value="">すべての対象</option>
              {Object.entries(TARGETS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            {/* セクションフィルター */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            >
              <option value="">すべてのセクション</option>
              {Object.keys(SECTIONS).map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
            
            {/* ソート */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'number' | 'created')}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            >
              <option value="number">質問番号順</option>
              <option value="created">作成日順</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              次の質問番号: Q{getNextQuestionNumber()}
            </p>
            <Button onClick={handleShowAddForm}>
              新しい質問を追加
            </Button>
          </div>
        </div>
        
        {filteredQuestions.length !== questions.length && (
          <p className="mt-2 text-sm text-gray-600">
            フィルター適用中: {filteredQuestions.length} 問を表示
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 新規質問追加フォーム */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">新しい質問を追加</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                質問番号
              </label>
              <input
                type="number"
                value={newQuestion.question_number}
                onChange={(e) => setNewQuestion({...newQuestion, question_number: parseInt(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 bg-gray-100"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                ※質問番号は自動で設定されます（テスト時の表示順序に使用）
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                対象 <span className="text-red-500">*</span>
              </label>
              <select
                value={newQuestion.target}
                onChange={(e) => setNewQuestion({...newQuestion, target: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(TARGETS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                自己肯定感の20問は対象別に異なります
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                セクション <span className="text-red-500">*</span>
              </label>
              <select
                value={newQuestion.section}
                onChange={(e) => handleSectionChange(e.target.value, true)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              >
                <option value="">セクションを選択</option>
                {Object.keys(SECTIONS).map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                disabled={!newQuestion.section}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              >
                <option value="">カテゴリを選択</option>
                {newQuestion.section && SECTIONS[newQuestion.section as keyof typeof SECTIONS]?.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                有効/無効
              </label>
              <select
                value={newQuestion.is_active ? 'true' : 'false'}
                onChange={(e) => setNewQuestion({...newQuestion, is_active: e.target.value === 'true'})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              >
                <option value="true">有効</option>
                <option value="false">無効</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              質問文 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
              placeholder="質問文を入力してください"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="mt-4 flex space-x-2">
            <Button onClick={handleCreateQuestion}>
              作成
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowAddForm(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}

      {/* 質問一覧 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredQuestions.map((question) => (
            <li key={question.question_id} className="px-6 py-4">
              {editingQuestion?.question_id === question.question_id ? (
                // 編集モード
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        対象 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editingQuestion.target}
                        onChange={(e) => setEditingQuestion({...editingQuestion, target: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                      >
                        {Object.entries(TARGETS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        セクション <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editingQuestion.section}
                        onChange={(e) => handleSectionChange(e.target.value, false)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">セクションを選択</option>
                        {Object.keys(SECTIONS).map((section) => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        カテゴリ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editingQuestion.category}
                        onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value})}
                        disabled={!editingQuestion.section}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                      >
                        <option value="">カテゴリを選択</option>
                        {editingQuestion.section && SECTIONS[editingQuestion.section as keyof typeof SECTIONS]?.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        有効/無効
                      </label>
                      <select
                        value={editingQuestion.is_active ? 'true' : 'false'}
                        onChange={(e) => setEditingQuestion({...editingQuestion, is_active: e.target.value === 'true'})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="true">有効</option>
                        <option value="false">無効</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      質問文 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editingQuestion.question_text}
                      onChange={(e) => setEditingQuestion({...editingQuestion, question_text: e.target.value})}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleUpdateQuestion}>
                      保存
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => setEditingQuestion(null)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Q{question.question_number}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {TARGETS[question.target as keyof typeof TARGETS]}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {question.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {question.section}
                      </span>
                      {!question.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          無効
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-900">{question.question_text}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      作成日: {new Date(question.created_date).toLocaleString('ja-JP')}
                    </p>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => setEditingQuestion(question)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDeleteQuestion(question.question_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      削除
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {questions.length === 0 ? '質問がまだ登録されていません' : 'フィルター条件に一致する質問がありません'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionAdminPage;