export interface TestAnswer {
  question_id: number;
  answer_value: number;
}

export interface TestSubmission {
  answers: TestAnswer[];
}

export interface TestResult {
  result_id: string;
  user_id: string;
  test_date: string;
  
  // 自己肯定感関連
  self_determination: number;
  self_acceptance: number;
  self_worth: number;
  self_efficacy: number;
  
  // アスリートマインド
  introspection: number;
  self_control: number;
  dedication: number;
  intuition: number;
  sensitivity: number;
  steadiness: number;
  comparison: number;
  result_focus: number;
  assertion: number;
  thoroughness: number;
  
  // スポーツマンシップ
  courage: number;
  resilience: number;
  cooperation: number;
  natural_acceptance: number;
  non_rationality: number;
}

export interface TestResultWithAnalysis extends TestResult {
  // 自己肯定感分析
  self_esteem_total: number;
  self_esteem_analysis: string;
  self_esteem_improvements: string[];
  
  // アスリートタイプ
  athlete_type: string;
  athlete_type_description: string;
  athlete_type_percentages: Record<string, number>;
  
  // 資質分析
  strengths: string[];
  weaknesses: string[];
  
  // スポーツマンシップ分析
  sportsmanship_balance: string;
}

export interface Question {
  id: number;
  text: string;
  category: string;
}