// frontend/src/hooks/useSectionProgress.ts
import { useState, useCallback, useMemo, useEffect } from 'react';

interface Question {
  question_id: string;
  question_number: number;
  question_text: string;
  category: string;
  subcategory: string;
  target: string;
  is_active: boolean;
}

// 回答データの型（question_idをキーとする）
type AnswersData = Record<string, number>;

// セクション構造の定義（役割による違いを考慮）
interface SectionStructure {
  [category: string]: string[];
}

// 基本のセクション構造（全役割共通）
const BASE_SECTION_STRUCTURE: SectionStructure = {
  sportsmanship: [
    'courage',           // 勇気
    'resilience',        // 復活力
    'cooperation',       // 協調性
    'natural_acceptance', // 自然体
    'non_rationality'    // 非合理性
  ],
  athlete_mind: [
    'introspection',     // 内省
    'self_control',      // 克己
    'devotion',          // 献身
    'intuition',         // 直感
    'sensitivity',       // 繊細
    'steadiness',        // 堅実
    'comparison',        // 比較
    'result',            // 結果
    'assertion',         // 主張
    'commitment'         // こだわり
  ],
  self_esteem: [        // self_affirmation → self_esteem に修正
    'self_determination', // 自己決定感
    'self_acceptance',    // 自己受容感
    'self_worth',         // 自己有用感
    'self_efficacy'       // 自己効力感
  ]
};

interface SectionInfo {
  category: string;
  categoryIndex: number;
  section: string;
  sectionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  isCompleted: boolean;
  questions: Question[];
  title: string;
  description: string;
}

interface CategoryInfo {
  category: string;
  title: string;
  totalSections: number;
  completedSections: number;
  totalQuestions: number;
  answeredQuestions: number;
  isCompleted: boolean;
}

interface OverallProgress {
  totalSections: number;
  completedSections: number;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  isCompleted: boolean;
}

export const useSectionProgress = (questions: Question[]) => {
  const [answers, setAnswers] = useState<AnswersData>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);

  // カテゴリの順序を定義（self_affirmation → self_esteem に修正）
  const categoryOrder = useMemo(() => ['sportsmanship', 'athlete_mind', 'self_esteem'], []);

  // 現在のユーザーの役割を質問から推測
  const userRole = useMemo(() => {
    if (questions.length > 0) {
      // スポーツマンシップ以外の質問からtargetを取得
      const nonSportsmanshipQuestion = questions.find(q => q.category !== 'sportsmanship');
      return nonSportsmanshipQuestion?.target || questions[0].target;
    }
    return 'player'; // デフォルト
  }, [questions]);

  // 役割に応じたセクション構造を取得
  const getSectionStructureForRole = useCallback((role: string): SectionStructure => {
    // 現時点では全役割で同じ構造を使用
    // 必要に応じてここで役割ごとの違いを実装
    return BASE_SECTION_STRUCTURE;
  }, []);

  // セクション情報の取得（日本語ラベル）
  const getSectionInfo = useCallback((category: string, section: string): { title: string; description: string } => {
    const sectionLabels: Record<string, { title: string; description: string }> = {
      // スポーツマンシップ
      'courage': { title: '勇気', description: '困難な状況でも挑戦し続ける力' },
      'resilience': { title: '復活力', description: '挫折から立ち直る力' },
      'cooperation': { title: '協調性', description: 'チームワークを重視する姿勢' },
      'natural_acceptance': { title: '自然体', description: 'ありのままの自分を受け入れる力' },
      'non_rationality': { title: '非合理性', description: '直感や感性を大切にする力' },
      
      // アスリートマインド
      'introspection': { title: '内省', description: '自分自身を深く見つめる力' },
      'self_control': { title: '克己', description: '自分をコントロールする力' },
      'devotion': { title: '献身', description: 'チームや目標のために尽くす力' },
      'intuition': { title: '直感', description: '直感で判断し行動する力' },
      'sensitivity': { title: '繊細', description: '周囲の変化や感情を察知する力' },
      'steadiness': { title: '堅実', description: '一歩一歩確実に前進する力' },
      'comparison': { title: '比較', description: '他者と比較して自分を向上させる力' },
      'result': { title: '結果', description: '成果を重視して取り組む力' },
      'assertion': { title: '主張', description: '自分の意見を適切に表現する力' },
      'commitment': { title: 'こだわり', description: '細かい部分まで注意を払い完璧を目指す力' },
      
      // 自己肯定感
      'self_determination': { title: '自己決定感', description: '自分で選択・決定する力' },
      'self_acceptance': { title: '自己受容感', description: 'ありのままの自分を受け入れる力' },
      'self_worth': { title: '自己有用感', description: '自分の存在価値を感じる力' },
      'self_efficacy': { title: '自己効力感', description: '自分ならできるという確信' }
    };
    return sectionLabels[section] || { title: section, description: '' };
  }, []);

  // カテゴリ情報の取得
  const getCategoryInfo = useCallback((category: string): { title: string; description: string } => {
    const categoryInfo: Record<string, { title: string; description: string }> = {
      sportsmanship: {
        title: 'スポーツマンシップチャート',
        description: 'スポーツにおける基本的な心構えや姿勢を測定します'
      },
      athlete_mind: {
        title: 'アスリートマインド',
        description: 'アスリートとしての精神的な特性を評価します'
      },
      self_esteem: {  // self_affirmation → self_esteem に修正
        title: '自己肯定感',
        description: '自分自身に対する肯定的な感情を測定します'
      }
    };
    return categoryInfo[category] || { title: category, description: '' };
  }, []);

  // 回答を設定する関数（question_idをキーとして使用）
  const setAnswer = useCallback((questionId: string, value: number) => {
    console.log('回答設定:', { questionId, value });
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  }, []);

  // ローカルストレージから保存された進捗を読み込む
  useEffect(() => {
    if (userRole && questions.length > 0) {
      const savedProgress = localStorage.getItem(`test_progress_${userRole}`);
      if (savedProgress) {
        try {
          const parsedProgress = JSON.parse(savedProgress);
          console.log('保存された進捗を読み込み:', {
            userRole,
            savedAnswersCount: Object.keys(parsedProgress).length
          });
          setAnswers(parsedProgress);
        } catch (error) {
          console.error('進捗の読み込みエラー:', error);
        }
      }
    }
  }, [userRole, questions.length]);

  // セクション別の進捗データを計算
  const progressData = useMemo(() => {
    console.log('useSectionProgress: 進捗データ計算開始', {
      userRole,
      questionsCount: questions.length,
      answersCount: Object.keys(answers).length,
      categoryOrder
    });

    const allSections: SectionInfo[] = [];
    const categoryInfos: CategoryInfo[] = [];
    const sectionStructure = getSectionStructureForRole(userRole);

    // カテゴリごとに処理
    categoryOrder.forEach((category, categoryIndex) => {
      // カテゴリに属する質問をフィルタリング
      // スポーツマンシップは全対象（target='all'）、それ以外は現在のユーザーのroleに一致するもののみ
      const categoryQuestions = questions.filter(q => {
        if (q.category === category) {
          if (category === 'sportsmanship') {
            return true; // スポーツマンシップは全員共通
          } else {
            // アスリートマインドと自己肯定感は役割別
            return q.target === userRole;
          }
        }
        return false;
      });

      console.log(`カテゴリ ${category} の質問数:`, categoryQuestions.length, {
        userRole,
        sampleQuestions: categoryQuestions.slice(0, 3).map(q => ({
          question_number: q.question_number,
          target: q.target,
          subcategory: q.subcategory
        }))
      });

      const sections = sectionStructure[category] || [];
      const categoryInfo = getCategoryInfo(category);
      
      let categoryAnsweredQuestions = 0;
      let categoryCompletedSections = 0;

      // セクションごとに処理
      sections.forEach((section, sectionIndex) => {
        const sectionQuestions = categoryQuestions
          .filter(q => q.subcategory === section)
          .sort((a, b) => a.question_number - b.question_number);
        
        // question_idで回答をチェック
        const answeredQuestions = sectionQuestions.filter(q => 
          answers[q.question_id] !== undefined && answers[q.question_id] !== null
        ).length;
        
        const completionPercentage = sectionQuestions.length > 0 
          ? (answeredQuestions / sectionQuestions.length) * 100 
          : 0;
        const isCompleted = sectionQuestions.length > 0 && answeredQuestions === sectionQuestions.length;
        
        if (isCompleted && sectionQuestions.length > 0) {
          categoryCompletedSections++;
        }
        categoryAnsweredQuestions += answeredQuestions;

        const sectionInfo = getSectionInfo(category, section);
        
        console.log(`セクション処理: ${category}.${section}`, {
          sectionIndex,
          sectionQuestionsCount: sectionQuestions.length,
          answeredQuestions,
          isCompleted,
          questionNumbers: sectionQuestions.map(q => q.question_number)
        });
        
        allSections.push({
          category,
          categoryIndex,
          section,
          sectionIndex,
          totalQuestions: sectionQuestions.length,
          answeredQuestions,
          completionPercentage,
          isCompleted,
          questions: sectionQuestions,
          title: sectionInfo.title,
          description: sectionInfo.description
        });
      });

      categoryInfos.push({
        category,
        title: categoryInfo.title,
        totalSections: sections.length,
        completedSections: categoryCompletedSections,
        totalQuestions: categoryQuestions.length,
        answeredQuestions: categoryAnsweredQuestions,
        isCompleted: categoryCompletedSections === sections.length && sections.length > 0
      });
    });

    // 有効なセクションのみをフィルタリング（質問がないセクションを除外）
    const validSections = allSections.filter(s => s.totalQuestions > 0);

    // 全体の進捗を計算（現在のユーザーに関連する質問のみ）
    const userQuestions = questions.filter(q => 
      q.category === 'sportsmanship' || q.target === userRole
    );
    
    const totalSections = validSections.length;
    const completedSections = validSections.filter(s => s.isCompleted).length;
    const totalQuestions = userQuestions.length;
    const totalAnsweredQuestions = userQuestions.filter(q => 
      answers[q.question_id] !== undefined && answers[q.question_id] !== null
    ).length;
    const completionPercentage = totalQuestions > 0 ? (totalAnsweredQuestions / totalQuestions) * 100 : 0;

    const overallProgress: OverallProgress = {
      totalSections,
      completedSections,
      totalQuestions,
      answeredQuestions: totalAnsweredQuestions,
      completionPercentage,
      isCompleted: totalQuestions > 0 && totalAnsweredQuestions === totalQuestions
    };

    console.log('進捗データ計算完了:', {
      userRole,
      overallProgress,
      categoryInfos,
      totalSections: validSections.length,
      sectionDetails: validSections.map(s => ({
        title: s.title,
        answered: s.answeredQuestions,
        total: s.totalQuestions,
        isCompleted: s.isCompleted
      }))
    });

    return { 
      allSections: validSections, 
      categoryInfos, 
      overallProgress 
    };
  }, [questions, answers, categoryOrder, getCategoryInfo, getSectionInfo, userRole, getSectionStructureForRole]);

  // 現在のセクション情報
  const currentSection = useMemo(() => {
    const section = progressData.allSections.find(
      s => s.categoryIndex === currentCategoryIndex && s.sectionIndex === currentSectionIndex
    );
    
    // 見つからない場合は最初の有効なセクションを返す
    if (!section && progressData.allSections.length > 0) {
      setCurrentCategoryIndex(progressData.allSections[0].categoryIndex);
      setCurrentSectionIndex(progressData.allSections[0].sectionIndex);
      return progressData.allSections[0];
    }
    
    return section;
  }, [progressData.allSections, currentCategoryIndex, currentSectionIndex]);

  // 現在のカテゴリ情報
  const currentCategory = useMemo(() => {
    return progressData.categoryInfos[currentCategoryIndex] || progressData.categoryInfos[0];
  }, [progressData.categoryInfos, currentCategoryIndex]);

  // ナビゲーション関数
  const moveToNextSection = useCallback(() => {
    const allSections = progressData.allSections;
    const currentIndex = allSections.findIndex(
      s => s.categoryIndex === currentCategoryIndex && s.sectionIndex === currentSectionIndex
    );
    
    if (currentIndex < allSections.length - 1) {
      const nextSection = allSections[currentIndex + 1];
      setCurrentCategoryIndex(nextSection.categoryIndex);
      setCurrentSectionIndex(nextSection.sectionIndex);
      window.scrollTo(0, 0);
    }
  }, [progressData.allSections, currentCategoryIndex, currentSectionIndex]);

  const moveToPreviousSection = useCallback(() => {
    const allSections = progressData.allSections;
    const currentIndex = allSections.findIndex(
      s => s.categoryIndex === currentCategoryIndex && s.sectionIndex === currentSectionIndex
    );
    
    if (currentIndex > 0) {
      const previousSection = allSections[currentIndex - 1];
      setCurrentCategoryIndex(previousSection.categoryIndex);
      setCurrentSectionIndex(previousSection.sectionIndex);
      window.scrollTo(0, 0);
    }
  }, [progressData.allSections, currentCategoryIndex, currentSectionIndex]);

  const moveToSection = useCallback((categoryIndex: number, sectionIndex: number) => {
    setCurrentCategoryIndex(categoryIndex);
    setCurrentSectionIndex(sectionIndex);
    window.scrollTo(0, 0);
  }, []);

  // ナビゲーション可能性のチェック
  const canMoveToNextSection = useMemo(() => {
    const allSections = progressData.allSections;
    const currentIndex = allSections.findIndex(
      s => s.categoryIndex === currentCategoryIndex && s.sectionIndex === currentSectionIndex
    );
    return currentIndex < allSections.length - 1;
  }, [progressData.allSections, currentCategoryIndex, currentSectionIndex]);

  const canMoveToPreviousSection = useMemo(() => {
    const allSections = progressData.allSections;
    const currentIndex = allSections.findIndex(
      s => s.categoryIndex === currentCategoryIndex && s.sectionIndex === currentSectionIndex
    );
    return currentIndex > 0;
  }, [progressData.allSections, currentCategoryIndex, currentSectionIndex]);

  // セクション完了時の自動進行（オプション）
  useEffect(() => {
    if (currentSection?.isCompleted && canMoveToNextSection) {
      const timer = setTimeout(() => {
        const stillOnSameSection = progressData.allSections.find(
          s => s.categoryIndex === currentCategoryIndex && s.sectionIndex === currentSectionIndex
        );
        if (stillOnSameSection?.isCompleted) {
          moveToNextSection();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentSection?.isCompleted, canMoveToNextSection, moveToNextSection, currentCategoryIndex, currentSectionIndex, progressData.allSections]);

  return {
    answers,
    currentSection,
    currentCategory,
    allSections: progressData.allSections,
    categoryInfos: progressData.categoryInfos,
    overallProgress: progressData.overallProgress,
    setAnswer,
    moveToNextSection,
    moveToPreviousSection,
    moveToSection,
    canMoveToNextSection,
    canMoveToPreviousSection
  };
};