import { describe, expect, it } from 'vitest'
import { advanceWeek, createGame, derivedAbilities, exerciseQualities, resolveEvent, scoreContest, simulateWeek } from './engine'
import { loadGame, saveGame, SAVE_KEY } from './storage'
import type { GameState } from './types'

const readyGame = (category:'bodybuilding'|'physique'='bodybuilding') => {
  const game=createGame(category,'テスト選手','analytical',12345)
  game.plan.care='explain'
  return game
}

describe('身体変化',()=>{
  it('カロリー収支が高いほど体重と脂肪が増える',()=>{
    const low=readyGame(), high=readyGame()
    low.plan.diet.calories=1700; high.plan.diet.calories=3400
    const lowResult=simulateWeek(low), highResult=simulateWeek(high)
    expect(highResult.athlete.weight).toBeGreaterThan(lowResult.athlete.weight)
    expect(highResult.athlete.fatMass).toBeGreaterThan(lowResult.athlete.fatMass)
  })

  it('十分なタンパク質と炭水化物が筋成長を補正する',()=>{
    const poor=readyGame(), good=readyGame()
    poor.plan.diet.protein=65; poor.plan.diet.carbs=100
    good.plan.diet.protein=170; good.plan.diet.carbs=330
    expect(simulateWeek(good).lastReport!.muscleChanges.chest).toBeGreaterThan(simulateWeek(poor).lastReport!.muscleChanges.chest)
  })

  it('部位別ボリュームは対象部位の成長へ反映される',()=>{
    const game=readyGame()
    game.plan.training.volumes.chest=5; game.plan.training.volumes.arms=0
    const report=simulateWeek(game).lastReport!
    expect(report.muscleChanges.chest).toBeGreaterThan(report.muscleChanges.arms)
  })

  it('脚と体幹がベンチなど複合種目の品質へ影響する',()=>{
    const weak=readyGame(), strong=readyGame()
    weak.athlete.muscles.legs=25; weak.athlete.muscles.abs=25
    strong.athlete.muscles.legs=80; strong.athlete.muscles.abs=80
    expect(derivedAbilities(strong.athlete).lowerStability).toBeGreaterThan(derivedAbilities(weak.athlete).lowerStability)
    const bench=(g:GameState)=>exerciseQualities(g.athlete).find(q=>q.name==='ベンチプレス')!.quality
    expect(bench(strong)).toBeGreaterThan(bench(weak))
  })

  it('高負荷は疲労を増やし、休養計画は疲労を回復させる',()=>{
    const hard=readyGame(), rest=readyGame()
    Object.keys(hard.plan.training.volumes).forEach(k=>hard.plan.training.volumes[k as keyof typeof hard.plan.training.volumes]=5)
    hard.plan.training.intensity=92; hard.plan.training.restDays=1
    Object.keys(rest.plan.training.volumes).forEach(k=>rest.plan.training.volumes[k as keyof typeof rest.plan.training.volumes]=1)
    rest.plan.training.intensity=45; rest.plan.training.restDays=5
    expect(simulateWeek(hard).athlete.fatigue).toBeGreaterThan(simulateWeek(rest).athlete.fatigue)
  })

  it('メンタル悪化により遵守率とトレーニング成果が下がる',()=>{
    const stable=readyGame(), strained=readyGame()
    strained.athlete.mental.stress=95; strained.athlete.mental.motivation=10; strained.athlete.mental.trainingAdherence=45
    strained.athlete.mental.dietAdherence=45
    const stableResult=simulateWeek(stable), strainedResult=simulateWeek(strained)
    expect(stableResult.lastReport!.muscleChanges.back).toBeGreaterThan(strainedResult.lastReport!.muscleChanges.back)
    expect(strainedResult.athlete.weight).not.toBe(stableResult.athlete.weight)
  })
})

describe('イベント・大会・進行',()=>{
  it('イベント選択の効果が選手へ反映される',()=>{
    const game=simulateWeek({...readyGame(),eventSchedule:{1:'overtime'}})
    const before=game.athlete.fatigue
    const result=resolveEvent(game,'skip')
    expect(result.athlete.fatigue).toBeLessThan(before)
    expect(result.lastReport!.eventSummary).toContain('睡眠を最優先')
  })

  it('カテゴリごとに評価項目と得点が異なる',()=>{
    const body=readyGame('bodybuilding'), physique=readyGame('physique')
    body.athlete.muscles.legs=90; physique.athlete={...body.athlete,muscles:{...body.athlete.muscles}}
    const b=scoreContest(body), p=scoreContest(physique)
    expect(b.items.some(i=>i.label==='脚')).toBe(true)
    expect(p.items.some(i=>i.label==='肩幅')).toBe(true)
    expect(b.total).not.toBe(p.total)
  })

  it('保存したゲームを同じ内容で読み込める',()=>{
    const memory=new Map<string,string>()
    const storage={setItem:(k:string,v:string)=>memory.set(k,v),getItem:(k:string)=>memory.get(k)??null,removeItem:(k:string)=>memory.delete(k)}
    const game=readyGame(); saveGame(game,storage)
    expect(memory.has(SAVE_KEY)).toBe(true)
    expect(loadGame(storage)).toEqual(game)
  })

  it('12週間を最後まで進行し大会結果を生成できる',()=>{
    let game=readyGame()
    for(let week=1;week<=12;week++){
      game=simulateWeek(game)
      if(game.pendingEventId){
        const id=game.pendingEventId
        const choiceId=id==='overtime'?'short':'adjust'
        const eventChoiceId = id==='dinner'?choiceId:({drinks:'early',trip:'bodyweight',holiday:'half',friends:'tell',family:'portion',success:'quiet'} as Record<string,string>)[id] ?? 'short'
        game=resolveEvent(game,eventChoiceId)
      }
      game=advanceWeek(game)
    }
    expect(game.history).toHaveLength(12)
    expect(game.contest).not.toBeNull()
    expect(game.contest!.items).toHaveLength(6)
  })

  it('同じシードならイベント日程を再現できる',()=>{
    expect(createGame('bodybuilding','A','earnest',777).eventSchedule).toEqual(createGame('bodybuilding','A','earnest',777).eventSchedule)
    expect(Object.keys(createGame('bodybuilding','A','earnest',777).eventSchedule)).toHaveLength(7)
  })
})
