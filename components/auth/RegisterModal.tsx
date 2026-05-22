"use client";
import { useState } from "react";
import { useAuth } from "@/lib/state/useAuth";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RegisterModal({ onClose, onSuccess }: Props) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@")) { setError("Ingresa un email válido"); return; }
    setError(""); setSubmitting(true);
    try {
      await register(email, name || undefined);
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al registrar");
    } finally { setSubmitting(false); }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%",maxWidth:420,borderRadius:20,background:"#0d0d14",border:"1px solid rgba(99,102,241,0.25)",padding:28 }}>
        
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
          <div>
            <h3 style={{ fontSize:18,fontWeight:800,color:"#f0f0f4",marginBottom:4 }}>Crear cuenta gratis</h3>
            <p style={{ fontSize:12,color:"#555" }}>Sin tarjeta de crédito</p>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"#444",fontSize:20,cursor:"pointer" }}>✕</button>
        </div>

        {done ? (
          <div style={{ textAlign:"center",padding:"20px 0" }}>
            <div style={{ fontSize:40,marginBottom:12 }}>🎉</div>
            <p style={{ color:"#4ade80",fontWeight:700,fontSize:16 }}>¡Cuenta creada!</p>
            <p style={{ color:"#555",fontSize:13,marginTop:8 }}>Bienvenido a PROMTLAB</p>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div>
              <label style={{ display:"block",fontSize:12,color:"#888",marginBottom:6,fontWeight:600 }}>Nombre (opcional)</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
                style={{ width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#e2e2e8",fontSize:14,outline:"none",fontFamily:"Sora,sans-serif" }} />
            </div>
            <div>
              <label style={{ display:"block",fontSize:12,color:"#a5b4fc",marginBottom:6,fontWeight:700 }}>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                style={{ width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#e2e2e8",fontSize:14,outline:"none",fontFamily:"Sora,sans-serif" }} />
            </div>
            {error && <p style={{ color:"#f87171",fontSize:13,margin:0 }}>{error}</p>}
            <button onClick={handleSubmit} disabled={submitting}
              style={{ width:"100%",padding:13,borderRadius:12,background:"linear-gradient(135deg,#6366f1,#7c3aed)",color:"white",border:"none",fontSize:14,fontWeight:700,cursor:submitting?"not-allowed":"pointer",opacity:submitting?0.7:1 }}>
              {submitting ? "Creando cuenta..." : "Comenzar gratis →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}