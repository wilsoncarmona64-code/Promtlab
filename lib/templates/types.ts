export type VariableType = 'text' | 'select' | 'textarea';

export interface TemplateVariable {
  key: string;
  label: string;
  type: VariableType;
  placeholder?: string;
  options?: string[];
  required: boolean;
  helper?: string;
  defaultValue?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  basePrompt: string;
  variables: TemplateVariable[];
  estimatedTime: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  recommendedAI: string[];
  isPremium: boolean;
  tags: string[];
  popularity: number;
}