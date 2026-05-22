"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/useAuth";

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div style={{ minHeight:"100vh",background:"#050507",color:"#e2e2e8",padding:24,fontFamily:"Sora,sans-serif" }}>
      <div style={{ maxWidth:800,margin:"0 auto" }}>

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:26,fontWeight:900,marginBottom:4 }}>Hola, {user.name?.split(" ")[0] || "Usuario"} 👋</h1>
            <p style={{ color:"#555",fontSize:13 }}>{user.email}</p>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={() => router.push("/")}
              style={{ padding:"8px 16px",borderRadius:8,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",color:"#a5b4fc",fontSize:13,cursor:"pointer" }}>
              ← Explorar
            </button>
            <button onClick={() => { logout(); router.push("/"); }}
              style={{ padding:"8px 16px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#555",fontSize:13,cursor:"pointer" }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:32 }}>
          {[
            { label:"Plan actual", value:user.isPremium ? "⭐ Premium" : "✦ Gratis" },
            { label:"Miembro desde", value:new Date(user.createdAt).toLocaleDateString("es-ES") },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.03)",borderRadius:16,padding:20,border:"1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>{s.label}</p>
              <p style={{ fontSize:20,fontWeight:700 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {!user.isPremium && (
          <div style={{ borderRadius:16,padding:24,background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))",border:"1px solid rgba(99,102,241,0.2)",textAlign:"center" }}>
            <h3 style={{ fontSize:18,fontWeight:800,marginBottom:8 }}>Mejora a Premium ⭐</h3>
            <p style={{ color:"#555",fontSize:13,marginBottom:16 }}>Accede a todos los templates exclusivos sin límites</p>
            <button style={{ padding:"10px 24px",borderRadius:10,background:"linear-gradient(135deg,#6366f1,#7c3aed)",color:"white",border:"none",fontSize:13,fontWeight:700,cursor:"pointer" }}>
              Ver planes →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}