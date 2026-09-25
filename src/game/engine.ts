import { BALANCE, careOptions, EVENTS, exerciseModels, muscleLabels, trainingPresets } from './config'
import { shuffled } from './random'
import type { Athlete, Category, ContestScore, Effect, ExerciseQuality, GameState, Mental, MuscleKey, Muscles, Personality, WeekReport, WeeklyPlan } from './types'

const keys = Object.keys(muscleLabels) as MuscleKey[]
export const clamp = (n:number, min=0, max=100) => Math.min(max, Math.max(min, n))
const round = (n:number, digits=1) => Number(n.toFixed(digits))
const avg = (values:number[]) => values.reduce((a,b)=>a+b,0) / values.length

export function defaultAthlete(name='高橋 蓮', personality: Personality='earnest'): Athlete {
  return { name, age: 24, personality, weight: 72, fatMass: 11.5, bmr: 1680, condition: 78, fatigue: 18, injuryRisk: 8,
    muscles: { chest: 53, back: 51, shoulders: 48, arms: 49, abs: 47, legs: 50 },
    mental: { motivation: 76, stress: 24, confidence: 45, trust: 60, dietAdherence: 82, trainingAdherence: 84 }, form: 52, grip: 51 }
}

export function defaultPlan(): WeeklyPlan {
  return { diet: { calories: 2450, protein: 155, fat: 65, carbs: 315 }, training: structuredClone(trainingPresets.balanced.plan), care: null }
}

export function createGame(category: Category, name: string, personality: Personality, seed=Date.now() % 2147483647): GameState {
  const shuffledEvents = shuffled(EVENTS.map(e=>e.id), seed)
  const weekOrder = shuffled([1,2,3,4,5,6,7,8,9,10,11], shuffledEvents.state)
  const eventSchedule: Record<number,string> = {}
  weekOrder.items.slice(0,7).sort((a,b)=>a-b).forEach((week,i)=> { eventSchedule[week] = shuffledEvents.items[i] })
  return { version:1, seed, rngState: shuffledEvents.state, week:1, category, athlete:defaultAthlete(name, personality), plan:defaultPlan(), eventSchedule,
    pendingEventId:null, lastReport:null, history:[], contest:null, createdAt:new Date().toISOString() }
}

export function derivedAbilities(a: Athlete) {
  return {
    lowerStability: clamp(a.muscles.legs * .72 + a.muscles.abs * .28 - a.fatigue * .12),
    coreStability: clamp(a.muscles.abs * .68 + a.muscles.back * .22 + a.form * .1 - a.fatigue * .1),
    grip: clamp(a.grip - a.fatigue * .08), form: clamp(a.form - a.fatigue * .1),
  }
}

export function exerciseQualities(a: Athlete): ExerciseQuality[] {
  const d = derivedAbilities(a), fatiguePenalty = round(a.fatigue * .18,0)
  const values = { upperPush:avg([a.muscles.chest,a.muscles.arms,a.muscles.shoulders]), backLegs:avg([a.muscles.back,a.muscles.legs]),
    shoulderArms:avg([a.muscles.shoulders,a.muscles.arms]), backArms:avg([a.muscles.back,a.muscles.arms]), legs:a.muscles.legs,
    lowerStability:d.lowerStability, core:d.coreStability, grip:d.grip, form:d.form }
  return exerciseModels.map(model=>{
    const factors=model.factors.map(f=>({...f,value:values[f.source]}))
    const bodyWeightPenalty=model.bodyWeightPenalty?Math.max(0,a.weight-75)*.35:0
    return { name:model.name, factors:factors.map(f=>({label:f.label,value:round(f.value,0)})), fatiguePenalty,
      quality:round(clamp(factors.reduce((sum,f)=>sum+f.value*f.weight,0)-fatiguePenalty-bodyWeightPenalty),0) }
  })
}

export function applyEffect(a: Athlete, effect: Partial<Effect>): Athlete {
  const m = a.mental
  return { ...a, condition:clamp(a.condition+(effect.condition??0)), fatigue:clamp(a.fatigue+(effect.fatigue??0)),
    mental:{ ...m, stress:clamp(m.stress+(effect.stress??0)), motivation:clamp(m.motivation+(effect.motivation??0)), confidence:clamp(m.confidence+(effect.confidence??0)), trust:clamp(m.trust+(effect.trust??0)), dietAdherence:clamp(m.dietAdherence+(effect.dietAdherence??0)), trainingAdherence:clamp(m.trainingAdherence+(effect.trainingAdherence??0)) }}
}

export function simulateWeek(state: GameState): GameState {
  const a = state.athlete, p = state.plan, beforeWeight = a.weight
  const dietAdherence = clamp(a.mental.dietAdherence - a.mental.stress*.12 + a.mental.motivation*.08, 45, 100)/100
  const trainingAdherence = clamp(a.mental.trainingAdherence - a.fatigue*.18 + a.mental.motivation*.07, 35, 100)/100
  const totalVolume = keys.reduce((s,k)=>s+p.training.volumes[k],0)
  const actualCalories = p.diet.calories*dietAdherence + (1-dietAdherence)*2800
  const expenditure = a.bmr + BALANCE.activityCalories + p.training.cardio*BALANCE.cardioCalories + totalVolume*18
  const weeklyBalance = (actualCalories-expenditure)*7
  const fatChange = clamp(weeklyBalance/BALANCE.fatKcalPerKg, -1.15, 1.2)
  const proteinFactor = clamp(p.diet.protein/(a.weight*1.8), .45, 1.12)
  const carbFactor = clamp(p.diet.carbs/(a.weight*3.2), .55, 1.08)
  const fatFactor = clamp(p.diet.fat/(a.weight*.7), .55, 1.05)
  const recovery = clamp((100-a.fatigue)/100 * (p.training.restDays/2.2) * (a.condition/75), .25, 1.3)
  const quality = avg(exerciseQualities(a).map(q=>q.quality))/70
  const muscleChanges = {} as Muscles
  let totalMuscle = 0
  for (const k of keys) {
    const volume = p.training.volumes[k]
    const stimulus = Math.min(volume,4) + Math.max(0,volume-4)*.35
    const deficitPenalty = weeklyBalance < -3500 ? .68 : 1
    const delta = stimulus*BALANCE.muscleGainScale*(p.training.intensity/70)*proteinFactor*carbFactor*recovery*quality*trainingAdherence*deficitPenalty
    muscleChanges[k] = round(delta,2); totalMuscle += delta
  }
  const fatigueGain = totalVolume*BALANCE.fatiguePerVolume*(p.training.intensity/70)*trainingAdherence + p.training.cardio*1.4
  const recoveryGain = p.training.restDays*BALANCE.recoveryPerRestDay + BALANCE.weeklyFatigueDecay
  const fatigue = clamp(a.fatigue+fatigueGain-recoveryGain)
  const extremeDiet = p.diet.calories < BALANCE.calorieSafeMin || p.diet.calories > BALANCE.calorieSafeMax || fatFactor < .7
  const condition = clamp(a.condition + (fatFactor-.8)*5 + p.training.restDays*1.2 - fatigueGain*.15 - (extremeDiet?8:0))
  let mental: Mental = { ...a.mental,
    stress:clamp(a.mental.stress + totalVolume*.18 - p.training.restDays*2.4 + (extremeDiet?7:0)),
    motivation:clamp(a.mental.motivation + (Math.abs(fatChange)<.8?2:-3)),
    dietAdherence:clamp(a.mental.dietAdherence + (extremeDiet?-6:1)), trainingAdherence:clamp(a.mental.trainingAdherence + (fatigue>75?-7:1)),
    confidence:clamp(a.mental.confidence + totalMuscle*4 - (fatigue>75?4:0)), trust:a.mental.trust,
  }
  const care = careOptions.find(c=>c.id===p.care)
  if (care) {
    const effect = care.effects[a.personality]
    mental = { ...mental, motivation:clamp(mental.motivation+effect*.55), trust:clamp(mental.trust+effect*.65), stress:clamp(mental.stress-effect*.5) }
  }
  if (p.care==='rest') { mental.trainingAdherence=clamp(mental.trainingAdherence-2) }
  const newMuscles = { ...a.muscles }
  keys.forEach(k=>newMuscles[k]=round(a.muscles[k]+muscleChanges[k],2))
  const athlete: Athlete = { ...a, weight:round(a.weight+fatChange+totalMuscle,2), fatMass:round(clamp(a.fatMass+fatChange,3,35),2),
    bmr:round(a.bmr+totalMuscle*9-fatChange*1.5,0), fatigue:round(fatigue,1), condition:round(condition,1), muscles:newMuscles, mental,
    injuryRisk:round(clamp(fatigue*.55+(100-condition)*.25+(p.training.intensity-70)*.3),1), form:round(clamp(a.form+totalVolume*.035*trainingAdherence),1), grip:round(clamp(a.grip+p.training.volumes.back*.04+p.training.volumes.arms*.03),1) }
  const notes = [fatChange<-.15?'脂肪が減り、仕上がりが進んだ':fatChange>.25?'エネルギー余剰で体重が増えた':'体重はおおむね安定', proteinFactor<.8?'タンパク質不足で成長効率が低下':'タンパク質は成長を支えた', fatigue>70?'疲労が高い。次週は回復案を検討':'回復は管理範囲内']
  const report: WeekReport = { week:state.week,beforeWeight,afterWeight:athlete.weight,fatChange:round(fatChange,2),muscleChanges,notes,qualities:exerciseQualities(athlete) }
  return { ...state, athlete, lastReport:report, pendingEventId:state.eventSchedule[state.week]??null }
}

export function resolveEvent(state:GameState, choiceId:string):GameState {
  const event = EVENTS.find(e=>e.id===state.pendingEventId), choice = event?.choices.find(c=>c.id===choiceId)
  if (!event || !choice || !state.lastReport) return state
  let athlete = applyEffect(state.athlete,choice.effects)
  if (choice.effects.calories) {
    const fat = choice.effects.calories/BALANCE.fatKcalPerKg
    athlete={...athlete,weight:round(athlete.weight+fat,2),fatMass:round(athlete.fatMass+fat,2)}
  }
  return {...state,athlete,pendingEventId:null,lastReport:{...state.lastReport,eventSummary:`${event.title}：「${choice.label}」を選択`}}
}

export function scoreContest(state:GameState):ContestScore {
  const a=state.athlete, m=a.muscles, d=derivedAbilities(a), fatPct=a.fatMass/a.weight*100
  const leanness=clamp(108-fatPct*4.2), condition=clamp(a.condition-a.fatigue*.25), pose=clamp(a.form*.65+a.mental.confidence*.35)
  const balance=clamp(100-(Math.max(...keys.map(k=>m[k]))-Math.min(...keys.map(k=>m[k])))*3)
  const definitions = state.category==='bodybuilding' ? [
    ['全身の筋量',avg(keys.map(k=>m[k])),.22],['部位間のバランス',balance,.16],['脚',m.legs,.18],['体脂肪・仕上がり',leanness,.2],['ポージング',pose,.12],['当日のコンディション',condition,.12]
  ] : [
    ['肩幅',m.shoulders,.2],['背中と逆三角形',m.back*.72+(100-Math.max(55,m.abs))*.1+d.coreStability*.18,.2],['ウエストライン',leanness*.62+m.abs*.38,.18],['上半身のバランス',avg([m.chest,m.back,m.shoulders,m.arms])*.72+balance*.28,.16],['体脂肪・仕上がり',leanness,.16],['ステージ上の自信',a.mental.confidence*.65+pose*.35,.1]
  ]
  const items=definitions.map(([label,score,weight])=>({label:label as string,score:round(clamp(score as number),0),weight:weight as number}))
  const total=round(items.reduce((s,i)=>s+i.score*i.weight,0),0), rank=total>=82?1:total>=74?2:total>=66?3:total>=57?5:8
  const sorted=[...items].sort((x,y)=>y.score-x.score)
  const praise=[`${sorted[0].label}（${sorted[0].score}点）は育成判断の成果です。`, m.legs>=53?'脚の土台が複合種目の安定を支えました。':'計画を12週間継続したことが舞台上の自信につながりました。']
  const improvements=[`${sorted.at(-1)!.label}（${sorted.at(-1)!.score}点）を次回の重点課題に。`,a.fatigue>50?'大会週の疲労が残りました。終盤に回復週を入れましょう。':'より早い段階で弱点へ刺激を配分しましょう。']
  return {total,rank,items,praise,improvements,nextPlan:state.category==='bodybuilding'?'脚を含む全身の均整と終盤の仕上がりを両立する12週間へ。':'肩・背中を伸ばしつつ、脚と体幹の土台を維持する方針がおすすめです。'}
}

export function advanceWeek(state:GameState):GameState {
  if (state.week>=12) return {...state,contest:scoreContest(state),history:state.lastReport?[...state.history,state.lastReport]:state.history}
  return {...state,week:state.week+1,history:state.lastReport?[...state.history,state.lastReport]:state.history,lastReport:null,plan:{...state.plan,care:null}}
}
