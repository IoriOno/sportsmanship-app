// file: frontend/src/utils/analysisGenerators.ts

interface TestResult {
  // 自己肯定感関連
  self_determination: number;
  self_acceptance: number;
  self_worth: number;
  self_efficacy: number;
  
  // アスリートマインド
  introspection: number;
  self_control: number;
  devotion: number;
  intuition: number;
  sensitivity: number;
  steadiness: number;
  comparison: number;
  result: number;
  assertion: number;
  commitment: number;
  
  // スポーツマンシップ
  courage: number;
  resilience: number;
  cooperation: number;
  natural_acceptance: number;
  non_rationality: number;
}

/**
 * 自己肯定感の分析文を生成
 */
export const generateSelfEsteemAnalysis = (result: TestResult, selfEsteemTotal: number): string => {
  const acceptance = result.self_acceptance;
  const worth = result.self_worth;
  const determination = result.self_determination;
  
  let analysis = `あなたの自己肯定感は${selfEsteemTotal}/150点です。`;
  
  if (acceptance >= 40) {
    analysis += `自己受容感が高く、自分自身をありのまま受け入れる力が備わっています。`;
  } else if (acceptance >= 30) {
    analysis += `自己受容感は平均的で、時に自分を受け入れることに葛藤を感じることがあるかもしれません。`;
  } else {
    analysis += `自己受容感に課題があり、自分を否定的に捉えがちな傾向があります。`;
  }
  
  if (worth >= 40) {
    analysis += `また、自己有用感も高く、自分の存在価値を強く感じています。`;
  } else if (worth >= 30) {
    analysis += `自己有用感は標準的で、状況により自信が揺らぐこともあるでしょう。`;
  } else {
    analysis += `自己有用感を高める余地があり、自分の価値を見出すことに苦労しているかもしれません。`;
  }
  
  if (determination >= 40) {
    analysis += `自己決定感も優れており、主体的に物事を決定し行動できています。`;
  } else if (determination >= 30) {
    analysis += `自己決定感は適度で、時に他者の意見に流されることもあるでしょう。`;
  } else {
    analysis += `自己決定感を育てることで、より主体的な行動が取れるようになるでしょう。`;
  }
  
  // アスリートマインドの要素も反映
  if (result.introspection >= 80) {
    analysis += `内省力が高いことも、自己理解を深める強みとなっています。`;
  }
  
  if (result.self_control >= 80) {
    analysis += `優れた克己心は、目標に向かって努力を継続する原動力になっています。`;
  }
  
  return analysis;
};

/**
 * 自己肯定感改善のための提案を生成
 */
export const generateSelfEsteemImprovements = (result: TestResult): string[] => {
  const improvements: string[] = [];
  
  if (result.self_acceptance < 35) {
    improvements.push('毎日、自分の良かった点を3つ書き出す習慣をつける');
    improvements.push('失敗を成長の機会として前向きに捉える練習をする');
  }
  
  if (result.self_worth < 35) {
    improvements.push('小さな成功体験を意識的に積み重ね、記録する');
    improvements.push('他者への貢献を通じて自分の価値を実感する機会を増やす');
  }
  
  if (result.self_determination < 35) {
    improvements.push('日々の小さな選択から自分で決める習慣を身につける');
    improvements.push('自分の意見を言葉にして表現する練習をする');
  }
  
  if (improvements.length < 5) {
    improvements.push('定期的に自己振り返りの時間を設け、成長を確認する');
    improvements.push('他者と比較せず、過去の自分と比較して成長を実感する');
    improvements.push('感謝の気持ちを日記に書き、ポジティブな視点を養う');
  }
  
  return improvements.slice(0, 5);
};

/**
 * 自己効力感の分析文を生成
 */
export const generateSelfEfficacyAnalysis = (result: TestResult): string => {
  const efficacy = result.self_efficacy;
  let analysis = `あなたの自己効力感は${efficacy}/50点です。`;
  
  if (efficacy >= 40) {
    analysis += `目標達成への自信が非常に高く、困難な課題にも積極的に取り組める状態です。`;
  } else if (efficacy >= 30) {
    analysis += `適度な自信を持っており、多くの課題に対して前向きに取り組めています。`;
  } else {
    analysis += `自己効力感を高めることで、より大きな目標にチャレンジできるようになるでしょう。`;
  }
  
  // 他の要素との関連
  if (result.result >= 80) {
    analysis += `結果志向の強さが、目標達成への推進力となっています。`;
  }
  
  if (result.commitment >= 80) {
    analysis += `強いこだわりは、質の高いパフォーマンスを生み出す源泉です。`;
  }
  
  if (result.resilience >= 75) {
    analysis += `レジリエンスの高さは、挫折を乗り越える力として機能しています。`;
  }
  
  // 改善点の示唆
  if (efficacy < 35) {
    analysis += `段階的な目標設定により、成功体験を積み重ねることが重要です。過去の成功体験を振り返り、自信の源を再確認しましょう。`;
  } else {
    analysis += `現在の自信を維持しながら、新たな挑戦を通じてさらなる成長を目指しましょう。`;
  }
  
  return analysis;
};

/**
 * 自己効力感改善のための提案を生成
 */
export const generateSelfEfficacyImprovements = (result: TestResult): string[] => {
  const improvements: string[] = [];
  const efficacy = result.self_efficacy;
  
  if (efficacy < 40) {
    improvements.push('達成可能な小さな目標を設定し、成功体験を積み重ねる');
    improvements.push('成功した他者のモデリングを通じて、自分にもできると信じる');
    improvements.push('ポジティブな自己対話を心がけ、ネガティブな思考を変換する');
  }
  
  improvements.push('目標を具体的に可視化し、達成までのプロセスを明確にする');
  improvements.push('失敗を学習機会と捉え、次への改善点を具体的に見つける');
  improvements.push('自分の強みを活かせる場面を意識的に増やす');
  improvements.push('メンターやコーチからのフィードバックを積極的に求める');
  improvements.push('日々の小さな進歩を記録し、成長を実感する習慣をつける');
  
  return improvements.slice(0, 5);
};

/**
 * スポーツマンシップ総合分析を生成
 */
export const generateSportsmanshipAnalysis = (result: TestResult, selfEsteemTotal: number): string => {
  const selfEsteemScore = selfEsteemTotal;
  const efficacyScore = result.self_efficacy;
  
  let analysis = `あなたのスポーツマンシップは、自己肯定感（${selfEsteemScore}/150）と自己効力感（${efficacyScore}/50）のバランスから見ると、`;
  
  if (selfEsteemScore >= 120 && efficacyScore >= 40) {
    analysis += `非常に優れた状態にあります。自分を肯定的に捉え、目標達成への確信も強く、理想的なメンタル状態です。`;
  } else if (selfEsteemScore >= 90 && efficacyScore >= 30) {
    analysis += `良好な状態です。基本的な自己肯定感と実行力のバランスが取れています。`;
  } else {
    analysis += `成長の余地があります。自己理解を深め、段階的な成功体験を重ねることが重要です。`;
  }
  
  // スポーツマンシップの5要素との関連
  if (result.courage >= 80 && result.resilience >= 80) {
    analysis += `勇気とレジリエンスの高さは、困難な状況でも前進する力となっています。`;
  }
  
  if (result.cooperation >= 75) {
    analysis += `協調性の高さは、チーム内での信頼関係構築に貢献しています。`;
  }
  
  // バランスの観点
  const gap = Math.abs((selfEsteemScore / 3) - efficacyScore);
  if (gap > 15) {
    analysis += `自己肯定感と自己効力感のバランスに差があります。両者を調和させることで、より安定したパフォーマンスが期待できます。`;
  } else {
    analysis += `両者のバランスが良く、安定したメンタル基盤が形成されています。`;
  }
  
  analysis += `今後は、弱い部分を補強しながら、強みをさらに伸ばすことで、真のスポーツマンシップを体現できるでしょう。`;
  
  return analysis;
};