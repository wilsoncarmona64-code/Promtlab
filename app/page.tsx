"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

// Imports de tus archivos locales
import { TEMPLATES } from "@/lib/templates/registry";
import { PromptTemplate } from "@/lib/templates/types";

// Carga dinámica para evitar errores de SSR
const PromptBuilder = dynamic(() => import("@/components/builder/PromptBuilder"), { ssr: false });
// const RegisterModal = dynamic(() => import("@/components/auth/RegisterModal"), { ssr: false }); // Descomenta cuando crees el archivo
// const FirstUseTour = dynamic(() => import("@/components/onboarding/FirstUseTour"), { ssr: false }); // Descomenta cuando crees el archivo

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const AI_LINKS: Record<string, string> = {
  ChatGPT: "https://chat.openai.com/?q=",
  Claude: "https://claude.ai/new?q=",
  Gemini: "https://gemini.google.com/app?q=",
  Perplexity: "https://perplexity.ai/?q=",
};

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Gender = "general" | "hombre" | "mujer";

interface Prompt {
  id: string;
  title: string;
  description: string;
  preview: string;
  category: string;
  tags: string[];
  compat: string[];
  diff: "Básico" | "Intermedio" | "Avanzado";
  pop: number;
  featured?: boolean;
  trending?: boolean;
  genderMode?: boolean;
  previewF?: string;
  _search?: string;
}

interface AITool {
  id: string;
  name: string;
  specialty: string;
  badge: string;
  badgeColor: string;
  url: string;
  color: string;
  bg: string;
  categories: string[];
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const AI_TOOLS: AITool[] = [
  { id: "chatgpt", name: "ChatGPT", specialty: "Texto, análisis, código", badge: "Más popular", badgeColor: "#10b981", url: "https://chat.openai.com", color: "#10b981", bg: "rgba(16,185,129,0.1)", categories: ["fitness", "nutricion", "psicologia", "marketing", "gaming", "educacion", "finanzas", "storytelling", "biohacking", "viajes", "freelancing"] },
  { id: "claude", name: "Claude", specialty: "Razonamiento profundo", badge: "Mejor calidad", badgeColor: "#f59e0b", url: "https://claude.ai", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", categories: ["psicologia", "storytelling", "programacion", "marketing", "apps", "automatizacion", "educacion", "freelancing", "finanzas", "biohacking"] },
  { id: "gemini", name: "Gemini", specialty: "Multimodal y búsqueda", badge: "Gratis", badgeColor: "#3b82f6", url: "https://gemini.google.com", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", categories: ["viajes", "educacion", "gaming", "marketing", "facial"] },
  { id: "midjourney", name: "Midjourney", specialty: "Imágenes artísticas", badge: "Mejor para imágenes", badgeColor: "#8b5cf6", url: "https://midjourney.com", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", categories: ["fotografia", "arte", "arquitectura", "branding", "diseno"] },
  { id: "cursor", name: "Cursor AI", specialty: "Programación con IA", badge: "Mejor para código", badgeColor: "#06b6d4", url: "https://cursor.com", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", categories: ["programacion", "apps", "cursor"] },
  { id: "leonardo", name: "Leonardo AI", specialty: "Imágenes y concept art", badge: "Gratis + Pro", badgeColor: "#f97316", url: "https://leonardo.ai", color: "#f97316", bg: "rgba(249,115,22,0.1)", categories: ["fotografia", "arte", "gaming"] },
  { id: "suno", name: "Suno", specialty: "Música generativa IA", badge: "Mejor para música", badgeColor: "#ec4899", url: "https://suno.com", color: "#ec4899", bg: "rgba(236,72,153,0.1)", categories: ["musica"] },
  { id: "runway", name: "Runway", specialty: "Video e imagen IA", badge: "Mejor para video", badgeColor: "#a855f7", url: "https://runwayml.com", color: "#a855f7", bg: "rgba(168,85,247,0.1)", categories: ["arte", "diseno"] },
  { id: "perplexity", name: "Perplexity", specialty: "Búsqueda inteligente", badge: "Más preciso", badgeColor: "#14b8a6", url: "https://perplexity.ai", color: "#14b8a6", bg: "rgba(20,184,166,0.1)", categories: ["educacion", "viajes", "finanzas"] },
  { id: "copilot", name: "GitHub Copilot", specialty: "Código en tiempo real", badge: "Para devs", badgeColor: "#6366f1", url: "https://github.com/features/copilot", color: "#6366f1", bg: "rgba(99,102,241,0.1)", categories: ["programacion", "cursor"] },
];

const CATS = [
  { id: "all", label: "Todos", icon: "✦" },
  { id: "facial", label: "Estilo Facial", icon: "◎" },
  { id: "fotografia", label: "Fotografía", icon: "⬡" },
  { id: "arte", label: "Arte IA", icon: "◈" },
  { id: "gaming", label: "Videojuegos", icon: "⚔" },
  { id: "programacion", label: "Programación", icon: "{}" },
  { id: "marketing", label: "Marketing", icon: "▲" },
  { id: "fitness", label: "Fitness", icon: "◉" },
  { id: "nutricion", label: "Nutrición", icon: "⬟" },
  { id: "psicologia", label: "Psicología", icon: "◐" },
  { id: "musica", label: "Música", icon: "♪" },
  { id: "arquitectura", label: "Arquitectura", icon: "▣" },
  { id: "viajes", label: "Viajes", icon: "◇" },
  { id: "apps", label: "Apps Móviles", icon: "▢" },
  { id: "automatizacion", label: "Automatización IA", icon: "⟳" },
  { id: "educacion", label: "Educación", icon: "▷" },
  { id: "freelancing", label: "Freelancing", icon: "◆" },
  { id: "finanzas", label: "Finanzas", icon: "$" },
  { id: "storytelling", label: "Storytelling", icon: "✎" },
  { id: "biohacking", label: "Biohacking", icon: "⬕" },
  { id: "ecommerce", label: "E-Commerce", icon: "◳" },
  { id: "diseno", label: "Diseño Gráfico", icon: "▽" },
  { id: "branding", label: "Branding", icon: "◑" },
  { id: "cursor", label: "Cursor AI", icon: "⌥" },
  { id: "supervivencia", label: "Supervivencia", icon: "⬖" },
];

const AI_COMPAT: Record<string, { color: string; bg: string }> = {
  ChatGPT: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  Claude: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Gemini: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  Midjourney: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  "Cursor AI": { color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  Suno: { color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  Runway: { color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  Leonardo: { color: "#f97316", bg: "rgba(249,115,22,0.12)" },
};

const DIFF_C: Record<string, string> = { Básico: "#4ade80", Intermedio: "#facc15", Avanzado: "#f87171" };

const RAW_PROMPTS: Omit<Prompt, "_search">[] = [
  { id: "f1", category: "facial", title: "Análisis Facial Completo", description: "Analiza proporciones, cabello, barba/maquillaje y armonía facial para recomendar mejoras visuales premium.", preview: "Analiza mi rostro en detalle. Evalúa: proporciones faciales, forma del rostro, tipo de cabello ideal, accesorios recomendados y los 3 cambios que más impacto tendrían en mi imagen personal. Dame un plan de mejora visual paso a paso.", previewF: "Analiza mi rostro en detalle. Evalúa: proporciones faciales, forma del rostro, tipo de cabello ideal para mí, maquillaje recomendado y los 3 cambios que más impacto tendrían en mi imagen. Dame un plan de mejora visual paso a paso.", tags: ["Imagen", "Facial", "Premium"], compat: ["ChatGPT", "Claude", "Gemini"], diff: "Básico", pop: 96, featured: true, trending: true, genderMode: true },
  { id: "f2", category: "facial", title: "Prueba Virtual de Lentes", description: "Sugiere lentes ideales según forma facial, proporciones y estilo personal.", preview: "Según mi forma de rostro [FORMA: ovalado/cuadrado/redondo/corazón], recomienda los estilos de lentes que mejor me favorecerían. Explica por qué cada estilo funciona y menciona marcas concretas accesibles y premium.", tags: ["Lentes", "Estilo"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 88, genderMode: true },
  { id: "f3", category: "facial", title: "Auditoría Visual Premium", description: "Detecta fortalezas y errores estéticos con mejoras concretas y ejecutables.", preview: "Actúa como director de imagen de lujo. Analiza mi estilo actual: [DESCRIPCIÓN]. Identifica los 5 errores visuales más costosos, las 3 fortalezas a potenciar y dame un plan de transformación con presupuesto [BAJO/MEDIO/ALTO].", tags: ["Imagen", "Auditoría"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 91, trending: true },
  { id: "f4", category: "facial", title: "Look Empresarial Premium", description: "Outfit profesional moderno para trabajo, networking y reuniones de alto nivel.", preview: "Diseña mi look empresarial ideal para [INDUSTRIA]. Presupuesto [BAJO/MEDIO/ALTO]. Dame outfit completo: ropa, calzado, accesorios y corte de cabello recomendado.", previewF: "Diseña mi look empresarial ideal para [INDUSTRIA]. Presupuesto [BAJO/MEDIO/ALTO]. Dame outfit completo: ropa, calzado, accesorios y estilo de cabello recomendado.", tags: ["Business", "Estilo"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 84, genderMode: true },
  { id: "p1", category: "fotografia", title: "Foto de Perfil Premium", description: "Retrato profesional nivel LinkedIn/Instagram con dirección de arte avanzada.", preview: "Create a premium professional profile photo. Style: editorial LinkedIn. Lighting: soft studio with subtle rim light. Background: dark gradient or blurred office. Expression: confident, approachable. Camera: Sony A7R V, 85mm f/1.4. Ultra sharp, skin retouching, magazine quality --ar 1:1 --style raw --v 6", tags: ["LinkedIn", "Retrato", "Premium"], compat: ["Midjourney", "Leonardo"], diff: "Básico", pop: 97, featured: true, trending: true },
  { id: "p2", category: "fotografia", title: "Retrato Editorial Vogue", description: "Fotografía estilo Vogue/GQ cinematográfica de altísima calidad.", preview: "Cinematic editorial portrait, Vogue/GQ magazine style, dramatic directional lighting, fashion photography, high contrast, deep shadows, luxury aesthetic, 50mm lens, f/2.0, ultra detailed skin texture, editorial post-processing --ar 2:3 --style raw", tags: ["Editorial", "Vogue", "Cinematic"], compat: ["Midjourney", "Leonardo"], diff: "Intermedio", pop: 93, featured: true },
  { id: "p3", category: "fotografia", title: "Golden Hour Premium", description: "Retratos cálidos al atardecer con iluminación natural dorada perfecta.", preview: "Golden hour portrait photography, warm backlight creating rim light effect, bokeh background, outdoor natural light, skin glowing, soft shadows, lifestyle photography style, Fuji X-T5, 56mm f/1.2, warm color grade --ar 4:5", tags: ["GoldenHour", "Natural"], compat: ["Midjourney", "Leonardo"], diff: "Básico", pop: 89 },
  { id: "p4", category: "fotografia", title: "Retrato Neón Futurista", description: "Retrato urbano futurista con iluminación neón de alta estética.", preview: "Neon noir portrait, cyberpunk city at night, dramatic neon reflections on face, rain-slicked streets background, cinematic composition, deep blue and magenta palette, ultra sharp, photorealistic --ar 2:3 --style raw --v 6", tags: ["Neon", "Cyberpunk", "Urbano"], compat: ["Midjourney", "Leonardo"], diff: "Intermedio", pop: 87 },
  { id: "a1", category: "arte", title: "Estilo Studio Ghibli", description: "Convierte cualquier escena en ilustración anime cinematográfica al estilo Ghibli.", preview: "Studio Ghibli animation style, [SCENE/SUBJECT], soft watercolor background, warm afternoon light, highly detailed environment, magical atmosphere, hand-painted quality, Hayao Miyazaki aesthetic, rich colors, whimsical details --ar 16:9", tags: ["Ghibli", "Anime", "Cinematico"], compat: ["Midjourney", "Leonardo"], diff: "Básico", pop: 95, trending: true },
  { id: "a2", category: "arte", title: "Figura Coleccionable Premium", description: "Transforma personas en figuras coleccionables estilo Bandai/Nendoroid.", preview: "Ultra detailed collectible figure, chibi style, Nendoroid/Bandai quality, [PERSON/CHARACTER] transformed into a figure, display base included, blister packaging background, product photography lighting, 8K render --ar 1:1", tags: ["Figura", "Coleccionable"], compat: ["Midjourney", "Leonardo"], diff: "Intermedio", pop: 91 },
  { id: "a3", category: "arte", title: "Render Hiperrealista Cinemático", description: "Escena ultra realista estilo película con dirección de arte de alto nivel.", preview: "Hyperrealistic cinematic render, [SCENE], photorealistic lighting, volumetric fog, ray tracing, Unreal Engine 5 quality, 8K ultra detailed, award-winning CGI, movie production quality --ar 21:9", tags: ["Render", "Cinematic", "Ultra"], compat: ["Midjourney", "Runway"], diff: "Avanzado", pop: 88, featured: true },
  { id: "a4", category: "arte", title: "Estilo Watercolor Artístico", description: "Retratos y escenas en acuarela con estética premium artística.", preview: "Delicate watercolor portrait, [SUBJECT], soft flowing colors, visible brushstrokes, wet-on-wet technique, artistic paper texture, pastel tones with deep accents, fine art quality, gallery-worthy illustration --ar 3:4", tags: ["Watercolor", "Arte"], compat: ["Midjourney", "Leonardo"], diff: "Básico", pop: 82 },
  { id: "g1", category: "gaming", title: "Diseño Completo de Videojuego", description: "Concepto completo de videojuego: mecánicas, narrativa, economía y diseño.", preview: "Actúa como game designer senior. Diseña un videojuego completo de [GÉNERO]. Incluye: premisa y narrativa central, mecánicas de juego principales, loop de gameplay, sistema de economía, progresión del jugador y elementos de monetización éticos. Hazlo de nivel AAA.", tags: ["GameDesign", "Concepto"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 89, featured: true },
  { id: "g2", category: "gaming", title: "Diseño de Personaje Épico", description: "Crea protagonistas, NPCs y villanos con profundidad narrativa y visual.", preview: "Diseña un personaje para videojuego de [GÉNERO]. Incluye: nombre, origen, motivaciones profundas, arco de desarrollo, habilidades únicas, diseño visual (ropa, armas, colores), voz y personalidad. Que sea memorable y con potencial de icono cultural.", tags: ["Personaje", "RPG"], compat: ["ChatGPT", "Claude", "Gemini"], diff: "Intermedio", pop: 85 },
  { id: "g3", category: "gaming", title: "Narrativa RPG Inmersiva", description: "Misiones, diálogos y storytelling interactivo de nivel profesional.", preview: "Escribe el primer acto de un RPG. Género: [GÉNERO]. Mundo: [DESCRIPCIÓN]. El protagonista es [DESCRIPCIÓN]. Incluye escena de apertura con hook poderoso, primer NPC memorable, primera decisión moral y consecuencias que ramifican la historia. Estilo: BioWare/CDPR.", tags: ["Narrativa", "RPG", "Historia"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 86, trending: true },
  { id: "pr1", category: "programacion", title: "Arquitectura de Software Escalable", description: "Diseño arquitectónico moderno preparado para millones de usuarios.", preview: "Actúa como arquitecto de software senior. Diseña la arquitectura completa para [APP]. Incluye: stack tecnológico recomendado con justificación, diagrama de microservicios/módulos, estrategia de base de datos, caching, seguridad, escalabilidad y plan de implementación por fases.", tags: ["Arquitectura", "Backend", "Escalable"], compat: ["ChatGPT", "Claude", "Cursor AI"], diff: "Avanzado", pop: 92, featured: true },
  { id: "pr2", category: "programacion", title: "Code Review Senior Dev", description: "Análisis profundo de código con nivel de senior developer de 10+ años.", preview: "Actúa como senior developer con 10 años en producción. Revisa este código:\n\n[CÓDIGO]\n\nEvalúa: 1) Performance y optimizaciones, 2) Seguridad y vulnerabilidades, 3) Mantenibilidad y legibilidad, 4) Best practices, 5) Bugs potenciales. Reescribe las secciones críticas.", tags: ["CodeReview", "Senior"], compat: ["ChatGPT", "Claude", "Cursor AI"], diff: "Avanzado", pop: 95, trending: true },
  { id: "pr3", category: "programacion", title: "Debug Experto con 5 Porqués", description: "Encuentra la causa raíz de cualquier bug con metodología probada.", preview: "Tengo este error: [ERROR]\nEn este código: [CÓDIGO]\nStack: [TECNOLOGÍAS]\n\nAplica los 5 porqués para encontrar la causa raíz. Dame: diagnóstico exacto, fix inmediato, fix estructural y cómo crear un test para prevenir esto en el futuro.", tags: ["Debug", "Fix", "Testing"], compat: ["ChatGPT", "Claude", "Cursor AI"], diff: "Básico", pop: 97 },
  { id: "pr4", category: "programacion", title: "Componente Frontend Premium", description: "UI components modernos, accesibles y reutilizables con código limpio.", preview: "Crea un componente [TIPO] usando [React/Vue/Svelte] con TypeScript y Tailwind CSS. Requisitos: accesible (ARIA), responsive mobile-first, animaciones suaves con Framer Motion, estados (loading/error/empty), documentación JSDoc y tests básicos.", tags: ["Frontend", "React", "UI"], compat: ["ChatGPT", "Claude", "Cursor AI"], diff: "Intermedio", pop: 88 },
  { id: "pr5", category: "programacion", title: "API REST Completa con Auth", description: "API profesional con autenticación, validación y documentación OpenAPI.", preview: "Diseña y documenta una API REST para [FUNCIONALIDAD]. Incluye: endpoints con métodos HTTP, JWT auth, request/response schemas con validación Zod, manejo de errores estandarizado, rate limiting, documentación OpenAPI 3.0 y tests con ejemplos.", tags: ["API", "REST", "Auth"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 84 },
  { id: "m1", category: "marketing", title: "10 Hooks Virales TikTok/Reels", description: "Ganchos que paran el scroll en los primeros 3 segundos garantizados.", preview: "Crea 10 hooks virales para [NICHO] en TikTok/Reels. Usa estas estructuras: 1) Pregunta provocadora, 2) Estadística impactante, 3) Contraintuitivo, 4) Secreto revelado, 5) Error común, 6) Antes/después, 7) Número específico, 8) Amenaza, 9) Curiosidad, 10) Confesión. Máximo 8 palabras cada uno.", tags: ["TikTok", "Viral", "Hooks"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 99, featured: true, trending: true },
  { id: "m2", category: "marketing", title: "Email de Ventas de Alto Impacto", description: "Email que convierte usando psicología de persuasión avanzada.", preview: "Escribe un email de ventas para [PRODUCTO] dirigido a [AUDIENCIA]. Usa: Subject line con open rate >40%, estructura PAS evolucionada, historia de transformación de 2 líneas, beneficio principal con prueba, objeción principal destruida, urgencia real y CTA irresistible. Tono: [FORMAL/CASUAL].", tags: ["Email", "Ventas", "Conversión"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 91, featured: true },
  { id: "m3", category: "marketing", title: "Estrategia Completa de Contenido", description: "Plan de contenido de 30 días con pilares, ideas y calendario editorial.", preview: "Crea una estrategia de contenido de 30 días para [MARCA/PERSONA] en [PLATAFORMAS]. Incluye: 3 pilares de contenido, 30 ideas de posts con ángulos específicos, calendario semanal, formatos recomendados, CTAs por tipo de contenido y métricas clave a trackear.", tags: ["Contenido", "Estrategia", "30días"], compat: ["ChatGPT", "Claude", "Gemini"], diff: "Intermedio", pop: 87 },
  { id: "m4", category: "marketing", title: "Lanzamiento de Producto Viral", description: "Estrategia de lanzamiento digital que genera hype y ventas desde el día 1.", preview: "Diseña la estrategia de lanzamiento para [PRODUCTO] con presupuesto [BAJO/MEDIO/ALTO]. Incluye: fase pre-lanzamiento (7 días), día de lanzamiento, fase post-lanzamiento (3 días), contenido para cada fase, emails de secuencia, precio psicológico y cómo crear urgencia real.", tags: ["Lanzamiento", "Viral", "Producto"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 89, trending: true },
  { id: "fi1", category: "fitness", title: "Plan de Entrenamiento Personalizado", description: "Rutina científica adaptada a tu objetivo, nivel y tiempo disponible.", preview: "Actúa como coach fitness certificado. Crea mi plan de entrenamiento para [OBJETIVO: masa/definición/fuerza/resistencia]. Datos: género [H/M], edad [EDAD], nivel [PRINCIPIANTE/INTERMEDIO/AVANZADO], días disponibles [DÍAS], equipamiento [GYM/CASA/NADA]. Incluye: rutina semanal, series/reps, descansos y progresión.", tags: ["Fitness", "Rutina", "Entrenamiento"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 94, genderMode: true },
  { id: "fi2", category: "fitness", title: "Rutina Hipertrofia Máxima", description: "Plan científico para maximizar masa muscular con periodización avanzada.", preview: "Diseña un programa de hipertrofia de 12 semanas para [NIVEL]. Incluye: split óptimo, ejercicios con variantes, volumen semanal por grupo muscular, progresión de carga (sobrecarga progresiva), deload estratégico, suplementación básica recomendada y señales de sobreentrenamiento.", tags: ["Hipertrofia", "Masa", "Muscular"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 88, featured: true },
  { id: "fi3", category: "fitness", title: "Pérdida de Grasa Definitiva", description: "Plan de definición que preserva músculo mientras quema grasa máxima.", preview: "Crea mi plan de pérdida de grasa para [SEMANAS] semanas. Peso actual: [PESO]kg, objetivo: perder [X]kg. Incluye: déficit calórico personalizado, distribución de macros, cardio óptimo que no cataboliza, qué comer antes/después del gym, y cómo mantener los resultados.", tags: ["Definición", "Pérdida", "Grasa"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 92, genderMode: true },
  { id: "n1", category: "nutricion", title: "Plan Nutricional Personalizado", description: "Alimentación científica adaptada a tus objetivos y estilo de vida.", preview: "Actúa como nutricionista clínico. Crea mi plan nutricional para [OBJETIVO]. Datos: peso [PESO]kg, altura [ALTURA]cm, actividad [SEDENTARIO/ACTIVO/MUY ACTIVO]. Incluye: calorías totales, distribución de macros, timing de comidas, 5 ejemplos de días completos y suplementos básicos.", tags: ["Nutrición", "Plan", "Personalizado"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 93, genderMode: true },
  { id: "n2", category: "nutricion", title: "Meal Prep Semanal Completo", description: "7 días de comidas preparadas en 2 horas para ahorrar tiempo y dinero.", preview: "Diseña un meal prep completo para esta semana. Objetivo: [OBJETIVO nutricional]. Presupuesto: [BAJO/MEDIO]. Tiempo de cocción: máximo 2 horas. Incluye: lista de compras optimizada, orden de preparación, 5 días de desayuno/almuerzo/cena, macros por día y tips de conservación.", tags: ["MealPrep", "Batch", "Cocina"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 89 },
  { id: "ps1", category: "psicologia", title: "Análisis Psicológico Profundo", description: "Análisis de patrones mentales, creencias limitantes y mapa emocional.", preview: "Actúa como psicólogo clínico con enfoque cognitivo-conductual. Hazme un análisis basado en estas respuestas: [RESPUESTAS]. Identifica: patrones de pensamiento automático, creencias limitantes core, estilo de apego, mecanismos de defensa y plan de trabajo de 4 semanas para mejora.", tags: ["Psicología", "Análisis", "Mental"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 95, featured: true },
  { id: "ps2", category: "psicologia", title: "Anti-Ansiedad Toolkit Completo", description: "Herramientas prácticas y basadas en evidencia para gestionar la ansiedad.", preview: "Actúa como terapeuta especialista en ansiedad. Mi situación: [DESCRIPCIÓN]. Dame: técnica de regulación inmediata (< 5 min), protocolo de desescalada para crisis, reestructuración cognitiva para mis pensamientos específicos, rutina diaria anti-ansiedad y señales de alerta temprana.", tags: ["Ansiedad", "Toolkit", "Bienestar"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 92 },
  { id: "ps3", category: "psicologia", title: "Reprogramación de Creencias", description: "Identifica y reemplaza creencias limitantes con evidencia y técnicas NLP.", preview: "Quiero reprogramar esta creencia limitante: '[CREENCIA]'. Aplica: 1) Origen de la creencia, 2) Evidencia en contra, 3) Costo real de mantenerla, 4) Creencia potenciadora de reemplazo, 5) 3 ejercicios prácticos para instalarla, 6) Afirmaciones específicas y protocolo de 21 días.", tags: ["Creencias", "Reprogramación", "NLP"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 87, trending: true },
  { id: "mu1", category: "musica", title: "Canción Completa Personalizada", description: "Letra, estructura, hooks y dirección musical de una canción profesional.", preview: "Compón una canción completa de [GÉNERO] sobre [TEMA EMOCIONAL]. Incluye: título memorable, verso 1 (narrativo), pre-coro (build up emocional), coro (hook pegajoso y memorable), verso 2 (desarrollo), puente emocional (climax), outro. Estilo lírico: [ARTISTA DE REFERENCIA]. Metáforas originales, nada cliché.", tags: ["Canción", "Letra", "Composición"], compat: ["ChatGPT", "Claude", "Suno"], diff: "Intermedio", pop: 91, featured: true },
  { id: "mu2", category: "musica", title: "Prompt para Suno/Udio Avanzado", description: "Genera prompts ultra específicos para crear música con IA de calidad profesional.", preview: "Create a professional [GENRE] track: [MOOD] atmosphere, [TEMPO]bpm, featuring [INSTRUMENTS], [VOCAL STYLE] vocals with [LANGUAGE] lyrics about [THEME], production style similar to [ARTIST REFERENCE], [ENERGY LEVEL] energy, for [USE CASE: playlist/film/gym/etc], professional mixing and mastering quality", tags: ["Suno", "Udio", "MúsicaIA"], compat: ["Suno", "ChatGPT"], diff: "Básico", pop: 88 },
  { id: "ar1", category: "arquitectura", title: "Casa Moderna Premium", description: "Diseño arquitectónico residencial moderno con todos los detalles.", preview: "Modern luxury house exterior, contemporary architecture, floor-to-ceiling windows, minimalist facade, infinity pool, landscaped garden, sunset lighting, photorealistic render, Zaha Hadid meets Tadao Ando aesthetic, concrete and glass, ultra detailed --ar 16:9", tags: ["Casa", "Arquitectura", "Moderno"], compat: ["Midjourney", "ChatGPT"], diff: "Básico", pop: 86 },
  { id: "ar2", category: "arquitectura", title: "Home Office Premium", description: "Espacio de trabajo en casa que maximiza productividad y estética.", preview: "Diseña mi home office ideal. Dimensiones: [MxM]. Presupuesto: [BAJO/MEDIO/ALTO]. Necesito: zona de trabajo principal, área de videollamadas, almacenamiento, iluminación óptima y sistema de cable management. Estilo: [MINIMALISTA/INDUSTRIAL/ESCANDINAVO]. Dame lista de mobiliario y distribución.", tags: ["HomeOffice", "Diseño", "Workspace"], compat: ["ChatGPT", "Midjourney"], diff: "Básico", pop: 83 },
  { id: "v1", category: "viajes", title: "Itinerario de Viaje Premium", description: "Plan de viaje completo día por día con experiencias únicas y locales.", preview: "Crea un itinerario de [DÍAS] días en [DESTINO] para [TIPO: mochilero/familia/pareja/solo]. Presupuesto: [BAJO/MEDIO/ALTO]. Incluye: alojamiento recomendado, actividades por día con horarios, restaurantes locales (no turísticos), tips insider, transporte entre lugares y experiencias únicas que pocos conocen.", tags: ["Viaje", "Itinerario", "Travel"], compat: ["ChatGPT", "Gemini"], diff: "Básico", pop: 90, trending: true },
  { id: "v2", category: "viajes", title: "Nómada Digital: Mejor Ciudad", description: "Encuentra tu ciudad ideal para trabajar remotamente con análisis completo.", preview: "Soy nómada digital con presupuesto de $[X]/mes. Trabajo remotamente en [INDUSTRIA]. Prioridades: internet rápido, coworking, seguridad, comunidad expat, clima [PREFERENCIA], visado fácil. Analiza las 5 mejores ciudades del mundo para mí ahora mismo, con pros/contras y costo de vida detallado.", tags: ["Nómada", "Digital", "Remoto"], compat: ["ChatGPT", "Gemini", "Claude"], diff: "Básico", pop: 87 },
  { id: "au1", category: "automatizacion", title: "Sistema de Automatización Completo", description: "Flujo automatizado que ahorra 10+ horas semanales en tu negocio.", preview: "Actúa como experto en automatización con n8n/Make. Analiza mi proceso: [PROCESO]. Tiempo actual: [X] horas/semana. Diseña un sistema de automatización completo con: herramientas recomendadas, diagrama de flujo, triggers y acciones, manejo de errores, costo mensual estimado y ROI calculado.", tags: ["Automatización", "n8n", "Make"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 88, featured: true },
  { id: "au2", category: "automatizacion", title: "Bot de Atención al Cliente IA", description: "Chatbot inteligente que responde y convierte 24/7 sin intervención humana.", preview: "Diseña un sistema de chatbot IA para [NEGOCIO]. Incluye: árbol de conversación completo, respuestas a las 20 preguntas más frecuentes, escalado a humano cuando sea necesario, integración con [CRM/WhatsApp/Web], mensajes de ventas no invasivos y métricas de efectividad.", tags: ["Chatbot", "Atención", "IA"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 85 },
  { id: "e1", category: "educacion", title: "Curso Online Completo", description: "Diseño instruccional completo de un curso digital vendible y efectivo.", preview: "Diseña la estructura completa de un curso online sobre [TEMA]. Duración: [HORAS]. Nivel: [PRINCIPIANTE/INTERMEDIO]. Incluye: nombre del curso (SEO-friendly), subtítulo de ventas, módulos y lecciones detalladas, ejercicios prácticos por módulo, materiales descargables, quiz de evaluación y estrategia de precio.", tags: ["Curso", "Online", "Educación"], compat: ["ChatGPT", "Claude", "Gemini"], diff: "Avanzado", pop: 87 },
  { id: "e2", category: "educacion", title: "Tutor IA Personalizado", description: "Aprende cualquier tema al ritmo perfecto con explicaciones adaptadas a ti.", preview: "Actúa como mi tutor personal de [TEMA]. Mi nivel actual: [NIVEL]. Mi objetivo: [META]. Tiempo disponible: [X] horas/semana. Crea: plan de estudio de [SEMANAS] semanas, materiales por semana, método de evaluación del progreso, ejercicios prácticos y cómo sabremos que dominé el tema.", tags: ["Tutor", "Aprendizaje", "Personalizado"], compat: ["ChatGPT", "Claude", "Gemini"], diff: "Básico", pop: 93, trending: true },
  { id: "fr1", category: "freelancing", title: "Sistema de Captación de Clientes", description: "Estrategia probada para conseguir clientes premium de forma consistente.", preview: "Actúa como coach de negocios freelance. Mi servicio: [SERVICIO]. Mercado objetivo: [CLIENTE IDEAL]. Precio: [X]/hora o proyecto. Diseña: mensaje de prospección frío que convierte, propuesta de valor única, perfil de LinkedIn/Upwork optimizado, proceso de calificación de leads y cómo cerrar el primer cliente esta semana.", tags: ["Freelance", "Clientes", "Negocio"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 90, featured: true },
  { id: "fr2", category: "freelancing", title: "Propuesta de Proyecto Ganadora", description: "Propuesta profesional que gana proyectos por encima de competidores más baratos.", preview: "Escribe una propuesta de proyecto para [CLIENTE] que solicita [PROYECTO]. Mi tarifa: [PRECIO] (no la más barata). Estructura ganadora: resumen ejecutivo, solución propuesta con método único, entregables exactos con tiempos, casos de éxito relevantes, precio con justificación de valor y próximos pasos claros.", tags: ["Propuesta", "Proyecto", "Ganadora"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 86 },
  { id: "fn1", category: "finanzas", title: "Plan Financiero Personal Completo", description: "Control total de tus finanzas con plan de ahorro, inversión y libertad financiera.", preview: "Actúa como asesor financiero personal. Mis ingresos: $[X]/mes. Gastos fijos: $[Y]/mes. Deudas: [DESCRIPCIÓN]. Objetivo: [LIBERTAD FINANCIERA/CASA/FONDO EMERGENCIA]. Crea: presupuesto optimizado (50/30/20 adaptado), plan de pago de deudas (avalanche/snowball), estrategia de ahorro e inversión inicial según mi perfil de riesgo.", tags: ["Finanzas", "Presupuesto", "Ahorro"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 91 },
  { id: "fn2", category: "finanzas", title: "Inversión para Principiantes", description: "Empieza a invertir con poco dinero y estrategia clara de largo plazo.", preview: "Soy principiante total en inversiones. Tengo $[X] para empezar y puedo invertir $[Y]/mes. Objetivo: [PLAZO AÑOS]. Tolerancia al riesgo: [BAJA/MEDIA/ALTA]. Explícame: opciones de inversión disponibles para mí, cartera inicial recomendada con porcentajes, plataforma para empezar, errores a evitar y cómo revisar mi portafolio.", tags: ["Inversión", "Principiante", "Finanzas"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 89 },
  { id: "st1", category: "storytelling", title: "Historia que Vende (Storytelling)", description: "Narrativa emocional que conecta profundamente y convierte en ventas.", preview: "Crea una historia de storytelling para [MARCA/PRODUCTO]. Estructura Hero's Journey adaptada al marketing: 1) Mundo ordinario del cliente, 2) El problema que lo persigue, 3) Intentos fallidos anteriores, 4) El cambio que tu producto representa, 5) La transformación específica, 6) La nueva vida posible. Tono: [EMOCIONAL/ASPIRACIONAL/INSPIRADOR].", tags: ["Storytelling", "Ventas", "Narrativa"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 92, trending: true },
  { id: "st2", category: "storytelling", title: "Guion Cinematográfico Corto", description: "Historia visual con estructura de 3 actos lista para producción.", preview: "Escribe el guion de un cortometraje de [MINUTOS] minutos. Género: [GÉNERO]. Tema: [TEMA]. Estructura: Acto 1 (gancho + presentación mundo), Acto 2 (conflicto + escalada), Acto 3 (clímax + resolución emocional). Incluye: escenas numeradas, diálogos naturales, acotaciones visuales y descripción del mood cinematográfico.", tags: ["Guion", "Cortometraje", "Cine"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 84 },
  { id: "bh1", category: "biohacking", title: "Sistema de Sueño Óptimo", description: "Protocolo científico para sueño profundo, más energía y mayor rendimiento.", preview: "Actúa como especialista en medicina del sueño. Analiza mi situación: duermo [X] horas, me despierto [VECES], me siento [ENERGÍA] al levantarme. Diseña: protocolo de higiene de sueño completo, rutina de 1 hora antes de dormir, optimización del ambiente, suplementación natural segura y cómo trackear la calidad de sueño.", tags: ["Sueño", "Biohacking", "Energía"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 90 },
  { id: "bh2", category: "biohacking", title: "Stack de Rendimiento Mental", description: "Protocolo para máximo foco, memoria y claridad mental durante horas.", preview: "Diseña mi stack de rendimiento cognitivo. Objetivo: [MÁXIMO FOCO/MEMORIA/CREATIVIDAD/ENERGÍA]. Horario trabajo: [X]am-[Y]pm. Quiero: rutina de mañana optimizada (primeras 2 horas), estrategia de bloques de trabajo, pausas estratégicas, nutrición para el cerebro, suplementos naturales con evidencia científica y protocolo de 4 semanas.", tags: ["Foco", "Cognición", "Performance"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 87, trending: true },
  { id: "ec1", category: "ecommerce", title: "Lanzamiento de Tienda Online", description: "Estrategia completa para lanzar un ecommerce rentable desde cero.", preview: "Actúa como experto en ecommerce. Quiero lanzar una tienda de [NICHO]. Presupuesto inicial: $[X]. Diseña: validación del nicho (competencia y demanda), plataforma recomendada con justificación, estructura de la tienda, primeros 10 productos con pricing, estrategia de tráfico inicial (sin anuncios pagados), y proyección de primeras 90 días.", tags: ["Ecommerce", "Tienda", "Online"], compat: ["ChatGPT", "Claude"], diff: "Avanzado", pop: 88 },
  { id: "dg1", category: "diseno", title: "Sistema de Branding Completo", description: "Identidad visual coherente y profesional para marca desde cero.", preview: "Diseña la identidad visual completa para [MARCA]. Industria: [INDUSTRIA]. Público: [DESCRIPCIÓN]. Incluye: concepto de marca (palabras clave de percepción), paleta de colores primaria y secundaria con códigos hex, tipografías (display + body), logo descripción conceptual, patrones o texturas, y guía de aplicación en 5 medios clave.", tags: ["Branding", "Identidad", "Visual"], compat: ["ChatGPT", "Midjourney"], diff: "Avanzado", pop: 91, featured: true },
  { id: "dg2", category: "diseno", title: "Contenido Visual para Redes", description: "Pack de contenido visual coherente y de alto engagement para redes.", preview: "Diseña un sistema de contenido visual para [MARCA] en [PLATAFORMAS]. Incluye: descripción de 5 templates reutilizables, reglas de composición, paleta de colores con aplicación, tipografía en posts, estilo fotográfico, iconografía y un calendario visual de 2 semanas con especificaciones de diseño por formato.", tags: ["Social", "Diseño", "Templates"], compat: ["ChatGPT", "Midjourney"], diff: "Intermedio", pop: 86 },
  { id: "br1", category: "branding", title: "Marca Personal Poderosa", description: "Construye una marca personal que abre puertas y genera autoridad.", preview: "Actúa como experto en personal branding. Mi profesión: [PROFESIÓN]. Audiencia objetivo: [QUIÉN QUIERO ATRAER]. Objetivo: [CONSEGUIR CLIENTES/EMPLEO PREMIUM/INFLUENCIA]. Diseña: propuesta de valor única, posicionamiento diferencial, pilares de contenido, bio optimizada para cada plataforma, estrategia de visibilidad y cómo construir autoridad en 90 días.", tags: ["MarcaPersonal", "Branding", "Autoridad"], compat: ["ChatGPT", "Claude"], diff: "Intermedio", pop: 93, trending: true },
  { id: "cu1", category: "cursor", title: "Debugging Avanzado con Cursor", description: "Usa Cursor AI al máximo para resolver bugs complejos en segundos.", preview: "Usa Cursor AI para resolver este bug en mi proyecto [STACK]:\n\nError: [ERROR]\nArchivo: [NOMBRE]\nCódigo problemático: [CÓDIGO]\n\nInstrucciones para Cursor: analiza el error en contexto completo del proyecto, sugiere el fix con explicación, identifica efectos secundarios posibles y genera un test que prevenga esta regresión.", tags: ["Cursor", "Debug", "IA"], compat: ["Cursor AI", "Claude"], diff: "Intermedio", pop: 94, featured: true },
  { id: "cu2", category: "cursor", title: "Feature Completa con Cursor AI", description: "Genera funcionalidades completas usando Cursor como co-developer experto.", preview: "Cursor AI, actúa como senior developer. Necesito implementar: [FEATURE]. Stack actual: [TECNOLOGÍAS]. Pasos: 1) Analiza el codebase existente, 2) Diseña la arquitectura de la feature, 3) Crea todos los archivos necesarios, 4) Actualiza los existentes, 5) Añade tipos TypeScript, 6) Incluye manejo de errores y 7) Genera tests básicos.", tags: ["Cursor", "Feature", "Dev"], compat: ["Cursor AI", "Claude"], diff: "Avanzado", pop: 90 },
  { id: "sv1", category: "supervivencia", title: "Kit de Emergencia Completo", description: "Lista maestra y protocolos para cualquier situación de emergencia.", preview: "Actúa como experto en preparación de emergencias. Crea un kit de emergencia completo para [TIPO: hogar/auto/trabajo/mochila]. Incluye: lista priorizada de items con cantidades, costo estimado, dónde conseguirlos, rotación de productos perecederos, protocolo de uso en emergencias y plan de evacuación básico.", tags: ["Emergencia", "Preparación", "Survival"], compat: ["ChatGPT", "Claude"], diff: "Básico", pop: 82 },
];

const PROMPTS: Prompt[] = RAW_PROMPTS.map((p) => ({
  ...p,
  _search: normalize(`${p.title} ${p.description} ${p.tags.join(" ")}`),
}));

const TOP_PROMPTS = PROMPTS.filter((p) => p.trending || p.featured)
  .sort((a, b) => b.pop - a.pop)
  .slice(0, 6);

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Sora',sans-serif;background:#050507;color:#e2e2e8}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#0a0a0f}
::-webkit-scrollbar-thumb{background:#1a1a2e;border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:0.8}}
.fu{animation:fadeUp 0.5s ease forwards}
.fu2{animation:fadeUp 0.5s 0.1s ease both}
.fu3{animation:fadeUp 0.5s 0.2s ease both}
.fu4{animation:fadeUp 0.5s 0.3s ease both}
.card{transition:transform 0.2s ease,border-color 0.2s ease,box-shadow 0.2s ease}
.card:hover{transform:translateY(-4px);border-color:rgba(99,102,241,0.35)!important;box-shadow:0 24px 48px rgba(0,0,0,0.5),0 0 0 1px rgba(99,102,241,0.15)!important}
.ai-card{transition:all 0.25s ease}
.ai-card:hover{transform:translateY(-3px) scale(1.01)}
.cat-btn{transition:all 0.15s ease}
.copy-btn{transition:all 0.2s ease;cursor:pointer}
.copy-btn:hover{opacity:0.85}
.tab-btn{transition:all 0.15s ease}
.grid-bg{background-image:linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px);background-size:60px 60px}
input::placeholder{color:#333}
input:focus{outline:none}
button{font-family:'Sora',sans-serif;cursor:pointer}
button:focus-visible{outline:2px solid #6366f1;outline-offset:2px}`;

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */
function CopyMenu({ prompt, gender }: { prompt: Prompt; gender: Gender }) {
  const [state, setState] = useState<"idle" | "copied" | "menu">("idle");
  const text = gender === "mujer" && prompt.previewF ? prompt.previewF : prompt.preview;

  const openInAI = (name: string) => {
    const encodedText = encodeURIComponent(text);
    const baseUrl = AI_LINKS[name];
    if (baseUrl) window.open(`${baseUrl}${encodedText}`, "_blank", "noopener,noreferrer");
    setState("idle");
  };

  if (state === "menu")
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["ChatGPT", "Claude", "Gemini", "Perplexity"].map((ai) => {
          const c = AI_COMPAT[ai] || { color: "#888", bg: "rgba(136,136,136,0.1)" };
          return (
            <button
              key={ai}
              onClick={() => openInAI(ai)}
              aria-label={`Abrir en ${ai}`}
              style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${c.color}33`, background: c.bg, color: c.color }}
            >
              {ai} ↗
            </button>
          );
        })}
        <button
          onClick={() => setState("idle")}
          aria-label="Cerrar"
          style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#555" }}
        >
          ✕
        </button>
      </div>
    );

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        className="copy-btn"
        onClick={() => {
          navigator.clipboard.writeText(text);
          setState("copied");
          setTimeout(() => setState("idle"), 2000);
        }}
        aria-label={state === "copied" ? "Copiado al portapapeles" : "Copiar prompt"}
        aria-live="polite"
        style={{
          padding: "7px 14px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          border: `1px solid ${state === "copied" ? "rgba(74,222,128,0.4)" : "rgba(99,102,241,0.3)"}`,
          background: state === "copied" ? "rgba(74,222,128,0.1)" : "rgba(99,102,241,0.1)",
          color: state === "copied" ? "#4ade80" : "#818cf8",
        }}
      >
        {state === "copied" ? "✓ Copiado" : "Copiar"}
      </button>
      <button
        className="copy-btn"
        onClick={() => setState("menu")}
        aria-label="Abrir en IA"
        style={{ padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#555" }}
      >
        ↗
      </button>
    </div>
  );
}

function PromptCard({ p, gender, onBuild, isFav, onToggleFav }: { p: Prompt; gender: Gender; onBuild?: () => void; isFav: boolean; onToggleFav: () => void }) {
  const catLabel = CATS.find((c) => c.id === p.category)?.label || p.category;
  const catIcon = CATS.find((c) => c.id === p.category)?.icon || "◈";

  return (
    <article className="card" style={{ borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span aria-hidden="true" style={{ fontSize: 14, opacity: 0.6 }}>
            {catIcon}
          </span>
          <span style={{ fontSize: 10, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "JetBrains Mono,monospace" }}>
            {catLabel}
          </span>
          {p.genderMode && (
            <span aria-label="Disponible para hombre y mujer" style={{ fontSize: 10, color: "#555" }}>
              ♂♀
            </span>
          )}
          {p.trending && (
            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", fontWeight: 700 }}>
              TRENDING
            </span>
          )}
          {p.featured && !p.trending && (
            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", fontWeight: 700 }}>
              FEATURED
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: DIFF_C[p.diff], border: `1px solid ${DIFF_C[p.diff]}33`, padding: "2px 7px", borderRadius: 4, fontWeight: 700 }}>
            {p.diff}
          </span>
          <span aria-label={`Popularidad: ${p.pop}`} style={{ fontSize: 10, color: "#333", fontFamily: "JetBrains Mono,monospace" }}>
            ★{p.pop}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav();
            }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: "0 4px", color: isFav ? "#fbbf24" : "#444" }}
            aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            {isFav ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f4", marginBottom: 6, lineHeight: 1.3 }}>{p.title}</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{p.description}</p>
      </div>

      <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p style={{ fontSize: 11, color: "#444", lineHeight: 1.65, fontFamily: "JetBrains Mono,monospace", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden", whiteSpace: "pre-wrap" }}>
          {gender === "mujer" && p.previewF ? p.previewF : p.preview}
        </p>
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {p.tags.map((t) => (
          <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#444", fontFamily: "JetBrains Mono,monospace" }}>
            #{t}
          </span>
        ))}
      </div>

      {onBuild && (
        <button
          onClick={onBuild}
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            border: "1px solid rgba(99,102,241,0.35)",
            background: "rgba(99,102,241,0.08)",
            color: "#a5b4fc",
            cursor: "pointer",
            marginBottom: 10,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
        >
          ✦ Personalizar prompt →
        </button>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {p.compat.slice(0, 3).map((ai) => {
            const c = AI_COMPAT[ai] || { color: "#888", bg: "rgba(136,136,136,0.1)" };
            return (
              <span key={ai} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.color}25`, fontWeight: 600 }}>
                {ai}
              </span>
            );
          })}
        </div>
        <CopyMenu prompt={p} gender={gender} />
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [gender, setGender] = useState<Gender>("general");
  const [activeSection, setActiveSection] = useState<"prompts" | "ias" | "top">("prompts");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  
  // Simulación simple de Auth para el botón
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("promtlab_favorites");
      if (saved) setFavorites(new Set(JSON.parse(saved)));
      
      // Simular estado de registro guardado
      const userSaved = localStorage.getItem("promtlab_user");
      if (userSaved) setIsAuthenticated(true);
    } catch {}
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("promtlab_favorites", JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const normalizedQuery = useMemo(() => normalize(query), [query]);
  
  const filtered = useMemo(
    () =>
      PROMPTS.filter((p) => {
        const matchQ = !normalizedQuery || (p._search?.includes(normalizedQuery) ?? false);
        const matchCat = activeCat === "all" || p.category === activeCat;
        return matchQ && matchCat;
      }),
    [normalizedQuery, activeCat]
  );

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem("promtlab_user", JSON.stringify({ id: "user_123", name: "Usuario Nuevo" }));
    setShowRegister(false);
    setShowOnboarding(true);
  };

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: "#050507", fontFamily: "Sora,sans-serif", color: "#e2e2e8" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 200, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(5,5,7,0.85)", backdropFilter: "blur(24px)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: "#fff" }}>
                P
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: "#f0f0f4" }}>
                PROMT<span style={{ color: "#6366f1" }}>LAB</span>
              </span>
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", fontWeight: 700, letterSpacing: "0.05em" }}>
                v2.1
              </span>
            </div>
            <nav style={{ display: "flex", gap: 4 }} aria-label="Navegación principal">
              {[
                ["prompts", "Prompts"],
                ["top", "Top 10"],
                ["ias", "Mejores IAs"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as "prompts" | "ias" | "top")}
                  className="tab-btn"
                  aria-current={activeSection === id ? "page" : undefined}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "none", background: activeSection === id ? "rgba(99,102,241,0.15)" : "transparent", color: activeSection === id ? "#a5b4fc" : "#444" }}
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => (isAuthenticated ? alert("Dashboard en construcción") : setShowRegister(true))}
              style={{ padding: "7px 16px", borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#7c3aed)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              {isAuthenticated ? "Mi Cuenta" : "Registro gratis"}
            </button>
          </div>
        </header>

        <section className="grid-bg" style={{ position: "relative", overflow: "hidden", padding: "80px 24px 60px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div aria-hidden="true" style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
            <div className="fu" style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.06)", fontSize: 11, color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.04em" }}>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block", animation: "pulse 2s infinite" }} />
              BIBLIOTECA PREMIUM · {PROMPTS.length}+ PROMPTS
            </div>
            <h1 className="fu2" style={{ fontSize: "clamp(38px,5.5vw,72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.0, marginBottom: 18, color: "#f5f5fa" }}>
              Prompts que generan
              <br />
              <span style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>resultados reales.</span>
            </h1>
            <p className="fu3" style={{ color: "#4a4a5a", fontSize: 17, lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
              No prompts genéricos. Plantillas premium optimizadas para crear, vender, diseñar y dominar con IA.
            </p>
            <div className="fu4" style={{ position: "relative", maxWidth: 580, margin: "0 auto 28px" }}>
              <span aria-hidden="true" style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: 18, pointerEvents: "none" }}>
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar prompts, categorías, efectos..."
                aria-label="Buscar prompts"
                style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "#e2e2e8", fontSize: 15, fontFamily: "Sora,sans-serif", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#333", fontSize: 16 }}>
                  ✕
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }} role="group" aria-label="Filtro por género">
              {[
                ["general", "✦ General"],
                ["hombre", "♂ Hombre"],
                ["mujer", "♀ Mujer"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setGender(id as Gender)}
                  aria-pressed={gender === id}
                  style={{ padding: "7px 18px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${gender === id ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.06)"}`, background: gender === id ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)", color: gender === id ? "#a5b4fc" : "#444", transition: "all 0.15s" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {activeSection === "top" && (
          <section style={{ padding: "48px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 10, color: "#333", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "JetBrains Mono,monospace", marginBottom: 8 }}>🔥 Trending</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: "#f0f0f4" }}>Top prompts del momento</h2>
              <p style={{ fontSize: 14, color: "#444", marginTop: 6 }}>Los más copiados y usados esta semana</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
              {TOP_PROMPTS.map((p, i) => (
                <div key={p.id} style={{ position: "relative" }}>
                  <div aria-label={`Posición ${i + 1}`} style={{ position: "absolute", top: -10, left: 16, zIndex: 10, width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", border: "2px solid #050507" }}>
                    {i + 1}
                  </div>
                  <PromptCard p={p} gender={gender} isFav={favorites.has(p.id)} onToggleFav={() => toggleFavorite(p.id)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === "ias" && (
          <section style={{ padding: "48px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 10, color: "#333", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "JetBrains Mono,monospace", marginBottom: 8 }}>⚡ Herramientas</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: "#f0f0f4" }}>Mejores IAs del momento</h2>
              <p style={{ fontSize: 14, color: "#444", marginTop: 6 }}>Cada prompt, con la IA perfecta para usarlo</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
              {AI_TOOLS.map((ai) => (
                <article key={ai.id} className="ai-card" style={{ borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.05)", background: `linear-gradient(145deg,${ai.bg},rgba(255,255,255,0.01))`, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div aria-hidden="true" style={{ width: 42, height: 42, borderRadius: 12, background: ai.bg, border: `1px solid ${ai.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: ai.color }}>
                      {ai.name[0]}
                    </div>
                    <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 20, background: `${ai.badgeColor}18`, border: `1px solid ${ai.badgeColor}33`, color: ai.badgeColor, fontWeight: 700, letterSpacing: "0.03em" }}>
                      {ai.badge}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f4", marginBottom: 4 }}>{ai.name}</h3>
                    <p style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}>{ai.specialty}</p>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {ai.categories.slice(0, 3).map((cat) => {
                      const c = CATS.find((c) => c.id === cat);
                      return c ? (
                        <span key={cat} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#444" }}>
                          {c.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <a
                    href={ai.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: "auto", display: "block", textAlign: "center", padding: "9px 0", borderRadius: 10, background: `linear-gradient(135deg,${ai.color}22,${ai.color}11)`, border: `1px solid ${ai.color}33`, color: ai.color, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = `${ai.color}28`)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = `linear-gradient(135deg,${ai.color}22,${ai.color}11)`)}
                  >
                    Abrir {ai.name} ↗
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === "prompts" && (
          <>
            <section style={{ padding: "28px 24px 16px", maxWidth: 1280, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {CATS.map((c) => (
                  <button
                    key={c.id}
                    className="cat-btn"
                    onClick={() => setActiveCat(c.id)}
                    aria-pressed={activeCat === c.id}
                    style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${activeCat === c.id ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.06)"}`, background: activeCat === c.id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)", color: activeCat === c.id ? "#a5b4fc" : "#444", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span aria-hidden="true" style={{ fontSize: 11 }}>
                      {c.icon}
                    </span>
                    {c.label}
                  </button>
                ))}
                <span aria-live="polite" style={{ marginLeft: "auto", fontSize: 11, color: "#333", fontFamily: "JetBrains Mono,monospace" }}>
                  {filtered.length} prompts
                </span>
              </div>
            </section>
            <section style={{ padding: "12px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div aria-hidden="true" style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>
                    ◈
                  </div>
                  <p style={{ color: "#333", fontSize: 16, fontWeight: 600 }}>No encontramos prompts para "{query}"</p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setActiveCat("all");
                    }}
                    style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: 13 }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 }}>
                  {filtered.map((p) => {
                    // Busca un template coincidente por ID o por Categoría para activar el Builder
                    const tpl = TEMPLATES.find((t) => t.id === p.id) || TEMPLATES.find((t) => t.category === p.category);
                    return (
                      <PromptCard
                        key={p.id}
                        p={p}
                        gender={gender}
                        onBuild={tpl ? () => setActiveTemplate(tpl) : undefined}
                        isFav={favorites.has(p.id)}
                        onToggleFav={() => toggleFavorite(p.id)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ borderRadius: 20, padding: "56px 48px", textAlign: "center", background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.18)", position: "relative", overflow: "hidden" }}>
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(99,102,241,0.12),transparent 60%)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "JetBrains Mono,monospace", marginBottom: 12 }}>Premium</p>
                <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 14, color: "#f5f5fa" }}>
                  Acceso ilimitado.
                  <br />
                  Sin restricciones.
                </h2>
                <p style={{ color: "#444", fontSize: 15, marginBottom: 28, maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.7 }}>
                  Desbloquea cientos de prompts exclusivos, colecciones premium y actualizaciones semanales.
                </p>
                <button style={{ padding: "13px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg,#6366f1,#7c3aed)", color: "#fff", border: "none", cursor: "pointer" }}>
                  Comenzar gratis →
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "32px 24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>
                P
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>PROMTLAB</span>
            </div>
            <nav style={{ display: "flex", gap: 24 }} aria-label="Enlaces legales">
              {["Términos", "Privacidad", "Contacto"].map((l) => (
                <a key={l} href="#" style={{ fontSize: 12, color: "#333", textDecoration: "none" }}>
                  {l}
                </a>
              ))}
            </nav>
            <p style={{ fontSize: 11, color: "#222", fontFamily: "JetBrains Mono,monospace" }}>© 2025 PROMTLAB</p>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {activeTemplate && <PromptBuilder template={activeTemplate} onClose={() => setActiveTemplate(null)} />}
      
      {/* Placeholder para Registro - Descomenta cuando tengas el componente */}
      {showRegister && (
        <div style={{position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16}}>
           <div style={{background: '#0d0d14', padding: 24, borderRadius: 20, border: '1px solid rgba(99,102,241,0.25)', width: '100%', maxWidth: 400, textAlign: 'center'}}>
             <h3 style={{color: '#fff', marginBottom: 12}}>Registro (Simulado)</h3>
             <p style={{color: '#888', marginBottom: 20, fontSize: 14}}>Aquí iría tu componente RegisterModal</p>
             <button onClick={handleRegisterSuccess} style={{padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer'}}>Simular Registro</button>
             <button onClick={() => setShowRegister(false)} style={{display: 'block', margin: '12px auto 0', background: 'none', border: 'none', color: '#666', cursor: 'pointer'}}>Cerrar</button>
           </div>
        </div>
      )}
    </>
  );
}