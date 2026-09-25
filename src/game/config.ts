import type { CareId, Category, LifeEvent, MuscleKey, Muscles, Personality, TrainingPlan, TrainingPreset } from './types'

export const muscleLabels: Record<MuscleKey, string> = { chest: '胸', back: '背中', shoulders: '肩', arms: '腕', abs: '腹部', legs: '脚' }
export const personalityLabels: Record<Personality, string> = { earnest: 'まじめで努力家', sensitive: '繊細で共感を重視', analytical: '論理派・数値好き' }
export const categoryLabels: Record<Category, string> = { bodybuilding: 'ボディビル', physique: 'メンズフィジーク' }

const volumes = (chest:number, back:number, shoulders:number, arms:number, abs:number, legs:number): Muscles => ({ chest, back, shoulders, arms, abs, legs })
export const trainingPresets: Record<TrainingPreset, { name: string; desc: string; plan: TrainingPlan }> = {
  balanced: { name: '全身バランス型', desc: '各部位を均等に伸ばす標準案', plan: { volumes: volumes(3,3,3,2,2,3), intensity: 72, cardio: 2, restDays: 2, preset: 'balanced' } },
  upper: { name: '上半身重点型', desc: '肩・背中・胸へ集中。脚の土台は維持', plan: { volumes: volumes(4,4,4,3,2,1), intensity: 76, cardio: 2, restDays: 2, preset: 'upper' } },
  foundation: { name: '脚・土台強化型', desc: '脚と体幹を伸ばして複合種目を安定', plan: { volumes: volumes(2,3,2,2,4,5), intensity: 74, cardio: 1, restDays: 2, preset: 'foundation' } },
  weakpoint: { name: '弱点部位集中型', desc: '現在もっとも低い部位に追加刺激', plan: { volumes: volumes(3,3,3,3,3,3), intensity: 78, cardio: 1, restDays: 2, preset: 'weakpoint' } },
  cut: { name: '減量・有酸素重視型', desc: '消費を増やし仕上がりを優先', plan: { volumes: volumes(2,2,3,2,3,2), intensity: 66, cardio: 5, restDays: 2, preset: 'cut' } },
  recovery: { name: '回復優先型', desc: '疲労を抜き、体調と継続性を整える', plan: { volumes: volumes(1,1,1,1,1,1), intensity: 50, cardio: 1, restDays: 4, preset: 'recovery' } },
}

export const careOptions: { id: CareId; name: string; desc: string; best: Personality; effects: Record<Personality, number> }[] = [
  { id: 'strict', name: '厳しく指摘する', desc: '規律を戻すが、ストレスが増えることも', best: 'earnest', effects: { earnest: 8, sensitive: -7, analytical: 2 } },
  { id: 'listen', name: '共感して話を聞く', desc: 'ストレスをほどき、信頼を育てる', best: 'sensitive', effects: { earnest: 4, sensitive: 10, analytical: 3 } },
  { id: 'explain', name: '数値と目標を説明', desc: '計画の意味を共有して納得感を高める', best: 'analytical', effects: { earnest: 6, sensitive: 2, analytical: 10 } },
  { id: 'rest', name: '思い切って休ませる', desc: '疲労を回復。刺激量は少し落ちる', best: 'sensitive', effects: { earnest: 2, sensitive: 8, analytical: 5 } },
  { id: 'treat', name: '好きな食事を計画的に認める', desc: '継続性を高める代わりに少し摂取増', best: 'earnest', effects: { earnest: 7, sensitive: 7, analytical: 4 } },
]

export const EVENTS: LifeEvent[] = [
  { id:'dinner', title:'取引先との会食', story:'大切な取引先からコース料理へ招かれた。仕事の評価にも関わりそうだ。', choices:[
    { id:'join', label:'会食を楽しむ', detail:'関係を優先。摂取は増えるがストレス軽減', effects:{ calories:1800, stress:-8, motivation:4, dietAdherence:-5 } },
    { id:'adjust', label:'昼食を調整して参加', detail:'準備で両立。少し疲れる', effects:{ calories:700, fatigue:3, confidence:4, dietAdherence:3 } },
    { id:'decline', label:'大会を理由に断る', detail:'計画は守れるが仕事の緊張が残る', effects:{ stress:7, dietAdherence:7, trust:-2 } },
  ]},
  { id:'drinks', title:'職場の飲み会', story:'新人歓迎会の幹事を任された。先輩との距離を縮める機会でもある。', choices:[
    { id:'full', label:'最後まで付き合う', detail:'人間関係を優先', effects:{ calories:2200, fatigue:9, stress:-7, motivation:5 } },
    { id:'early', label:'一次会で帰る', detail:'ほどよく参加', effects:{ calories:900, fatigue:3, stress:-3, dietAdherence:2 } },
    { id:'zero', label:'ノンアルで盛り上げる', detail:'摂取を抑えるが少し気疲れ', effects:{ calories:400, fatigue:2, stress:3, confidence:3 } },
  ]},
  { id:'overtime', title:'突発的な残業', story:'納期直前のトラブル。今週は二晩、帰宅が遅くなりそうだ。', choices:[
    { id:'push', label:'トレーニングも予定通り', detail:'規律は保つが疲労が大きい', effects:{ fatigue:14, condition:-7, trainingAdherence:3 } },
    { id:'short', label:'短時間メニューへ変更', detail:'成長と回復の中間案', effects:{ fatigue:5, trainingAdherence:-5, confidence:3 } },
    { id:'skip', label:'睡眠を最優先', detail:'刺激を諦めて回復', effects:{ fatigue:-8, trainingAdherence:-12, stress:-4 } },
  ]},
  { id:'trip', title:'地方出張', story:'二泊の出張が決定。ホテルにジムはなく、食事も外食中心だ。', choices:[
    { id:'bodyweight', label:'自重トレとコンビニ食で工夫', detail:'手間はかかるが計画に近づける', effects:{ fatigue:5, stress:5, dietAdherence:-3, trainingAdherence:-5, confidence:6 } },
    { id:'work', label:'仕事に集中する', detail:'思い切って今週は軽くする', effects:{ fatigue:-3, trainingAdherence:-15, motivation:-3 } },
    { id:'walk', label:'食事を楽しみ、よく歩く', detail:'摂取は増えるが気分転換', effects:{ calories:1300, stress:-9, motivation:5 } },
  ]},
  { id:'holiday', title:'休日出勤', story:'休養日に急なヘルプ依頼。断れば同僚の負担が増えてしまう。', choices:[
    { id:'help', label:'引き受ける', detail:'仕事を優先し、疲れが残る', effects:{ fatigue:10, stress:5, motivation:-3 } },
    { id:'half', label:'午前だけ手伝う', detail:'時間を区切って両立', effects:{ fatigue:4, stress:2, trainingAdherence:-4 } },
    { id:'decline', label:'今回は断る', detail:'休養を確保するが少し罪悪感', effects:{ fatigue:-5, stress:4, condition:5 } },
  ]},
  { id:'friends', title:'友人との小旅行', story:'以前から約束していた温泉旅行。大会準備の話はまだしていない。', choices:[
    { id:'go', label:'気にせず満喫する', detail:'大きく回復するが食事は乱れる', effects:{ calories:1800, fatigue:-8, stress:-14, motivation:7 } },
    { id:'tell', label:'事情を話して調整する', detail:'友人に協力してもらう', effects:{ calories:500, stress:-6, trust:4, dietAdherence:3 } },
    { id:'cancel', label:'旅行を見送る', detail:'計画は完璧だが孤独を感じる', effects:{ stress:10, motivation:-7, dietAdherence:8 } },
  ]},
  { id:'family', title:'家族との食事', story:'実家から「たまには帰っておいで」と連絡。好物を用意してくれるらしい。', choices:[
    { id:'eat', label:'好物をいただく', detail:'心は満たされる', effects:{ calories:1200, stress:-10, motivation:5 } },
    { id:'portion', label:'量を相談する', detail:'説明して理解を得る', effects:{ calories:400, confidence:5, dietAdherence:4 } },
    { id:'mealprep', label:'自分の食事を持参', detail:'計画優先。家族は少し寂しそう', effects:{ dietAdherence:9, stress:4, motivation:-2 } },
  ]},
  { id:'success', title:'仕事で大きな成果', story:'担当した提案が採用された。チームからお祝いの声が上がる。', choices:[
    { id:'celebrate', label:'みんなで祝う', detail:'自信と摂取が増える', effects:{ calories:1000, confidence:10, stress:-8 } },
    { id:'gym', label:'ジムで記録を狙う', detail:'勢いをトレーニングへ', effects:{ fatigue:7, motivation:10, trainingAdherence:6 } },
    { id:'quiet', label:'いつも通り過ごす', detail:'計画を崩さず静かに喜ぶ', effects:{ confidence:6, dietAdherence:4 } },
  ]},
]

export const BALANCE = {
  activityCalories: 560, fatKcalPerKg: 7700, muscleGainScale: 0.022, fatiguePerVolume: 0.72,
  cardioCalories: 95, recoveryPerRestDay: 7, weeklyFatigueDecay: 9, calorieSafeMin: 1500, calorieSafeMax: 3600,
}

export type ExerciseFactorKey = 'upperPush'|'backLegs'|'shoulderArms'|'backArms'|'legs'|'lowerStability'|'core'|'grip'|'form'
export const exerciseModels: { name:string; factors:{label:string;source:ExerciseFactorKey;weight:number}[]; bodyWeightPenalty?:boolean }[] = [
  { name:'ベンチプレス', factors:[{label:'胸・腕の出力',source:'upperPush',weight:.48},{label:'下半身の安定性',source:'lowerStability',weight:.18},{label:'体幹',source:'core',weight:.16},{label:'フォーム習熟度',source:'form',weight:.18}] },
  { name:'デッドリフト', factors:[{label:'背中・脚の出力',source:'backLegs',weight:.4},{label:'体幹',source:'core',weight:.22},{label:'握力',source:'grip',weight:.18},{label:'フォーム習熟度',source:'form',weight:.2}] },
  { name:'オーバーヘッドプレス', factors:[{label:'肩・腕の出力',source:'shoulderArms',weight:.48},{label:'下半身の安定性',source:'lowerStability',weight:.17},{label:'体幹',source:'core',weight:.2},{label:'フォーム習熟度',source:'form',weight:.15}] },
  { name:'バーベルロウ', factors:[{label:'背中・腕の出力',source:'backArms',weight:.45},{label:'下半身の安定性',source:'lowerStability',weight:.15},{label:'体幹',source:'core',weight:.18},{label:'握力',source:'grip',weight:.12},{label:'フォーム習熟度',source:'form',weight:.1}] },
  { name:'スクワット', factors:[{label:'脚の出力',source:'legs',weight:.5},{label:'体幹',source:'core',weight:.25},{label:'フォーム習熟度',source:'form',weight:.25}] },
  { name:'懸垂', bodyWeightPenalty:true, factors:[{label:'背中・腕の出力',source:'backArms',weight:.55},{label:'握力',source:'grip',weight:.25},{label:'フォーム習熟度',source:'form',weight:.2}] },
]
