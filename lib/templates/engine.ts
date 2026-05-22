import { PromptTemplate } from './types';

export class PromptEngine {
  // Construye el prompt final reemplazando {{variables}} con los valores del usuario
  static build(template: PromptTemplate, inputs: Record<string, string>): string {
    return template.basePrompt.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = inputs[key]?.trim();
      if (!value) return `[${key}]`;
      return value;
    });
  }

  // Calcula un score de calidad del prompt (1-10)
  static calculateScore(template: PromptTemplate, inputs: Record<string, string>): number {
    const filledVars = template.variables.filter(v => inputs[v.key]?.trim()).length;
    const totalVars = template.variables.length;
    const completion = totalVars > 0 ? filledVars / totalVars : 1;
    return Math.round(5 + completion * 5);
  }

  // Estima tokens (~4 caracteres = 1 token)
  static estimateTokens(prompt: string): number {
    return Math.ceil(prompt.length / 4);
  }

  // Genera URL para abrir en IA externa
  static generateAILink(ai: string, prompt: string): string {
    const encoded = encodeURIComponent(prompt);
    const links: Record<string, string> = {
      'ChatGPT': `https://chat.openai.com/?q=${encoded}`,
      'Claude': `https://claude.ai/new?q=${encoded}`,
      'Gemini': `https://gemini.google.com/app?q=${encoded}`,
      'Perplexity': `https://perplexity.ai/?q=${encoded}`,
    };
    return links[ai] || '';
  }
}