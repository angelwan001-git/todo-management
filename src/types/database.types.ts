export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          title: string
          completed: boolean
          order_index: number
          created_at: string
          updated_at: string
          user_id: string
          priority: '낮음' | '보통' | '높음' | '긴급'
          status: '예정' | '진행 중' | '완료' | '보류' | '취소'
          start_date: string | null
          due_date: string | null
        }
        Insert: {
          id?: string
          title: string
          completed?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
          user_id: string
          priority?: '낮음' | '보통' | '높음' | '긴급'
          status?: '예정' | '진행 중' | '완료' | '보류' | '취소'
          start_date?: string | null
          due_date?: string | null
        }
        Update: {
          id?: string
          title?: string
          completed?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
          user_id?: string
          priority?: '낮음' | '보통' | '높음' | '긴급'
          status?: '예정' | '진행 중' | '완료' | '보류' | '취소'
          start_date?: string | null
          due_date?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Todo = Database['public']['Tables']['todos']['Row'];
export type NewTodo = Database['public']['Tables']['todos']['Insert'];
export type UpdateTodo = Database['public']['Tables']['todos']['Update'];