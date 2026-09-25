interface GaugeProps { label: string; value: number; suffix?: string; hint?: string; tone?: 'good'|'warn'|'danger'|'neutral' }
export function Gauge({label,value,suffix='',hint,tone='neutral'}:GaugeProps){
  const safe=Math.max(0,Math.min(100,value))
  return <div className="gauge-block">
    <div className="gauge-label"><span>{label}</span><strong>{Math.round(value)}{suffix}</strong></div>
    <div className="gauge" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safe)}><span className={tone} style={{width:`${safe}%`}} /></div>
    {hint ? <small>{hint}</small> : null}
  </div>
}
