import { PromptTemplate } from './types';

export const TEMPLATES: PromptTemplate[] = [
  {
    id: 'm1',
    title: '10 Hooks Virales TikTok/Reels',
    description: 'Ganchos que paran el scroll en los primeros 3 segundos.',
    category: 'marketing',
    icon: '📱',
    basePrompt: `Crea 10 hooks virales para {{nicho}} en TikTok/Reels. Usa estas estructuras: 1) Pregunta provocadora, 2) Estadística impactante, 3) Contraintuitivo, 4) Secreto revelado, 5) Error común, 6) Antes/después, 7) Número específico, 8) Amenaza, 9) Curiosidad, 10) Confesión. Máximo 8 palabras cada uno. Tono: {{tono}}.`,
    variables: [
      {
        key: 'nicho',
        label: '¿Cuál es tu nicho o tema?',
        type: 'text',
        placeholder: 'ej: fitness, marketing digital, cocina...',
        required: true,
        helper: 'Sé específico para mejores resultados'
      },
      {
        key: 'tono',
        label: 'Tono de comunicación',
        type: 'select',
        options: ['Directo y urgente', 'Inspiracional', 'Divertido', 'Profesional', 'Provocador'],
        required: true,
        defaultValue: 'Directo y urgente'
      }
    ],
    estimatedTime: '1 min',
    difficulty: 'Básico',
    recommendedAI: ['ChatGPT', 'Claude'],
    isPremium: false,
    tags: ['TikTok', 'Viral', 'Hooks'],
    popularity: 99
  },
  {
    id: 'm2',
    title: 'Email de Ventas de Alto Impacto',
    description: 'Email que convierte usando psicología de persuasión avanzada.',
    category: 'marketing',
    icon: '✉️',
    basePrompt: `Escribe un email de ventas para {{producto}} dirigido a {{audiencia}}. Usa: Subject line con open rate alto, estructura PAS (Problema-Agitación-Solución), historia de transformación corta, beneficio principal con prueba, objeción principal destruida, urgencia real y CTA irresistible. Tono: {{tono}}.`,
    variables: [
      {
        key: 'producto',
        label: '¿Qué producto o servicio vendes?',
        type: 'text',
        placeholder: 'ej: curso de fotografía, consultoría, app...',
        required: true
      },
      {
        key: 'audiencia',
        label: '¿A quién va dirigido?',
        type: 'text',
        placeholder: 'ej: emprendedores latinos, mamás trabajadoras...',
        required: true
      },
      {
        key: 'tono',
        label: 'Tono del email',
        type: 'select',
        options: ['Formal', 'Casual', 'Urgente', 'Inspiracional'],
        required: true,
        defaultValue: 'Casual'
      }
    ],
    estimatedTime: '2 min',
    difficulty: 'Intermedio',
    recommendedAI: ['ChatGPT', 'Claude'],
    isPremium: false,
    tags: ['Email', 'Ventas', 'Conversión'],
    popularity: 91
  },
  {
    id: 'pr3',
    title: 'Debug Experto con 5 Porqués',
    description: 'Encuentra la causa raíz de cualquier bug con metodología probada.',
    category: 'programacion',
    icon: '🐛',
    basePrompt: `Tengo este error: {{error}}\nEn este código: {{codigo}}\nTecnologías usadas: {{stack}}\n\nAplica los 5 porqués para encontrar la causa raíz. Dame: diagnóstico exacto, fix inmediato, fix estructural y cómo crear un test para prevenir esto en el futuro.`,
    variables: [
      {
        key: 'error',
        label: '¿Cuál es el error exacto?',
        type: 'textarea',
        placeholder: 'Pega aquí el mensaje de error completo...',
        required: true
      },
      {
        key: 'codigo',
        label: '¿Cuál es el código problemático?',
        type: 'textarea',
        placeholder: 'Pega aquí el fragmento de código...',
        required: true
      },
      {
        key: 'stack',
        label: '¿Qué tecnologías usas?',
        type: 'text',
        placeholder: 'ej: React, Node.js, TypeScript...',
        required: true
      }
    ],
    estimatedTime: '2 min',
    difficulty: 'Básico',
    recommendedAI: ['ChatGPT', 'Claude'],
    isPremium: false,
    tags: ['Debug', 'Fix', 'Código'],
    popularity: 97
  },
  {
    id: 'fi1',
    title: 'Plan de Entrenamiento Personalizado',
    description: 'Rutina científica adaptada a tu objetivo, nivel y tiempo disponible.',
    category: 'fitness',
    icon: '💪',
    basePrompt: `Actúa como coach fitness certificado. Crea mi plan de entrenamiento para {{objetivo}}. Datos: nivel {{nivel}}, días disponibles por semana {{dias}}, equipamiento disponible: {{equipamiento}}. Incluye: rutina semanal completa, series/repeticiones, tiempos de descanso y cómo progresar semana a semana.`,
    variables: [
      {
        key: 'objetivo',
        label: '¿Cuál es tu objetivo?',
        type: 'select',
        options: ['Ganar masa muscular', 'Perder grasa', 'Mejorar resistencia', 'Ganar fuerza', 'Mantenerse en forma'],
        required: true
      },
      {
        key: 'nivel',
        label: '¿Cuál es tu nivel actual?',
        type: 'select',
        options: ['Principiante (menos de 6 meses)', 'Intermedio (6 meses a 2 años)', 'Avanzado (más de 2 años)'],
        required: true
      },
      {
        key: 'dias',
        label: '¿Cuántos días por semana puedes entrenar?',
        type: 'select',
        options: ['2 días', '3 días', '4 días', '5 días', '6 días'],
        required: true,
        defaultValue: '3 días'
      },
      {
        key: 'equipamiento',
        label: '¿Qué equipamiento tienes?',
        type: 'select',
        options: ['Gimnasio completo', 'Mancuernas en casa', 'Solo peso corporal', 'Bandas elásticas'],
        required: true
      }
    ],
    estimatedTime: '2 min',
    difficulty: 'Básico',
    recommendedAI: ['ChatGPT', 'Claude'],
    isPremium: false,
    tags: ['Fitness', 'Rutina', 'Entrenamiento'],
    popularity: 94
  },
  {
    id: 'ps1',
    title: 'Anti-Procrastinación 5 Minutos',
    description: 'Rompe el bloqueo mental y empieza cualquier tarea difícil ahora.',
    category: 'psicologia',
    icon: '🧠',
    basePrompt: `Tengo que hacer {{tarea}} pero llevo procrastinando {{tiempo}}. Dame un plan de arranque de 5 minutos con el primer paso tan pequeño que sea imposible no hacerlo. Incluye: causa probable de mi bloqueo, técnica de inicio recomendada, los 3 primeros micro-pasos concretos y cómo mantener el momentum después.`,
    variables: [
      {
        key: 'tarea',
        label: '¿Qué tarea estás evitando?',
        type: 'text',
        placeholder: 'ej: escribir el informe, estudiar para el examen...',
        required: true
      },
      {
        key: 'tiempo',
        label: '¿Cuánto tiempo llevas procrastinando?',
        type: 'select',
        options: ['Unas horas', 'Un día', 'Varios días', 'Más de una semana'],
        required: true,
        defaultValue: 'Varios días'
      }
    ],
    estimatedTime: '1 min',
    difficulty: 'Básico',
    recommendedAI: ['ChatGPT', 'Claude', 'Gemini'],
    isPremium: false,
    tags: ['Productividad', 'Focus', 'Mental'],
    popularity: 97
  }
];

export function getTemplateById(id: string): PromptTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return TEMPLATES.filter(t => t.category === category);
}