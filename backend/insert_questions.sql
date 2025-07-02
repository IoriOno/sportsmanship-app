-- 既存データを削除
DELETE FROM questions;
-- スポーツマンシップ質問を挿入（29問）
INSERT INTO questions (question_id, question_number, question_text, category, subcategory, target, is_reverse_score, is_active) VALUES
-- 勇気（回避） - 6問
(gen_random_uuid(), 1, '物事を上手く進めるために何をすればいいかわかっていて、その通り行えていますか？', 'sportsmanship', 'courage', 'all', true, true),
(gen_random_uuid(), 2, '自分に何が足りないかを積極的に仲間や上司に聞くようにしていますか？', 'sportsmanship', 'courage', 'all', true, true),
(gen_random_uuid(), 3, '努力は継続することが大事なので毎日続けなくても出来る範囲ですればよいと思いますか？', 'sportsmanship', 'courage', 'all', true, true),
(gen_random_uuid(), 4, '皆の前で何かを披露するのが好きではありませんか？', 'sportsmanship', 'courage', 'all', true, true),
(gen_random_uuid(), 5, '自分には夢ややりたいことがたくさんありますか？', 'sportsmanship', 'courage', 'all', true, true),
(gen_random_uuid(), 6, 'なんとなく目標は達成できそうな気がしていると感じることがありますか？', 'sportsmanship', 'courage', 'all', true, true),
-- 打たれ強さ - 6問
(gen_random_uuid(), 7, '辛いことはなるべく考えないようにして別のことを行いますか？', 'sportsmanship', 'resilience', 'all', true, true),
(gen_random_uuid(), 8, '相手の嫌なところではなく良いところを見るようにしていますか？', 'sportsmanship', 'resilience', 'all', true, true),
(gen_random_uuid(), 9, '勝負ごとに負けたときそれを受け入れられず引きずることがありますか？', 'sportsmanship', 'resilience', 'all', true, true),
(gen_random_uuid(), 10, '正しいとわかっていても、他人からの指摘を素直に受け入れられないことがありますか？', 'sportsmanship', 'resilience', 'all', true, true),
(gen_random_uuid(), 11, '自分と真逆の意見を持つ人とは仲良くすることができませんか？', 'sportsmanship', 'resilience', 'all', true, true),
(gen_random_uuid(), 12, '嫌なことはすぐに忘れて楽しいことを考えるようにしていますか？', 'sportsmanship', 'resilience', 'all', true, true),
-- 他者性・協調性 - 6問
(gen_random_uuid(), 13, '他人から嫌われているように感じることがありますか？', 'sportsmanship', 'cooperation', 'all', true, true),
(gen_random_uuid(), 14, '人には中々理解してもらえないと思っていますか？', 'sportsmanship', 'cooperation', 'all', true, true),
(gen_random_uuid(), 15, '人の嫌な部分が良く見えるし気になることがありますか？', 'sportsmanship', 'cooperation', 'all', true, true),
(gen_random_uuid(), 16, '自分はコミュニケーション能力がある方だと思いますか？', 'sportsmanship', 'cooperation', 'all', true, true),
(gen_random_uuid(), 17, '人からライバル意識を持たれやすいと思いますか？', 'sportsmanship', 'cooperation', 'all', true, true),
(gen_random_uuid(), 18, '自分の周りには尊敬できる素晴らしい人がいて、何かあればすぐに相談できますか？', 'sportsmanship', 'cooperation', 'all', true, true),
-- 自己受容・自然体 - 5問
(gen_random_uuid(), 19, '尊敬する人がいてその人の言うことに影響を受けていますか？', 'sportsmanship', 'natural_acceptance', 'all', true, true),
(gen_random_uuid(), 20, '出身校や記録などを人に話すことがありますか？', 'sportsmanship', 'natural_acceptance', 'all', true, true),
(gen_random_uuid(), 21, '憧れている人がいて髪型や服装・話し方などを真似ることがありますか？', 'sportsmanship', 'natural_acceptance', 'all', true, true),
(gen_random_uuid(), 22, 'すごくつらい時にもあえて笑って過ごすようにしていますか？', 'sportsmanship', 'natural_acceptance', 'all', true, true),
(gen_random_uuid(), 23, 'とても怒っているのにあえて丁寧に接することがありますか？', 'sportsmanship', 'natural_acceptance', 'all', true, true),
-- 非合理性・非論理性 - 6問
(gen_random_uuid(), 24, '自分の長所短所は説明することができますか？', 'sportsmanship', 'non_rationality', 'all', true, true),
(gen_random_uuid(), 25, '何が問題かを把握して理解することが重要だと思いますか？', 'sportsmanship', 'non_rationality', 'all', true, true),
(gen_random_uuid(), 26, '手順をしっかり学んで取り組みたいと思いますか？', 'sportsmanship', 'non_rationality', 'all', true, true),
(gen_random_uuid(), 27, '物事は捉え方次第だと思いますか？', 'sportsmanship', 'non_rationality', 'all', true, true),
(gen_random_uuid(), 28, '自分の行動や選択はいい方向にいくと思いますか？', 'sportsmanship', 'non_rationality', 'all', true, true),
(gen_random_uuid(), 29, '自分と同じ考えをしている人が多いと安心しますか？', 'sportsmanship', 'non_rationality', 'all', true, true);
