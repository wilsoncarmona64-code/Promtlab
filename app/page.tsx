"use client";
import { useCallback, useMemo, useState } from "react";

type PromptCategory = "gaming"|"images"|"productivity"|"marketing"|"coding"|"writing"|"psychology";
interface Prompt { id:string; title:string; description:string; preview:string; category:PromptCategory; tags:string[]; compat:string[]; diff:string; pop:number; }

const prompts:Prompt[] = [
  {id:"1",category:"gaming",title:"Simulador RPG Medieval",description:"Convierte la IA en un juego de rol épico donde cada decisión cambia el destino.",preview:"Actúa como un RPG medieval interactivo. Soy el héroe principal. Cada respuesta debe incluir situación actual y opciones numeradas...",tags:["RPG","Medieval"],compat:["ChatGPT","Claude"],diff:"Básico",pop:98},
  {id:"2",category:"gaming",title:"Terror Psicológico",description:"La IA narra una historia de terror inmersiva donde tú decides.",preview:"Eres el narrador de un horror psicológico. Estoy solo en una mansión abandonada. Usa atmósfera densa y suspenso lento...",tags:["Terror","Horror"],compat:["ChatGPT","Claude"],diff:"Intermedio",pop:87},
  {id:"3",category:"gaming",title:"Detective Noir",description:"Investiga crímenes como detective en una ciudad oscura.",preview:"Eres mi asistente en una novela noir. Soy el detective Jake Raven. Hay un asesinato sin resolver. Preséntame el caso con pistas...",tags:["Detective","Misterio"],compat:["ChatGPT","Claude","Gemini"],diff:"Intermedio",pop:82},
  {id:"4",category:"gaming",title:"Supervivencia Post-Apocalíptica",description:"Sobrevive en un mundo destruido tomando decisiones críticas.",preview:"El mundo colapsó hace 3 años. Soy un sobreviviente con 2 latas de comida y una pistola. Cada decisión importa...",tags:["Survival","Estrategia"],compat:["ChatGPT","Claude","Gemini"],diff:"Avanzado",pop:91},
  {id:"5",category:"gaming",title:"Simulador de Civilización",description:"Construye y gobierna tu propia civilización.",preview:"Eres el simulador de mi civilización. Estoy en el año 3000 AC con 50 aldeanos y un río. Cada turno presenta retos reales...",tags:["Civilización","Gestión"],compat:["ChatGPT","Claude"],diff:"Avanzado",pop:76},
  {id:"6",category:"images",title:"Retrato Cinemático Ultra Real",description:"Genera retratos hiperrealistas con iluminación dramática.",preview:"Portrait photography, 35mm lens, f/1.4, golden hour backlight, shallow depth of field, ultra detailed --ar 2:3 --style raw",tags:["Midjourney","Retrato"],compat:["Gemini"],diff:"Intermedio",pop:95},
  {id:"7",category:"images",title:"Arquitectura Futurista",description:"Crea edificios imposibles que mezclan brutalismo con sci-fi.",preview:"Brutalist futuristic megastructure, concrete and glass, dramatic clouds, Zaha Hadid style, 8K, cinematic --ar 16:9",tags:["Arquitectura","SciFi"],compat:["ChatGPT","Gemini"],diff:"Básico",pop:88},
  {id:"8",category:"images",title:"Estilo Studio Ghibli",description:"Ilustraciones con la calidez visual característica de Ghibli.",preview:"Studio Ghibli style illustration, soft watercolor, warm afternoon light, magical atmosphere, Hayao Miyazaki aesthetic",tags:["Anime","Ghibli"],compat:["ChatGPT","Gemini"],diff:"Básico",pop:93},
  {id:"9",category:"images",title:"Logo Minimalista Premium",description:"Diseña logos modernos con estética SaaS limpia.",preview:"Minimalist vector logo, single color, geometric abstraction, negative space design, premium tech startup aesthetic",tags:["Logo","Diseño"],compat:["ChatGPT","Gemini"],diff:"Básico",pop:79},
  {id:"10",category:"images",title:"Concept Art Dark Fantasy",description:"Concept art de personajes épicos con detalle extremo.",preview:"Dark fantasy character concept art, detailed armor with runes, dramatic rim lighting, ArtStation trending, hyperdetailed 4K",tags:["ConceptArt","Fantasy"],compat:["Gemini"],diff:"Avanzado",pop:84},
  {id:"11",category:"productivity",title:"Coach de Disciplina Semanal",description:"La IA se convierte en tu entrenador de hábitos más exigente.",preview:"Actúa como mi coach de alta performance. Mi objetivo es [OBJETIVO]. Crea un plan semanal con bloques de tiempo y micro-hábitos...",tags:["Hábitos","Coach"],compat:["ChatGPT","Claude","Gemini"],diff:"Básico",pop:96},
  {id:"12",category:"productivity",title:"Aprende Cualquier Tema en 1 Hora",description:"Aprende lo fundamental con un plan de estudio acelerado.",preview:"Quiero aprender sobre [TEMA] en 1 hora. Crea mapa mental, los 5 conceptos clave, 3 recursos gratuitos y un mini quiz...",tags:["Estudio","Aprendizaje"],compat:["ChatGPT","Claude","Gemini"],diff:"Básico",pop:89},
  {id:"13",category:"productivity",title:"Anti-Procrastinación 5 Min",description:"Rompe el bloqueo mental y empieza cualquier tarea difícil.",preview:"Tengo que hacer [TAREA] pero llevo procrastinando. Dame un plan de arranque de 5 minutos con el primer paso mínimo posible...",tags:["Focus","Mental"],compat:["ChatGPT","Claude","Gemini"],diff:"Básico",pop:97},
  {id:"14",category:"productivity",title:"Sistema Zettelkasten",description:"Transforma cualquier texto en notas atómicas interconectadas.",preview:"Actúa como experto en Zettelkasten. Analiza este texto: [TEXTO]. Crea notas atómicas con concepto, conexiones y pregunta...",tags:["Notas","Método"],compat:["ChatGPT","Claude"],diff:"Avanzado",pop:71},
  {id:"15",category:"productivity",title:"Planificador OKR",description:"Define tus objetivos con el método OKR de Google.",preview:"Ayúdame a definir mis OKRs para [PERÍODO]. Mi meta es [META]. Crea 3 Objectives con 3 Key Results y métricas concretas...",tags:["OKR","Metas"],compat:["ChatGPT","Claude"],diff:"Intermedio",pop:80},
  {id:"16",category:"marketing",title:"10 Hooks Virales TikTok",description:"Genera ganchos irresistibles que detienen el scroll.",preview:"Crea 10 hooks virales para TikTok sobre [NICHO]. Usa: pregunta provocadora, estadística impactante, secreto revelado. Máximo 10 palabras...",tags:["TikTok","Viral"],compat:["ChatGPT","Claude","Gemini"],diff:"Básico",pop:99},
  {id:"17",category:"marketing",title:"Email de Ventas que Convierte",description:"Emails basados en psicología de persuasión.",preview:"Escribe email de ventas para [PRODUCTO] usando PAS. Incluye asunto que abre, historia corta y urgencia genuina...",tags:["Email","Ventas"],compat:["ChatGPT","Claude"],diff:"Intermedio",pop:86},
  {id:"18",category:"marketing",title:"Caption Instagram Premium",description:"Captions que combinan storytelling y llamadas a la acción.",preview:"Escribe 3 variantes de caption para Instagram sobre [TEMA]. Gancho en línea 1, historia en 2-3 líneas y CTA natural...",tags:["Instagram","Caption"],compat:["ChatGPT","Claude","Gemini"],diff:"Básico",pop:92},
  {id:"19",category:"marketing",title:"Análisis de Competidores",description:"Analiza tu competencia como consultor senior.",preview:"Analiza a [COMPETIDOR] en [INDUSTRIA]. Evalúa propuesta de valor, puntos débiles y oportunidades sin aprovechar...",tags:["Estrategia","Análisis"],compat:["ChatGPT","Claude"],diff:"Avanzado",pop:78},
  {id:"20",category:"marketing",title:"Script de Video YouTube",description:"Guión completo que retiene la atención de inicio a fin.",preview:"Escribe guión de YouTube de [DURACIÓN] sobre [TEMA]. Gancho brutal en primeros 15 seg, 3-5 puntos clave y CTA claro...",tags:["YouTube","Script"],compat:["ChatGPT","Claude","Gemini"],diff:"Intermedio",pop:83},
  {id:"21",category:"coding",title:"Code Review Senior Dev",description:"Analiza tu código como un senior developer experimentado.",preview:"Actúa como senior developer. Revisa este código: [CÓDIGO]. Evalúa performance, seguridad y mantenibilidad. Reescribe las partes críticas...",tags:["CodeReview","Debug"],compat:["ChatGPT","Claude","Gemini"],diff:"Avanzado",pop:94},
  {id:"22",category:"coding",title:"Componente React Premium",description:"Transforma descripciones en componentes React limpios.",preview:"Crea componente React funcional para [DESCRIPCIÓN]. Usa TypeScript, Tailwind CSS y best practices 2025...",tags:["React","TypeScript"],compat:["ChatGPT","Claude"],diff:"Intermedio",pop:88},
  {id:"23",category:"coding",title:"Debug Experto",description:"Encuentra y soluciona bugs con metodología sistemática.",preview:"Tengo este error: [ERROR]. Mi código es: [CÓDIGO]. Analiza la causa raíz, sugiere el fix exacto y cómo prevenirlo...",tags:["Debug","Fix"],compat:["ChatGPT","Claude","Gemini"],diff:"Básico",pop:97},
  {id:"24",category:"coding",title:"API REST Completa",description:"Diseña y documenta una API REST con las mejores prácticas.",preview:"Diseña API REST para [FUNCIONALIDAD]. Incluye endpoints, schemas, auth JWT y manejo de errores...",tags:["API","Backend"],compat:["ChatGPT","Claude"],diff:"Avanzado",pop:81},
  {id:"25",category:"coding",title:"Arquitectura de Base de Datos",description:"Esquemas optimizados para escalar a millones de usuarios.",preview:"Diseña el schema de base de datos para [APP]. Considera relaciones, índices críticos y estrategia de caching...",tags:["Database","SQL"],compat:["ChatGPT","Claude"],diff:"Avanzado",pop:75},
  {id:"26",category:"writing",title:"Canción Pop en Español",description:"Compón canciones completas con metáforas poéticas originales.",preview:"Compón canción pop en español sobre [TEMA]. Incluye verso 1, pre-coro, coro pegajoso, verso 2 y puente emocional...",tags:["Canción","Música"],compat:["ChatGPT","Claude","Gemini"],diff:"Intermedio",pop:90},
  {id:"27",category:"writing",title:"Primer Capítulo de Novela",description:"Genera el primer capítulo con personajes complejos.",preview:"Escribe el primer capítulo de novela de [GÉNERO]. Empieza en el momento de máxima tensión. Voz narrativa única...",tags:["Novela","Ficción"],compat:["ChatGPT","Claude"],diff:"Intermedio",pop:85},
  {id:"28",category:"writing",title:"Página de Ventas Copywriting",description:"Páginas de ventas que convierten usando técnicas probadas.",preview:"Escribe página de ventas para [PRODUCTO] usando AIDA evolucionada. Headline que paraliza, historia del founder, garantía...",tags:["Copywriting","Landing"],compat:["ChatGPT","Claude"],diff:"Avanzado",pop:88},
  {id:"29",category:"psychology",title:"Test de Personalidad Profundo",description:"Descubre patrones inconscientes con preguntas proyectivas.",preview:"Actúa como psicólogo clínico. Hazme test de 10 preguntas para revelar estilo de apego, mecanismos de defensa y valores centrales...",tags:["Personalidad","Test"],compat:["ChatGPT","Claude"],diff:"Básico",pop:95},
  {id:"30",category:"psychology",title:"Coaching de Liderazgo",description:"Desarrolla tu estilo de liderazgo único con feedback directo.",preview:"Actúa como coach ejecutivo. Mi desafío es [SITUACIÓN]. Identifica mi estilo de liderazgo y dame 3 estrategias para 30 días...",tags:["Liderazgo","Coaching"],compat:["ChatGPT","Claude"],diff:"Avanzado",pop:80},
];

const CATS = [{id:"all",label:"Todos",icon:"✦"},{id:"gaming",label:"Juegos IA",icon:"⚔"},{id:"images",label:"Imágenes IA",icon:"◉"},{id:"productivity",label:"Productividad",icon:"⬡"},{id:"marketing",label:"Marketing",icon:"▲"},{id:"coding",label:"Programación",icon:"{}"},{id:"writing",label:"Escritura",icon:"✦"},{id:"psychology",label:"Psicología",icon:"◎"}];
const AI_COLORS:Record<string,string> = {ChatGPT:"#10b981",Claude:"#f59e0b",Gemini:"#3b82f6",Llama:"#8b5cf6"};
const DIFF_COLORS:Record<string,string> = {"Básico":"#4ade80","Intermedio":"#facc15","Avanzado":"#f87171"};

function CopyBtn({text}:{text:string}) {
  const [copied,setCopied] = useState(false);
  return <button onClick={()=>{navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:600,border:`1px solid ${copied?"rgba(34,197,94,0.4)":"rgba(99,102,241,0.3)"}`,background:copied?"rgba(34,197,94,0.1)":"rgba(99,102,241,0.1)",color:copied?"#4ade80":"#818cf8",cursor:"pointer"}}>{copied?"✓ Copiado":"Copiar prompt"}</button>;
}

export default function Home() {
  const [query,setQuery] = useState("");
  const [cat,setCat] = useState("all");
  const filtered = useMemo(()=>prompts.filter(p=>{
    const q=query.toLowerCase();
    return (cat==="all"||p.category===cat)&&(!q||p.title.toLowerCase().includes(q)||p.description.toLowerCase().includes(q)||p.tags.some(t=>t.toLowerCase().includes(q)));
  }),[query,cat]);

  return (
    <div style={{minHeight:"100vh",background:"#080808",color:"#e8e8e8",fontFamily:"system-ui,sans-serif"}}>
      <header style={{position:"sticky",top:0,zIndex:100,borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(8,8,8,0.9)",backdropFilter:"blur(20px)",padding:"0 32px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff",fontSize:14}}>P</div>
          <span style={{fontWeight:800,fontSize:15,letterSpacing:"-0.02em"}}>PROMT<span style={{color:"#6366f1"}}>LAB</span></span>
        </div>
        <button style={{padding:"7px 16px",borderRadius:8,background:"#6366f1",color:"#fff",border:"none",cursor:"pointer",fontWeight:600,fontSize:13}}>Registro gratis</button>
      </header>

      <section style={{padding:"90px 32px 60px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <h1 style={{fontSize:"clamp(36px,5vw,68px)",fontWeight:900,letterSpacing:"-0.04em",lineHeight:1.05,marginBottom:16}}>
          La biblioteca definitiva<br/>de <span style={{background:"linear-gradient(135deg,#6366f1,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>prompts IA.</span>
        </h1>
        <p style={{color:"#555",fontSize:17,marginBottom:36,maxWidth:500,margin:"0 auto 36px",lineHeight:1.7}}>Explora prompts para ChatGPT, juegos IA, productividad, imágenes y más. Copia y usa al instante.</p>
        <div style={{position:"relative",maxWidth:540,margin:"0 auto"}}>
          <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"#444",fontSize:18}}>⌕</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar prompts, categorías, tags..." style={{width:"100%",padding:"15px 15px 15px 44px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#e8e8e8",fontSize:15,fontFamily:"inherit",outline:"none"}} onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.5)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
        </div>
      </section>

      <section style={{padding:"32px 32px 16px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {CATS.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"7px 16px",borderRadius:20,fontSize:13,fontWeight:500,border:`1px solid ${cat===c.id?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.07)"}`,background:cat===c.id?"rgba(99,102,241,0.12)":"rgba(255,255,255,0.02)",color:cat===c.id?"#a5b4fc":"#555",cursor:"pointer"}}>{c.icon} {c.label}</button>)}
          <span style={{marginLeft:"auto",fontSize:12,color:"#444",alignSelf:"center"}}>{filtered.length} prompts</span>
        </div>
      </section>

      <section style={{padding:"16px 32px 80px",maxWidth:1200,margin:"0 auto"}}>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <p style={{color:"#444",fontSize:16}}>No se encontraron prompts para "{query}"</p>
            <button onClick={()=>{setQuery("");setCat("all");}} style={{marginTop:16,padding:"8px 20px",borderRadius:8,border:"1px solid rgba(99,102,241,0.3)",background:"rgba(99,102,241,0.1)",color:"#818cf8",cursor:"pointer",fontSize:13}}>Limpiar filtros</button>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
            {filtered.map(p=>(
              <div key={p.id} style={{borderRadius:14,padding:22,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)",display:"flex",flexDirection:"column",gap:12,transition:"all 0.2s"}} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)";(e.currentTarget as HTMLDivElement).style.borderColor="rgba(99,102,241,0.25)";}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(0)";(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.06)";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#555",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{CATS.find(c=>c.id===p.category)?.label}</span>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:10,color:DIFF_COLORS[p.diff],border:`1px solid ${DIFF_COLORS[p.diff]}44`,padding:"2px 7px",borderRadius:4,fontWeight:600}}>{p.diff}</span>
                    <span style={{fontSize:10,color:"#444"}}>★ {p.pop}</span>
                  </div>
                </div>
                <h3 style={{fontSize:15,fontWeight:700,color:"#f0f0f0",margin:0}}>{p.title}</h3>
                <p style={{fontSize:13,color:"#555",lineHeight:1.6,margin:0}}>{p.description}</p>
                <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"10px 12px",border:"1px solid rgba(255,255,255,0.04)"}}>
                  <p style={{fontSize:11,color:"#444",lineHeight:1.6,fontFamily:"monospace",margin:0,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical" as const,overflow:"hidden"}}>{p.preview}</p>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {p.tags.map(t=><span key={t} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#555"}}>#{t}</span>)}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto"}}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {p.compat.map(ai=><span key={ai} style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${AI_COLORS[ai]}18`,color:AI_COLORS[ai],border:`1px solid ${AI_COLORS[ai]}33`,fontWeight:600}}>{ai}</span>)}
                  </div>
                  <CopyBtn text={p.preview}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"32px",textAlign:"center"}}>
        <p style={{fontSize:12,color:"#333"}}>© 2025 PROMTLAB — Biblioteca de prompts IA</p>
      </footer>
    </div>
  );
}