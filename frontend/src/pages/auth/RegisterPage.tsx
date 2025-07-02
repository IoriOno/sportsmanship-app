// ファイル: frontend/src/pages/auth/RegisterPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clubId: '',
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'player', // デフォルト値を設定
    isIndividual: false  // 追加
  });
  const [agreed, setAgreed] = useState(false);

  // 統一された5つの対象分類
  const roleOptions = [
    { value: 'player', label: '選手' },
    { value: 'coach', label: 'コーチ' },
    { value: 'mother', label: '母親' },
    { value: 'father', label: '父親' },
    { value: 'adult', label: '社会人' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.isIndividual && !formData.clubId.trim()) {
      setError('クラブ利用の場合、クラブIDを入力してください');
      return;
    }
    
    if (!formData.name.trim()) {
      setError('お名前を入力してください');
      return;
    }
    
    if (!formData.age || parseInt(formData.age) < 1) {
      setError('年齢を正しく入力してください');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    if (!formData.password) {
      setError('パスワードを入力してください');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    if (!agreed) {
      setError('個人情報の取り扱いに同意してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        is_individual: formData.isIndividual,  // is_individualを最初に配置
        club_id: formData.isIndividual ? undefined : formData.clubId,  // nullではなくundefinedを使用
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
      console.log('Sending registration data:', requestData);
      console.log('Is individual?', formData.isIndividual);
      console.log('Full request data JSON:', JSON.stringify(requestData));

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        // 登録成功後、自動ログイン
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        // エラーの詳細をコンソールに出力
        console.error('Registration error details:', data);
        
        // エラーメッセージの処理を改善
        if (Array.isArray(data.detail)) {
          const errorMessages = data.detail.map((err: any) => err.msg || err.message).join(', ');
          setError(errorMessages);
        } else if (typeof data.detail === 'string') {
          setError(data.detail);
        } else {
          setError('登録に失敗しました');
        }
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          スポーツマンシップアプリ
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          新規登録
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* アプリ説明 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              スポーツマンシップアプリについて
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              個人利用またはクラブ単位でのメンタルヘルスチェック・分析・相互理解促進・AIコーチングを通じて、
              選手、コーチ、保護者、社会人の皆様がより良いスポーツ環境を築くためのツールです。
              379問のメンタルテストを通じて自己理解を深め、AIによる個別サポートを受けることができます。
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 利用形態選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                利用形態 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="usageType"
                    value="club"
                    checked={!formData.isIndividual}
                    onChange={() => setFormData(prev => ({ ...prev, isIndividual: false }))}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">クラブ利用</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="usageType"
                    value="individual"
                    checked={formData.isIndividual}
                    onChange={() => setFormData(prev => ({ ...prev, isIndividual: true, clubId: '' }))}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">個人利用</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                個人利用の場合、クラブ機能は利用できませんが、メンタルテストとAIコーチングは利用可能です
              </p>
            </div>

            {/* クラブID - 個人利用時は非表示 */}
            {!formData.isIndividual && (
              <div>
                <label htmlFor="clubId" className="block text-sm font-medium text-gray-700">
                  クラブID <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="clubId"
                    name="clubId"
                    type="text"
                    required={!formData.isIndividual}
                    value={formData.clubId}
                    onChange={handleInputChange}
                    placeholder="クラブから提供されたIDを入力"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* お名前 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                お名前 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* 年齢 */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                年齢 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.age}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* 対象選択 - 5つの分類に更新 */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                あなたの立場 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                ※自己肯定感関連の質問は立場によって内容が変わります（5つの分類に対応）
              </p>
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* パスワード確認 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                パスワード確認 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* 個人情報の取り扱いについて */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agree" className="font-medium text-gray-700">
                  個人情報の取り扱いについて同意します <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-500 text-xs mt-1">
                  入力いただいた個人情報は、本アプリのサービス提供以外の目的では使用いたしません。
                  詳細は利用規約をご確認ください。
                </p>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? '登録中...' : '新規登録'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                すでにアカウントをお持ちですか？
              </span>
              <Link
                to="/login"
                className="ml-1 font-medium text-primary-600 hover:text-primary-500"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;