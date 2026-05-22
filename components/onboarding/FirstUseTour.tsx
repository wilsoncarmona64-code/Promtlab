"use client";
import { useState } from "react";

interface Props { onComplete: () => void; }

const STEPS = [
  { title:"🎯 Elige tu objetivo", desc:"Selecciona qué quieres crear: contenido, código, estrategia...", tip:"Explora las categorías o usa la búsqueda arriba" },
  { title:"⚡ Personaliza en segundos", desc:"El Prompt Builder convierte tus respuestas en un prompt profesional.", tip:"Haz clic en '✦ Personalizar prompt →' en cualquier card" },
  { title:"🚀 Copia y usa en tu IA", desc:"Un clic para copiar o abrir directamente en ChatGPT, Claude o Gemini.", tip:"¡Tu resultado profesional en menos de 2 minutos!" },
];

export default function FirstUseTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  return (
    <div style={{ position:"fixed",inset:0,zIndex:3000,background:"rgba(5,5,7,0.97)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ maxWidth:480,width:"100%",textAlign:"center",background:"#0d0d14",borderRadius:24,padding:36,border:"1px solid rgba(99,102,241,0.3)" }}>
        
        <div style={{ display:"flex",gap:8,justifyContent:"center",marginBottom:28 }}>
          {STEPS.map((_,i) => (
            <span key={i} style={{ width:i===step?24:8,height:8,borderRadius:4,background:i===step?"#6366f1":i<step?"rgba(99,102,241,0.4)":"rgba(255,255,255,0.1)",transition:"all 0.3s" }} />
          ))}
        </div>

        <h3 style={{ fontSize:22,fontWeight:800,color:"#f0f0f4",marginBottom:12 }}>{STEPS[step].title}</h3>
        <p style={{ color:"#666",fontSize:14,lineHeight:1.7,marginBottom:20 }}>{STEPS[step].desc}</p>
        <div style={{ background:"rgba(99,102,241,0.08)",borderRadius:12,padding:"12px 16px",marginBottom:28,border:"1px solid rgba(99,102,241,0.2)" }}>
          <p style={{ color:"#a5b4fc",fontSize:13,margin:0 }}>💡 {STEPS[step].tip}</p>
        </div>

        <button onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : onComplete()}
          style={{ padding:"12px 32px",borderRadius:12,background:"linear-gradient(135deg,#6366f1,#7c3aed)",color:"white",border:"none",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",marginBottom:12 }}>
          {step === STEPS.length - 1 ? "¡Empezar ahora! 🚀" : "Siguiente →"}
        </button>
        <button onClick={onComplete} style={{ background:"none",border:"none",color:"#444",fontSize:12,cursor:"pointer" }}>
          Omitir tour
        </button>
      </div>
    </div>
  );
}