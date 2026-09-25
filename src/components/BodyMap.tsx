import type { Muscles } from '../game/types'
import { muscleLabels } from '../game/config'

export function BodyMap({muscles}:{muscles:Muscles}){
  const tone=(v:number)=>v>=58?'var(--lime)':v>=52?'var(--aqua)':'var(--sand)'
  return <div className="body-map" aria-label="部位別筋量の身体図">
    <svg viewBox="0 0 180 300" role="img" aria-label="上半身と脚の筋量を色で表した図">
      <circle cx="90" cy="31" r="19" fill="var(--ink-2)"/>
      <path d="M51 66 Q65 49 90 52 Q115 49 129 66 L119 138 Q109 153 90 151 Q71 153 61 138Z" fill={tone((muscles.chest+muscles.back)/2)}/>
      <path d="M51 67 Q30 78 25 124 L39 130 62 87Z" fill={tone((muscles.shoulders+muscles.arms)/2)}/>
      <path d="M129 67 Q150 78 155 124 L141 130 118 87Z" fill={tone((muscles.shoulders+muscles.arms)/2)}/>
      <path d="M65 131 Q90 142 115 131 L111 174 69 174Z" fill={tone(muscles.abs)}/>
      <path d="M70 173 L88 173 83 270 55 270Z" fill={tone(muscles.legs)}/>
      <path d="M92 173 L110 173 125 270 97 270Z" fill={tone(muscles.legs)}/>
    </svg>
    <div className="body-legend">{Object.entries(muscleLabels).map(([k,label])=><span key={k}>{label}<b>{Math.round(muscles[k as keyof Muscles])}</b></span>)}</div>
  </div>
}
