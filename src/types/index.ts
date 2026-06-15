export interface UserProfile {
  id: string
  display_name: string | null
  quit_date: string
  daily_cost: number
  currency: string
  language: string
  reasons: string[]
  porros_per_day: number | null
  savings_goal: number | null
  created_at: string
  updated_at: string
}

export interface DiaryEntry {
  id: string
  user_id: string
  content: string
  mood: number | null
  tags: string[]
  created_at: string
}

export interface Craving {
  id: string
  user_id: string
  intensity: number
  trigger_text: string | null
  location: string | null
  resisted: boolean
  created_at: string
}

export interface Relapse {
  id: string
  user_id: string
  notes: string | null
  previous_quit_date: string | null
  created_at: string
}

export interface Achievement {
  id: string
  label: string
  description: string
  icon: string
  category: 'time' | 'diary' | 'crisis' | 'savings'
  threshold: number // hours for time, count for others, euros for savings
  unlockedAt?: string
}
