import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* App Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              スポーツマンシップアプリ
            </h3>
            <p className="text-gray-600 text-sm">
              スポーツクラブ向けメンタルヘルスチェック・分析・AIコーチングアプリケーション
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">リンク</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-gray-600 hover:text-gray-900">
                  このアプリについて
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-gray-900">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-gray-900">
                  利用規約
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-gray-900">
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">サポート</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/help" className="text-gray-600 hover:text-gray-900">
                  ヘルプ
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-600 hover:text-gray-900">
                  よくある質問
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@sportsmanship-app.com" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  技術サポート
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            &copy; 2024 スポーツマンシップアプリ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;