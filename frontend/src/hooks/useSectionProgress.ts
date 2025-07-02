// frontend/src/hooks/userSectionProgress.ts
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

// セクション構造の定義（統合データローダーの標準化に合わせて修正）
interface SectionStructure {
  [category: string]: string[];
}

const SECTION_STRUCTURE: SectionStructure = {
  sportsmanship: ['courage', 'resilience', 'cooperation', 'natural_acceptance', 'non_rationality'],
  athlete_mind: [
    'commitment',     // こだわり（旧: detail_oriented）
    'result',         // 結果（旧: results_oriented）
    'steadiness',     // 堅実（旧: steady）
    'devotion',       // 献身（旧: devoted）
    'self_control',   // 克己（変更なし）
    'assertion',      // 主張（旧: assertive）
    'sensitivity',    // 繊細（旧: sensitive）
    'intuition',      // 直感（旧: intuitive）
    'introspection',  // 内省（旧: introspective）
    'comparison'      // 比較（旧: comparative）
  ],
  self_affirmation: ['self_efficacy', 'self_determination', 'self_acceptance', 'self_worth']
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
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);

  // カテゴリの順序を定義
  const categoryOrder = useMemo(() => ['sportsmanship', 'athlete_mind', 'self_affirmation'], []);

  // セクション情報の取得（日本語ラベルも統一）
  const getSectionInfo = useCallback((category: string, section: string): { title: string; description: string } => {
    const sectionLabels: Record<string, { title: string; description: string }> = {
      // スポーツマンシップ
      'courage': { title: '勇気', description: '困難な状況でも挑戦し続ける力' },
      'resilience': { title: '打たれ強さ', description: '挫折から立ち直る力' },
      'cooperation': { title: '協調性', description: 'チームワークを重視する姿勢' },
      'natural_acceptance': { title: '自然体', description: 'ありのままの自分を受け入れる力' },
      'non_rationality': { title: '非合理性', description: '直感や感性を大切にする力' },
      
      // アスリートマインド（統一されたラベル）
      'commitment': { title: 'こだわり', description: '細かい部分まで注意を払い完璧を目指す力' },
      'result': { title: '結果', description: '成果を重視して取り組む力' },
      'steadiness': { title: '堅実', description: '一歩一歩確実に前進する力' },
      'devotion': { title: '献身', description: 'チームや目標のために尽くす力' },
      'self_control': { title: '克己', description: '自分をコントロールする力' },
      'assertion': { title: '主張', description: '自分の意見を適切に表現する力' },
      'sensitivity': { title: '繊細', description: '周囲の変化や感情を察知する力' },
      'intuition': { title: '直感', description: '直感で判断し行動する力' },
      'introspection': { title: '内省', description: '自分自身を深く見つめる力' },
      'comparison': { title: '比較', description: '他者と比較して自分を向上させる力' },
      
      // 自己肯定感
      'self_efficacy': { title: '自己効力感', description: '自分ならできるという確信' },
      'self_determination': { title: '自己決定感', description: '自分で選択・決定する力' },
      'self_acceptance': { title: '自己受容感', description: 'ありのままの自分を受け入れる力' },
      'self_worth': { title: '自己有用感', description: '自分の存在価値を感じる力' }
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
      self_affirmation: {
        title: '自己肯定感',
        description: '自分自身に対する肯定的な感情を測定します'
      }
    };
    return categoryInfo[category] || { title: category, description: '' };
  }, []);

  // 回答を設定する関数
  const setAnswer = useCallback((questionNumber: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: value
    }));
  }, []);

  // セクション別の進捗データを計算
  const progressData = useMemo(() => {
    console.log('useSectionProgress: 進捗データ計算開始', {
      questionsCount: questions.length,
      answersCount: Object.keys(answers).length,
      categoryOrder,
      sampleQuestions: questions.slice(0, 5).map(q => ({
        question_number: q.question_number,
        category: q.category,
        subcategory: q.subcategory,
        question_text: q.question_text.substring(0, 30) + '...'
      }))
    });

    const allSections: SectionInfo[] = [];
    const categoryInfos: CategoryInfo[] = [];

    // カテゴリごとに処理
    categoryOrder.forEach((category, categoryIndex) => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const sections = SECTION_STRUCTURE[category] || [];
      const categoryInfo = getCategoryInfo(category);
      
      console.log(`カテゴリ処理: ${category}`, {
        categoryIndex,
        categoryQuestionsCount: categoryQuestions.length,
        sections,
        sampleCategoryQuestions: categoryQuestions.slice(0, 3).map(q => ({
          question_number: q.question_number,
          subcategory: q.subcategory,
          question_text: q.question_text.substring(0, 30) + '...'
        }))
      });
      
      let categoryAnsweredQuestions = 0;
      let categoryCompletedSections = 0;

      // セクションごとに処理
      sections.forEach((section, sectionIndex) => {
        const sectionQuestions = categoryQuestions.filter(q => q.subcategory === section);
        const answeredQuestions = sectionQuestions.filter(q => 
          answers[q.question_number] !== undefined
        ).length;
        
        const completionPercentage = sectionQuestions.length > 0 
          ? (answeredQuestions / sectionQuestions.length) * 100 
          : 0;
        const isCompleted = answeredQuestions === sectionQuestions.length;
        
        if (isCompleted) categoryCompletedSections++;
        categoryAnsweredQuestions += answeredQuestions;

        const sectionInfo = getSectionInfo(category, section);
        
        console.log(`セクション処理: ${category}.${section}`, {
          sectionIndex,
          sectionQuestionsCount: sectionQuestions.length,
          answeredQuestions,
          completionPercentage,
          isCompleted,
          sectionInfo,
          sampleSectionQuestions: sectionQuestions.slice(0, 2).map(q => ({
            question_number: q.question_number,
            question_text: q.question_text.substring(0, 30) + '...'
          }))
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
        isCompleted: categoryCompletedSections === sections.length
      });
    });

    // 全体の進捗を計算
    const totalSections = allSections.length;
    const completedSections = allSections.filter(s => s.isCompleted).length;
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    const completionPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    const overallProgress: OverallProgress = {
      totalSections,
      completedSections,
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      isCompleted: completedSections === totalSections
    };

    return { allSections, categoryInfos, overallProgress };
  }, [questions, answers, categoryOrder, getCategoryInfo, getSectionInfo]);

  // 現在のセクション情報
  const currentSection = useMemo(() => {
    return progressData.allSections.find(
      s => s.categoryIndex === currentCategoryIndex && s.sectionIndex === currentSectionIndex
    ) || progressData.allSections[0];
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
      // ページトップにスクロール
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
      // ページトップにスクロール
      window.scrollTo(0, 0);
    }
  }, [progressData.allSections, currentCategoryIndex, currentSectionIndex]);

  const moveToSection = useCallback((categoryIndex: number, sectionIndex: number) => {
    setCurrentCategoryIndex(categoryIndex);
    setCurrentSectionIndex(sectionIndex);
    // ページトップにスクロール
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

  // セクション完了時の自動進行
  useEffect(() => {
    if (currentSection?.isCompleted && canMoveToNextSection) {
      // セクション完了から少し遅れて自動進行
      const timer = setTimeout(() => {
        // ユーザーがまだ同じセクションにいる場合のみ進行
        const stillOnSameSection = progressData.allSections.find(
          s => s.categoryIndex === currentCategoryIndex && s.sectionIndex === currentSectionIndex
        );
        if (stillOnSameSection?.isCompleted) {
          moveToNextSection();
        }
      }, 1500); // 1.5秒後に自動進行

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