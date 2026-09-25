import type { GameState } from './types'
export const SAVE_KEY='bodymake-12-weeks-save-v1'
export function saveGame(state:GameState, storage:Pick<Storage,'setItem'>=localStorage){ storage.setItem(SAVE_KEY,JSON.stringify(state)) }
export function loadGame(storage:Pick<Storage,'getItem'>=localStorage):GameState|null {
  try { const raw=storage.getItem(SAVE_KEY); if(!raw)return null; const data=JSON.parse(raw) as GameState; return data.version===1?data:null } catch { return null }
}
export function deleteSave(storage:Pick<Storage,'removeItem'>=localStorage){ storage.removeItem(SAVE_KEY) }
