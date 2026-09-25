import { useEffect, useState } from 'react'
import { Activity, Apple, Brain, ChevronDown, Dumbbell, Info, RotateCcw, Save, Trophy } from 'lucide-react'
import { BodyMap } from './components/BodyMap'
import { Gauge } from './components/Gauge'
import { PrimaryButton, Shell } from './components/Shell'
import { careOptions, categoryLabels, EVENTS, muscleLabels, personalityLabels, trainingPresets } from './game/config'
import { advanceWeek, createGame, derivedAbilities, exerciseQualities, resolveEvent, simulateWeek } from './game/engine'
import { deleteSave, loadGame, saveGame } from './game/storage'
import type { Category, GameState, MuscleKey, Personality, Screen, TrainingPreset } from './game/types'

const muscleKeys=Object.keys(muscleLabels) as MuscleKey[]
const pct=(n:number,d:number)=>Math.round(n/d*1000)/10
const signed=(n:number,suffix='')=>`${n>=0?'+':''}${n.toFixed(2)}${suffix}`

export default function App(){
  const [game,setGame]=useState<GameState|null>(()=>loadGame())
  const [screen,setScreen]=useState<Screen>('title')
  const [draftName,setDraftName]=useState('高橋 蓮')
  const [draftPersonality,setDraftPersonality]=useState<Personality>('earnest')
  const [category,setCategory]=useState<Category>('bodybuilding')
  const [returnScreen,setReturnScreen]=useState<Screen>('home')

  useEffect(()=>{ if(game) saveGame(game) },[game])
  const navigate=(next:Screen)=>setScreen(next)
  const openHelp=()=>{setReturnScreen(screen);setScreen('help')}
  const start=()=>{setGame(createGame(category,draftName.trim()||'高橋 蓮',draftPersonality));setScreen('home')}
  const continueGame=()=>{
    if(!game)return
    setScreen(game.contest?'contest':game.pendingEventId?'event':game.lastReport?'report':'home')
  }
  const reset=()=>{deleteSave();setGame(null);setScreen('profile')}

  if(screen==='title') return <Title hasSave={Boolean(game)} onNew={()=>setScreen('profile')} onContinue={continueGame} onHelp={openHelp}/>
  if(screen==='profile') return <Profile name={draftName} personality={draftPersonality} setName={setDraftName} setPersonality={setDraftPersonality} onBack={()=>setScreen('title')} onNext={()=>setScreen('category')}/>
  if(screen==='category') return <CategorySelect value={category} setValue={setCategory} onBack={()=>setScreen('profile')} onStart={start}/>
  if(screen==='help') return <Help onBack={()=>setScreen(returnScreen)}/>
  if(!game) return null
  if(screen==='diet') return <Diet game={game} update={setGame} back={()=>navigate('home')} help={openHelp}/>
  if(screen==='training') return <Training game={game} update={setGame} back={()=>navigate('home')} help={openHelp}/>
  if(screen==='mental') return <Mental game={game} update={setGame} back={()=>navigate('home')} help={openHelp}/>
  if(screen==='status') return <Status game={game} back={()=>navigate('home')} help={openHelp}/>
  if(screen==='event') return <EventScreen game={game} choose={id=>{setGame(resolveEvent(game,id));navigate('report')}}/>
  if(screen==='report') return <Report game={game} next={()=>{const next=advanceWeek(game);setGame(next);navigate(next.contest?'contest':'home')}}/>
  if(screen==='contest') return <Contest game={game} retry={()=>{setGame(createGame(game.category,game.athlete.name,game.athlete.personality,Date.now()%2147483647));navigate('home')}} reset={reset}/>
  return <Home game={game} navigate={navigate} help={openHelp} simulate={()=>{const next=simulateWeek(game);setGame(next);navigate(next.pendingEventId?'event':'report')}}/>
}

function Title({hasSave,onNew,onContinue,onHelp}:{hasSave:boolean;onNew:()=>void;onContinue:()=>void;onHelp:()=>void}){
  return <div className="title-screen">
    <div className="title-art" aria-hidden="true"><div className="sun"/><div className="athlete-shape"><span/></div><div className="floor-lines"/></div>
    <div className="title-content">
      <p className="kicker">TRAIN. ADAPT. STEP ON STAGE.</p>
      <h1>BODYMAKE<br/><em>12 WEEKS</em></h1>
      <p>新人会社員を鍛え、暮らしの乱れを乗り越えろ。<br/>大会まで、あと12週間。</p>
      <div className="title-actions">{hasSave?<PrimaryButton onClick={onContinue}>続きから</PrimaryButton>:null}<PrimaryButton onClick={onNew} secondary={hasSave}>新しいゲーム</PrimaryButton><button className="text-button" onClick={onHelp}><Info size={17}/>遊び方・免責事項</button></div>
    </div>
  </div>
}

function Profile({name,personality,setName,setPersonality,onBack,onNext}:{name:string;personality:Personality;setName:(v:string)=>void;setPersonality:(v:Personality)=>void;onBack:()=>void;onNext:()=>void}){
  return <Shell title="選手プロフィール" eyebrow="STEP 1 / 2" onBack={onBack} footer={<PrimaryButton onClick={onNext}>出場カテゴリを選ぶ</PrimaryButton>}>
    <section className="intro-card"><span className="number">24</span><div><h2>会社員1年目の新人選手</h2><p>素直で伸びしろ十分。仕事との両立はこれからです。</p></div></section>
    <label className="field"><span>選手名</span><input value={name} maxLength={12} onChange={e=>setName(e.target.value)} /></label>
    <fieldset className="choice-list"><legend>性格</legend>{(Object.keys(personalityLabels) as Personality[]).map(p=><button type="button" className={personality===p?'choice active':'choice'} key={p} onClick={()=>setPersonality(p)}><span className="radio"/><span><strong>{personalityLabels[p]}</strong><small>{p==='earnest'?'厳しさにも応えやすい':p==='sensitive'?'共感でストレスを下げやすい':'数値説明で納得しやすい'}</small></span></button>)}</fieldset>
  </Shell>
}

function CategorySelect({value,setValue,onBack,onStart}:{value:Category;setValue:(v:Category)=>void;onBack:()=>void;onStart:()=>void}){
  return <Shell title="出場カテゴリ" eyebrow="STEP 2 / 2" onBack={onBack} footer={<PrimaryButton onClick={onStart}>12週間を始める</PrimaryButton>}>
    <p className="lead">同じ身体でも、評価されるポイントが変わります。</p>
    <div className="category-grid">
      <button className={value==='bodybuilding'?'category active':'category'} onClick={()=>setValue('bodybuilding')}><div className="category-icon">全</div><div><h2>ボディビル</h2><p>全身の筋量・均整・脚・仕上がりを総合評価。</p><div className="tags"><span>全身</span><span>脚重視</span><span>ポーズ</span></div></div></button>
      <button className={value==='physique'?'category active':'category'} onClick={()=>setValue('physique')}><div className="category-icon">V</div><div><h2>メンズフィジーク</h2><p>肩幅と逆三角形、細いウエスト、自信を評価。</p><div className="tags"><span>肩・背中</span><span>Vシェイプ</span><span>自信</span></div></div></button>
    </div>
    <aside className="tip"><Info size={18}/><p>フィジークでも脚は土台です。脚を無視すると複合種目の品質が落ち、上半身の成長にも影響します。</p></aside>
  </Shell>
}

function Home({game,navigate,help,simulate}:{game:GameState;navigate:(s:Screen)=>void;help:()=>void;simulate:()=>void}){
  const a=game.athlete, fat=pct(a.fatMass,a.weight), d=derivedAbilities(a)
  const complete=Boolean(game.plan.care)
  return <Shell title={`第${game.week}週`} eyebrow={`${categoryLabels[game.category]} / 大会まで ${13-game.week}週`} onHelp={help} footer={<PrimaryButton onClick={simulate} disabled={!complete}>{complete?'7日間をシミュレーション':'メンタルケアを選んでください'}</PrimaryButton>}>
    <section className="hero-status"><div><span className="status-label">CURRENT FORM</span><h2>{a.weight.toFixed(1)}<small>kg</small></h2><p>体脂肪率 {fat.toFixed(1)}% ・ 体調 {Math.round(a.condition)}</p></div><div className={`readiness ${a.fatigue>65?'bad':''}`}><strong>{Math.round(100-a.fatigue)}</strong><span>回復度</span></div></section>
    <button className="status-link" onClick={()=>navigate('status')}><span>身体・部位別ステータス</span><span>脚の安定 {Math.round(d.lowerStability)}　体幹 {Math.round(d.coreStability)} ›</span></button>
    <section><div className="section-heading"><div><span>THIS WEEK</span><h2>今週の計画</h2></div><small>前週の設定を引き継ぎます</small></div>
      <div className="plan-list">
        <button onClick={()=>navigate('diet')}><span className="plan-icon food"><Apple/></span><span><b>食事方針</b><small>{game.plan.diet.calories} kcal ・ P {game.plan.diet.protein}g / F {game.plan.diet.fat}g</small></span><span>編集</span></button>
        <button onClick={()=>navigate('training')}><span className="plan-icon train"><Dumbbell/></span><span><b>筋トレ計画</b><small>{trainingPresets[game.plan.training.preset].name} ・ 強度 {game.plan.training.intensity}</small></span><span>編集</span></button>
        <button onClick={()=>navigate('mental')}><span className="plan-icon mind"><Brain/></span><span><b>メンタルケア</b><small>{game.plan.care?careOptions.find(c=>c.id===game.plan.care)?.name:'今週の声かけを選択'}</small></span><span>{game.plan.care?'変更':'未設定'}</span></button>
      </div>
    </section>
    <section className="dashboard"><h2>コンディション</h2><Gauge label="全身疲労" value={a.fatigue} tone={a.fatigue>70?'danger':a.fatigue>48?'warn':'good'} hint={a.fatigue>70?'かなり高い：回復優先を検討':'計画可能な範囲'}/><Gauge label="モチベーション" value={a.mental.motivation} tone="good"/><Gauge label="ストレス" value={a.mental.stress} tone={a.mental.stress>65?'danger':'warn'}/></section>
  </Shell>
}

function Diet({game,update,back,help}:{game:GameState;update:(g:GameState)=>void;back:()=>void;help:()=>void}){
  const d=game.plan.diet,a=game.athlete, expenditure=Math.round(a.bmr+560+game.plan.training.cardio*95), balance=d.calories-expenditure
  const set=(key:keyof typeof d,value:number)=>update({...game,plan:{...game.plan,diet:{...d,[key]:value}}})
  return <Shell title="食事設定" eyebrow={`第${game.week}週`} onBack={back} onHelp={help} footer={<PrimaryButton onClick={back}>この内容で決定</PrimaryButton>}>
    <section className="balance-card"><span>推定1日消費</span><strong>{expenditure.toLocaleString()} kcal</strong><p className={balance>200?'plus':balance<-200?'minus':''}>計画との差 {balance>=0?'+':''}{balance} kcal / 日</p></section>
    <RangeField label="目標摂取カロリー" value={d.calories} min={1400} max={4000} step={50} suffix="kcal" onChange={v=>set('calories',v)}/>
    <div className="macro-grid"><RangeField label="タンパク質" short="P" value={d.protein} min={60} max={240} step={5} suffix="g" onChange={v=>set('protein',v)}/><RangeField label="脂質" short="F" value={d.fat} min={25} max={140} step={5} suffix="g" onChange={v=>set('fat',v)}/><RangeField label="炭水化物" short="C" value={d.carbs} min={80} max={520} step={5} suffix="g" onChange={v=>set('carbs',v)}/></div>
    <aside className={`coach-note ${d.calories<1500||d.fat<45?'alert':''}`}><Apple size={22}/><div><b>トレーナーメモ</b><p>{d.calories<1500?'極端な制限です。体調・メンタル・遵守率が下がります。':d.protein<a.weight*1.5?'タンパク質が少なく、筋量維持が難しくなりそうです。':balance<-500?'減量は進みますが、炭水化物と回復に注意。':'成長と継続性を両立しやすい範囲です。'}</p></div></aside>
  </Shell>
}

function RangeField({label,short,value,min,max,step,suffix,onChange}:{label:string;short?:string;value:number;min:number;max:number;step:number;suffix:string;onChange:(v:number)=>void}){
  return <label className="range-field"><span>{short?<i>{short}</i>:null}{label}<strong>{value.toLocaleString()} <small>{suffix}</small></strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/><small>{min} — {max} {suffix}</small></label>
}

function Training({game,update,back,help}:{game:GameState;update:(g:GameState)=>void;back:()=>void;help:()=>void}){
  const t=game.plan.training
  const select=(id:TrainingPreset)=>update({...game,plan:{...game.plan,training:structuredClone(trainingPresets[id].plan)}})
  const setVolume=(k:MuscleKey,v:number)=>update({...game,plan:{...game.plan,training:{...t,volumes:{...t.volumes,[k]:v},preset:t.preset}}})
  const set=(key:'intensity'|'cardio'|'restDays',v:number)=>update({...game,plan:{...game.plan,training:{...t,[key]:v}}})
  return <Shell title="筋トレ設定" eyebrow={`第${game.week}週`} onBack={back} onHelp={help} footer={<PrimaryButton onClick={back}>この内容で決定</PrimaryButton>}>
    <p className="lead">プリセットを土台に、必要な部分だけ調整できます。</p>
    <div className="preset-scroll">{(Object.keys(trainingPresets) as TrainingPreset[]).map(id=><button key={id} className={t.preset===id?'preset active':'preset'} onClick={()=>select(id)}><Dumbbell size={20}/><b>{trainingPresets[id].name}</b><small>{trainingPresets[id].desc}</small></button>)}</div>
    <section className="volume-card"><h2>部位別トレーニング量 <small>0〜5</small></h2>{muscleKeys.map(k=><RangeField key={k} label={muscleLabels[k]} value={t.volumes[k]} min={0} max={5} step={1} suffix="" onChange={v=>setVolume(k,v)}/>)}</section>
    <div className="settings-grid"><RangeField label="強度" value={t.intensity} min={40} max={95} step={1} suffix="" onChange={v=>set('intensity',v)}/><RangeField label="有酸素" value={t.cardio} min={0} max={7} step={1} suffix="回" onChange={v=>set('cardio',v)}/><RangeField label="休養日" value={t.restDays} min={1} max={5} step={1} suffix="日" onChange={v=>set('restDays',v)}/></div>
    <aside className="tip"><Info size={18}/><p>脚の量を増やすと土台が育ちますが、全身疲労も増えます。現在の疲労は {Math.round(game.athlete.fatigue)} です。</p></aside>
  </Shell>
}

function Mental({game,update,back,help}:{game:GameState;update:(g:GameState)=>void;back:()=>void;help:()=>void}){
  const a=game.athlete
  return <Shell title="メンタルケア" eyebrow={`第${game.week}週`} onBack={back} onHelp={help} footer={<PrimaryButton onClick={back} disabled={!game.plan.care}>この声かけで決定</PrimaryButton>}>
    <section className="mood-card"><Brain/><div><span>{personalityLabels[a.personality]}</span><h2>{a.mental.stress>65?'少し追い詰められている':a.fatigue>65?'疲れが表情に出ている':a.mental.motivation>70?'前向きで集中している':'迷いながらも取り組んでいる'}</h2><p>「仕事との両立、ちゃんとできているかな……」</p></div></section>
    <div className="mini-stats"><span>やる気<b>{Math.round(a.mental.motivation)}</b></span><span>ストレス<b>{Math.round(a.mental.stress)}</b></span><span>信頼<b>{Math.round(a.mental.trust)}</b></span></div>
    <div className="care-list">{careOptions.map(c=><button key={c.id} className={game.plan.care===c.id?'care active':'care'} onClick={()=>update({...game,plan:{...game.plan,care:c.id}})}><span className="radio"/><span><b>{c.name}</b><small>{c.desc}</small>{c.best===a.personality?<em>性格と好相性</em>:null}</span></button>)}</div>
  </Shell>
}

function Status({game,back,help}:{game:GameState;back:()=>void;help:()=>void}){
  const a=game.athlete,d=derivedAbilities(a),qualities=exerciseQualities(a)
  return <Shell title="身体ステータス" eyebrow={`第${game.week}週`} onBack={back} onHelp={help}>
    <BodyMap muscles={a.muscles}/>
    <section className="stat-card"><h2>身体</h2><div className="data-grid"><span>体重<b>{a.weight.toFixed(1)} kg</b></span><span>体脂肪率<b>{pct(a.fatMass,a.weight).toFixed(1)}%</b></span><span>基礎代謝<b>{Math.round(a.bmr)} kcal</b></span><span>怪我リスク<b>{Math.round(a.injuryRisk)}</b></span></div></section>
    <section className="stat-card"><h2>派生能力</h2><Gauge label="下半身の安定性" value={d.lowerStability}/><Gauge label="体幹の安定性" value={d.coreStability}/><Gauge label="握力" value={d.grip}/><Gauge label="フォーム習熟度" value={d.form}/></section>
    <section className="stat-card"><h2>主要種目の実施品質</h2>{qualities.map(q=><details key={q.name}><summary><span>{q.name}</span><strong>{q.quality}%</strong><ChevronDown size={18}/></summary><div className="factor-list">{q.factors.map(f=><span key={f.label}>{f.label}<b>{f.value}</b></span>)}<span>疲労による補正<b>−{q.fatiguePenalty}%</b></span></div></details>)}</section>
  </Shell>
}

function EventScreen({game,choose}:{game:GameState;choose:(id:string)=>void}){
  const event=EVENTS.find(e=>e.id===game.pendingEventId)!
  return <Shell title="生活イベント" eyebrow={`第${game.week}週 / PLAN DISRUPTED`}>
    <div className="event-visual"><span>!</span><div className="city"/></div>
    <section className="event-story"><span>WORK & LIFE</span><h2>{event.title}</h2><p>{event.story}</p></section>
    <div className="event-choices"><h3>どう対応する？</h3>{event.choices.map(c=><button key={c.id} onClick={()=>choose(c.id)}><b>{c.label}</b><small>{c.detail}</small><span>選ぶ</span></button>)}</div>
    <p className="fine-print">正解はひとつではありません。身体・仕事・人間関係の優先順位で結果が変わります。</p>
  </Shell>
}

function Report({game,next}:{game:GameState;next:()=>void}){
  const r=game.lastReport!
  const totalMuscle=muscleKeys.reduce((s,k)=>s+r.muscleChanges[k],0)
  return <Shell title="週次レポート" eyebrow={`第${r.week}週 / COMPLETE`} footer={<PrimaryButton onClick={next}>{game.week===12?'大会結果を見る':'次の週へ'}</PrimaryButton>}>
    <section className="report-hero"><span>WEEK {r.week} RESULT</span><h2>{r.afterWeight.toFixed(1)} <small>kg</small></h2><p className={r.afterWeight-r.beforeWeight>=0?'plus':'minus'}>{signed(r.afterWeight-r.beforeWeight,' kg')} / 脂肪 {signed(r.fatChange,' kg')}</p></section>
    <div className="report-cards"><div><Activity/><span>筋量変化</span><b>{signed(totalMuscle,' pt')}</b></div><div><Dumbbell/><span>疲労</span><b>{Math.round(game.athlete.fatigue)}</b></div><div><Brain/><span>モチベ</span><b>{Math.round(game.athlete.mental.motivation)}</b></div></div>
    {r.eventSummary?<aside className="event-summary"><b>今週の出来事</b><p>{r.eventSummary}</p></aside>:null}
    <section className="stat-card"><h2>トレーナー所見</h2><ul className="notes">{r.notes.map(n=><li key={n}>{n}</li>)}</ul></section>
    <section className="stat-card"><h2>部位別の成長</h2><div className="growth-list">{muscleKeys.map(k=><span key={k}>{muscleLabels[k]}<b>{signed(r.muscleChanges[k])}</b></span>)}</div></section>
  </Shell>
}

function Contest({game,retry,reset}:{game:GameState;retry:()=>void;reset:()=>void}){
  const c=game.contest!
  return <Shell title="大会結果" eyebrow={categoryLabels[game.category]}>
    <section className="contest-hero"><Trophy/><span>FINAL PLACING</span><h2>{c.rank}<small>位</small></h2><p>総合スコア <b>{c.total}</b> / 100</p></section>
    <section className="score-sheet"><h2>ジャッジスコア</h2>{c.items.map(i=><div key={i.label}><span>{i.label}<small>配点 {Math.round(i.weight*100)}%</small></span><div className="mini-bar"><i style={{width:`${i.score}%`}}/></div><b>{i.score}</b></div>)}</section>
    <section className="judge-comment"><h2>大会講評</h2><h3>良かった判断</h3><ul>{c.praise.map(x=><li key={x}>{x}</li>)}</ul><h3>次に改善したい点</h3><ul>{c.improvements.map(x=><li key={x}>{x}</li>)}</ul><blockquote>{c.nextPlan}</blockquote></section>
    <div className="end-actions"><PrimaryButton onClick={retry}><RotateCcw size={18}/>同じ選手で再挑戦</PrimaryButton><PrimaryButton onClick={reset} secondary>選手設定から始める</PrimaryButton></div>
    <p className="fine-print">再挑戦では乱数シードが変わり、生活イベントの週や順番が変化します。</p>
  </Shell>
}

function Help({onBack}:{onBack:()=>void}){
  return <Shell title="ゲーム説明" onBack={onBack}>
    <section className="help-hero"><span>B12</span><h2>計画して、崩れて、また考える。</h2><p>12週間で新人選手を大会へ導く育成シミュレーションです。</p></section>
    <section className="stat-card"><h2>基本の流れ</h2><ol className="steps"><li><b>状態を見る</b><span>体重・疲労・メンタル・部位の成長を確認</span></li><li><b>今週を計画</b><span>食事、筋トレ、メンタルケアを設定</span></li><li><b>7日間を進める</b><span>生活イベントへ対応し、結果から修正</span></li><li><b>12週目の大会</b><span>カテゴリ別評価と講評を確認</span></li></ol></section>
    <section className="stat-card"><h2>データとオフライン</h2><p>進行はこの端末のブラウザ内（localStorage）へ自動保存されます。サーバー送信はありません。一度読み込めば、PWAとしてオフラインでも遊べます。</p></section>
    <section className="disclaimer"><Info/><div><h2>免責事項</h2><p>本作の身体変化・栄養・運動モデルは、ゲームとして理解しやすく簡略化した架空のシミュレーションです。医学的・栄養学的な助言ではありません。実際の食事や運動は、体調に配慮し、必要に応じて資格を持つ専門家へ相談してください。</p></div></section>
    <button className="save-note" onClick={onBack}><Save size={18}/>ゲームへ戻る</button>
  </Shell>
}
