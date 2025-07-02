import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import { PaperAirplaneIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const CoachingPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasTestResult, setHasTestResult] = useState(true); // TODO: Check if user has test result
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: `こんにちは、${user?.name}さん！AIコーチです。あなたのテスト結果を基に、メンタル面でのサポートをさせていただきます。何か気になることや相談したいことがあれば、お気軽にお話しください。`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [user?.name]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // TODO: Call AI service API
      // Simulated AI response for now
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateMockResponse(inputMessage),
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to get AI response:', error);
    }
  };

  const generateMockResponse = (userInput: string): string => {
    // Simple mock responses based on input
    const responses = [
      'それは素晴らしい気づきですね。その気持ちをもう少し詳しく聞かせてもらえますか？',
      'あなたのテスト結果を見ると、その分野での成長の可能性が大きいと思います。どのような点で改善したいと感じていますか？',
      'とても前向きな考え方ですね。その調子で継続していけば、きっと良い結果につながると思います。',
      'なるほど、そのような状況では確かに悩ましいですね。あなたなりにどのような解決策を考えてみましたか？',
      'あなたの強みを活かして、その課題に取り組んでみることをお勧めします。まずは小さな一歩から始めてみませんか？'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!hasTestResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
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
        
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            テストの完了が必要です
          </h1>
          <p className="text-gray-600 mb-6">
            AIコーチング機能をご利用いただくには、まずメンタルヘルステストを完了してください。
          </p>
          <Button onClick={() => window.location.href = '/test'}>
            テストを開始する
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
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
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AIコーチング
        </h1>
        <p className="text-gray-600">
          あなたのテスト結果に基づいて、パーソナライズされたアドバイスを提供します。
        </p>
      </div>

      <div className="card flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('ja-JP', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力してください..."
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="self-end"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Enterで送信、Shift+Enterで改行
          </div>
        </div>
      </div>

      {/* Coaching Tips */}
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          コーチングのヒント
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">効果的な質問例</h3>
            <ul className="space-y-1">
              <li>• 「今日の練習で感じたことを教えてください」</li>
              <li>• 「どの部分を改善したいですか？」</li>
              <li>• 「目標達成のために何が必要だと思いますか？」</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">相談できること</h3>
            <ul className="space-y-1">
              <li>• メンタル面での課題や悩み</li>
              <li>• モチベーションの維持方法</li>
              <li>• チームワークの改善</li>
              <li>• 目標設定とその達成方法</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingPage;