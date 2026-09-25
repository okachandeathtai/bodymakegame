import { ArrowLeft, CircleHelp } from 'lucide-react'
import type { ReactNode } from 'react'

export function Shell({title,eyebrow,children,onBack,onHelp,footer}:{title:string;eyebrow?:string;children:ReactNode;onBack?:()=>void;onHelp?:()=>void;footer?:ReactNode}){
  return <div className="app-shell">
    <header className="topbar">
      {onBack?<button className="icon-button" onClick={onBack} aria-label="戻る"><ArrowLeft size={21}/></button>:<div className="brand-mark" aria-hidden="true">B12</div>}
      <div className="topbar-title">{eyebrow?<span>{eyebrow}</span>:null}<h1>{title}</h1></div>
      {onHelp?<button className="icon-button" onClick={onHelp} aria-label="ゲーム説明"><CircleHelp size={21}/></button>:<span className="topbar-spacer"/>}
    </header>
    <main>{children}</main>
    {footer?<footer className="sticky-footer">{footer}</footer>:null}
  </div>
}

export function PrimaryButton({children,onClick,disabled=false,secondary=false}:{children:ReactNode;onClick:()=>void;disabled?:boolean;secondary?:boolean}){
  return <button className={secondary?'primary secondary':'primary'} onClick={onClick} disabled={disabled}>{children}</button>
}
