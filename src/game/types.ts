export type Category = 'bodybuilding' | 'physique'
export type Personality = 'earnest' | 'sensitive' | 'analytical'
export type MuscleKey = 'chest' | 'back' | 'shoulders' | 'arms' | 'abs' | 'legs'
export type Screen = 'title' | 'profile' | 'category' | 'home' | 'diet' | 'training' | 'mental' | 'event' | 'report' | 'status' | 'contest' | 'help'
export type TrainingPreset = 'balanced' | 'upper' | 'foundation' | 'weakpoint' | 'cut' | 'recovery'
export type CareId = 'strict' | 'listen' | 'explain' | 'rest' | 'treat'

export interface Muscles { chest: number; back: number; shoulders: number; arms: number; abs: number; legs: number }
export interface Mental { motivation: number; stress: number; confidence: number; trust: number; dietAdherence: number; trainingAdherence: number }
export interface Athlete {
  name: string; age: number; personality: Personality; weight: number; fatMass: number; bmr: number
  condition: number; fatigue: number; injuryRisk: number; muscles: Muscles; mental: Mental
  form: number; grip: number
}
export interface DietPlan { calories: number; protein: number; fat: number; carbs: number }
export interface TrainingPlan { volumes: Muscles; intensity: number; cardio: number; restDays: number; preset: TrainingPreset }
export interface WeeklyPlan { diet: DietPlan; training: TrainingPlan; care: CareId | null }
export interface EventChoice { id: string; label: string; detail: string; effects: Partial<Effect> }
export interface LifeEvent { id: string; title: string; story: string; choices: EventChoice[] }
export interface Effect { calories: number; fatigue: number; stress: number; motivation: number; confidence: number; trust: number; dietAdherence: number; trainingAdherence: number; condition: number }
export interface ExerciseQuality { name: string; quality: number; factors: { label: string; value: number }[]; fatiguePenalty: number }
export interface WeekReport { week: number; beforeWeight: number; afterWeight: number; fatChange: number; muscleChanges: Muscles; notes: string[]; qualities: ExerciseQuality[]; eventSummary?: string }
export interface ContestScore { total: number; rank: number; items: { label: string; score: number; weight: number }[]; praise: string[]; improvements: string[]; nextPlan: string }
export interface GameState {
  version: 1; seed: number; rngState: number; week: number; category: Category; athlete: Athlete; plan: WeeklyPlan
  eventSchedule: Record<number, string>; pendingEventId: string | null; lastReport: WeekReport | null
  history: WeekReport[]; contest: ContestScore | null; createdAt: string
}
