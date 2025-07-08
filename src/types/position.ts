// Shared types for the position management system

export interface BaseQuestion {
  type: "text" | "select" | "radio" | "checkbox" | "textarea" | "number"
  label: string
  placeholder?: string
  required: boolean
}

export interface QuestionOption {
  value: string
  hasInput?: boolean
  inputLabel?: string
  inputPlaceholder?: string
  inputRequired?: boolean
}

export interface Question extends BaseQuestion {
  id: string
  options?: QuestionOption[]
}

export interface EditableQuestion extends BaseQuestion {
  options?: QuestionOption[]
}

export interface Position {
  id: string
  value: string
  title: string
  description: string
  icon: string
  isActive: boolean
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export interface FormData {
  title: string
  description: string
  icon: string
  isActive: boolean
}

export interface PositionFormProps {
  formData: FormData
  questions: EditableQuestion[]
  onFormDataChange: (data: FormData) => void
  onQuestionsChange: (questions: EditableQuestion[]) => void
}
