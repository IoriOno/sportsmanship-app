#backend/app/utils/athlete_type_algorithm.py

"""
アスリートタイプ判定アルゴリズム
5つのアスリートタイプを判定するシステム
"""

# 各アスリートタイプの資質優先順位（重み付け）
ATHLETE_TYPE_WEIGHTS = {
    'striker': {  # ストライカータイプ
        'results_oriented': 10,    # 結果重視
        'assertive': 9,           # 主張
        'intuitive': 8,           # 直感
        'steady': 7,              # 堅実
        'self_control': 6,        # 克己
        'comparative': 5,         # 比較
        'devoted': 4,             # 献身
        'detail_oriented': 3,     # こだわり
        'sensitive': 2,           # 繊細
        'introspective': 1        # 内省
    },
    'attacker': {  # アタッカータイプ
        'results_oriented': 10,   # 結果重視
        'assertive': 9,          # 主張
        'intuitive': 8,          # 直感
        'self_control': 7,       # 克己
        'comparative': 6,        # 比較
        'steady': 5,             # 堅実
        'devoted': 4,            # 献身
        'sensitive': 3,          # 繊細
        'detail_oriented': 2,    # こだわり
        'introspective': 1       # 内省
    },
    'gamemaker': {  # ゲームメイカータイプ
        'steady': 10,            # 堅実
        'introspective': 9,      # 内省
        'devoted': 8,            # 献身
        'comparative': 7,        # 比較
        'assertive': 6,          # 主張
        'detail_oriented': 5,    # こだわり
        'intuitive': 4,          # 直感
        'sensitive': 3,          # 繊細
        'self_control': 2,       # 克己
        'results_oriented': 1    # 結果重視
    },
    'defender': {  # ディフェンダータイプ
        'steady': 10,            # 堅実
        'devoted': 9,            # 献身
        'sensitive': 8,          # 繊細
        'introspective': 7,      # 内省
        'comparative': 6,        # 比較
        'self_control': 5,       # 克己
        'assertive': 4,          # 主張
        'detail_oriented': 3,    # こだわり
        'results_oriented': 2,   # 結果重視
        'intuitive': 1           # 直感
    },
    'anchor': {  # アンカータイプ
        'steady': 10,            # 堅実
        'devoted': 9,            # 献身
        'introspective': 8,      # 内省
        'sensitive': 7,          # 繊細
        'self_control': 6,       # 克己
        'comparative': 5,        # 比較
        'detail_oriented': 4,    # こだわり
        'assertive': 3,          # 主張
        'results_oriented': 2,   # 結果重視
        'intuitive': 1           # 直感
    }
}

# アスリートタイプの説明文（対象別）
ATHLETE_TYPE_DESCRIPTIONS = {
    'striker': {
        'player': "ストライカー的な気質とは、試合で積極的にゴールを狙い、決定的なチャンスを自分で作り出す姿勢です。常に結果を意識し、前進し続ける力です。",
        'coach': "ストライカー的な気質とは、指導者として、目標に向かって積極的に戦術を練り、試合の中でチャンスをつかみ、選手を勝利に導く力です。自分から結果を出すために行動することが大切です。",
        'mother': "ストライカー的な気質とは、母親として、子どもが進むべき方向を示し、結果を出すために自分から積極的に行動する姿勢です。困難を乗り越えるために、目標を持ち挑戦し続けることが重要です。",
        'father': "ストライカー的な気質とは、父親として、自分の行動で家庭を引っ張り、目標達成に向けて結果を出すために積極的に動く力です。困難に直面しても、目標に向かって前進し続ける姿勢が求められます。",
        'adult': "ストライカー的な気質とは、仕事で自ら積極的に目標を設定し、その達成に向けて結果を出すために行動を起こす力です。挑戦に前向きに取り組み、失敗を恐れず成功を狙い続けます。"
    },
    'attacker': {
        'player': "アタッカー的な気質とは、目標に向かって自ら動く力です。常に自分から行動し、結果を出すために最前線で戦う姿勢が求められます。",
        'coach': "アタッカー的な気質とは、積極的に挑戦し、柔軟に変え、結果を出すことに集中します。前向きな態度で選手を鼓舞し、チーム全体を成長させます。",
        'mother': "アタッカー的な気質とは、子どもとの関わりにおいて、物事を前向きに解決しようとする姿勢です。自分から進んで行動し、子どもに対して積極的に関わることで、生活や成長においてチャンスを引き寄せます。",
        'father': "アタッカー的な気質とは、父親として、家庭内で積極的に問題を解決し、行動する姿勢です。困難を乗り越えるために最前線で動き、必要な決断を自ら下す力です。自分から前進することで、家庭の中でも目標に向かって動き続けます。",
        'adult': "アタッカー的な気質とは、仕事において積極的に新しい挑戦を受け入れ、目標に向かって自分から行動を起こす力です。問題に直面しても自分から解決策を見出し、積極的に行動することで結果を出す姿勢が求められます。"
    },
    'gamemaker': {
        'player': "ゲームメイカー的な気質とは、全体的な流れを把握し、状況に応じて最適なアクションを選ぶ力です。自分一人でなく、チーム全体の動きや役割を調整し、攻守のバランスを保ちながら、全体が目標に向かって進むようにサポートします。",
        'coach': "ゲームメイカー的な気質とは、選手一人ひとりの特性を活かしながら、全体の調和を保つために戦術を立て、成功に向けて導く力です。職場やチームでの調整役として、周囲をうまくまとめ、全体を効率的に動かすために行動する力が求められます。",
        'mother': "ゲームメイカー的な気質とは、家庭内で冷静に状況を見守り、家族全体が機能するように調整する力です。子どもが直面する様々な挑戦や家庭内での課題に対して、冷静に問題を把握し、解決策を提供する役割を果たします。",
        'father': "ゲームメイカー的な気質とは、家庭や仕事において冷静に状況を把握し、家族全体やチームの調和を保ちながら目標に向かって進む力です。父親は家庭内でリーダーシップを発揮し、家族全員がスムーズに機能するよう調整役を担います。",
        'adult': "ゲームメイカー的な気質とは、職場での調整役として、全体の流れを把握し、目標に向かって効率的に進むように周囲をサポートする力です。チーム全体の目標を達成するために、適切なタイミングで必要なアクションを取る役割が求められます。"
    },
    'defender': {
        'player': "ディフェンダー的な気質とは、問題が起こる前に予測し、冷静に対応する力です。スポーツ選手が戦うにあたって相手の攻撃を止めるように、日常生活でも困難に備えて事前に準備し、問題が起きたときに冷静に解決策を見つけて対処します。",
        'coach': "ディフェンダー的な気質とは、選手の成長を守るために計画的に指導し、リスク管理を徹底します。日常の仕事でも、リスクや問題を予測し、冷静に対応する能力が求められます。",
        'mother': "ディフェンダー的な気質とは、予測できる問題に備えて準備をし、冷静に対応する姿勢です。子どもが困難に直面しても支え、落ち着いて解決策を示す力です。",
        'father': "ディフェンダー的な気質とは、家庭内で積極的に問題を予測し、解決策を見出すことです。冷静さと堅実さを持ち、家族全体の安定を守るために行動します。",
        'adult': "ディフェンダー的な気質とは、仕事において予測可能な問題に備え、計画的に行動する力です。困難に直面しても冷静に対応し、チームとして問題解決に取り組む姿勢が重要です。"
    },
    'anchor': {
        'player': "アンカー的な気質とは、試合中に冷静に状況を把握し、チーム全体の安定を保ちながら調整する力です。攻守のバランスを取り、状況に応じて柔軟に対応します。プレッシャーのかかる場面でも冷静さを保ち、チームメイトをサポートする役割が求められます。",
        'coach': "アンカー的な気質とは、選手をサポートし、チーム全体のバランスを保ちながら冷静に状況を調整する力です。試合中にプレーの流れを見ながら最適な戦術を選び、選手が能力を最大限に発揮できるように導きます。",
        'mother': "アンカー的な気質とは、家庭内で冷静に状況を把握し、子どもの成長をサポートする力です。問題が発生したときに柔軟に対応し、家庭全体の安定を保つために必要な調整を行います。",
        'father': "アンカー的な気質とは、家庭内で冷静に調整を行い、安定した環境を提供する姿勢です。仕事や家庭の状況を把握し、チーム全体のバランスを取るように行動します。",
        'adult': "アンカー的な気質とは、職場で冷静に状況を見守り、組織の安定を保つために調整を行う力です。急な変化や問題が発生しても、冷静に対応し、必要なサポートを提供してチーム全体を支えます。"
    }
}

def calculate_athlete_type_scores(athlete_mind_scores):
    """
    アスリートマインドスコアからアスリートタイプスコアを計算
    
    Args:
        athlete_mind_scores (dict): アスリートマインドの各資質スコア
            例: {'results_oriented': 45, 'assertive': 38, ...}
    
    Returns:
        dict: 各アスリートタイプのスコア
    """
    type_scores = {}
    
    for athlete_type, weights in ATHLETE_TYPE_WEIGHTS.items():
        total_score = 0
        max_possible_score = 0
        
        for resource, weight in weights.items():
            if resource in athlete_mind_scores:
                # 重み付きスコア計算（スコア * 重み）
                total_score += athlete_mind_scores[resource] * weight
                # 最大可能スコア計算（50点 * 重み）  
                max_possible_score += 50 * weight
        
        # パーセンテージで正規化（0-100%）
        if max_possible_score > 0:
            type_scores[athlete_type] = round((total_score / max_possible_score) * 100, 1)
        else:
            type_scores[athlete_type] = 0.0
    
    return type_scores

def determine_primary_athlete_type(type_scores):
    """
    最も高いスコアのアスリートタイプを判定
    
    Args:
        type_scores (dict): 各アスリートタイプのスコア
    
    Returns:
        str: 最も適合するアスリートタイプ
    """
    if not type_scores:
        return 'gamemaker'  # デフォルト
    
    return max(type_scores, key=type_scores.get)

def get_athlete_type_description(athlete_type, target):
    """
    アスリートタイプの説明文を取得
    
    Args:
        athlete_type (str): アスリートタイプ
        target (str): 対象（player, coach, mother, father, adult）
    
    Returns:
        str: 説明文
    """
    return ATHLETE_TYPE_DESCRIPTIONS.get(athlete_type, {}).get(target, "")

def analyze_athlete_type(athlete_mind_scores, target):
    """
    アスリートタイプ分析の統合関数
    
    Args:
        athlete_mind_scores (dict): アスリートマインドスコア
        target (str): 対象
    
    Returns:
        dict: 分析結果
    """
    # タイプスコア計算
    type_scores = calculate_athlete_type_scores(athlete_mind_scores)
    
    # 主要タイプ判定
    primary_type = determine_primary_athlete_type(type_scores)
    
    # 説明文取得
    description = get_athlete_type_description(primary_type, target)
    
    # タイプ名の日本語変換
    type_names = {
        'striker': 'ストライカー',
        'attacker': 'アタッカー', 
        'gamemaker': 'ゲームメイカー',
        'defender': 'ディフェンダー',
        'anchor': 'アンカー'
    }
    
    return {
        'primary_type': primary_type,
        'primary_type_name': type_names.get(primary_type, primary_type),
        'type_scores': type_scores,
        'description': description,
        'target': target
    }

def get_athlete_types_list():
    """
    利用可能なアスリートタイプ一覧を取得
    
    Returns:
        list: アスリートタイプリスト
    """
    return [
        {"id": "striker", "name": "ストライカー"},
        {"id": "attacker", "name": "アタッカー"},
        {"id": "gamemaker", "name": "ゲームメイカー"},
        {"id": "defender", "name": "ディフェンダー"},
        {"id": "anchor", "name": "アンカー"}
    ]