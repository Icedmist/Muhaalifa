"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export type BrandVariant = "default" | "dark" | "icon";

export function Brandmark({ logo, variant="default", size=34 }: { logo?: string|null; variant?: BrandVariant; size?: number }){
  // If shop uploaded a logo, prefer it; otherwise use the built-in glyph.
  // Variants: default (light bg), dark (for footers/sidebars), icon (glyph only)
  if(logo){
    return (
      <div className="flex items-center gap-[10px] font-['Sora',sans-serif] font-bold text-[19px]">
        <img src={logo} alt="MuhaAlifa logo" className="rounded-[9px] object-cover flex-none" style={{width:size,height:size}}/>
        {variant!=="icon" && <span className={variant==="dark" ? "text-white" : "text-[#0B1220]"}>MuhaAlifa</span>}
      </div>
    )
  }
  if(variant==="icon"){
    return <img src="/logo-icon.svg" alt="MuhaAlifa" style={{width:size,height:size}} className="flex-none rounded-[9px]"/>;
  }
  return (
    <div className="flex items-center gap-[10px] font-['Sora',sans-serif] font-bold text-[19px]">
      <svg width={size} height={size} viewBox="0 0 34 34" fill="none" className="flex-none"><rect width="34" height="34" rx="9" fill="url(#g)"/><path d="M12 10h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z" stroke="#fff" strokeWidth="1.6"/><path d="M15 24h4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/><path d="M16 13.5l-2.4 3.2 2.4 3.1M18 13.5l2.4 3.2-2.4 3.1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="g" x1="0" y1="0" x2="34" y2="34"><stop stopColor="#1D53B7"/><stop offset="1" stopColor="#0FB5C8"/></linearGradient></defs></svg>
      <span className={variant==="dark" ? "text-white" : "text-[#0B1220]"}>MuhaAlifa</span>
    </div>
  )
}

// Static file logos for docs / OG: /logo.svg (light), /logo-dark.svg (dark), /logo-icon.svg (glyph), /favicon.svg

export function PublicHeader(){
  const [session, setSession] = useState<any>(null);
  const [logo, setLogo] = useState<string|null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(()=>{
    try{
      const s=localStorage.getItem("muha_session");
      if(s) setSession(JSON.parse(s));
      fetch("/api/settings").then(r=>r.json()).then(d=> setLogo(d.settings?.logo||null)).catch(()=>{});
    }catch{}
  },[]);
  return (
    <header className="sticky top-0 z-[100] bg-[rgba(245,247,251,.9)] backdrop-blur-[10px] border-b border-[#E3E8F1]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-5 h-[60px] sm:h-[68px] flex items-center justify-between">
        <Link href="/"><Brandmark logo={logo}/></Link>
        <nav className="hidden md:flex gap-[22px] text-[14px] font-semibold text-[#66708A]">
          <Link href="/" className="hover:text-[#0B1220]">Home</Link>
          <Link href="/track" className="hover:text-[#0B1220]">Track a repair</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-[10px]">
          <div className="hidden sm:flex items-center gap-[10px]">
            {session ? <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-[7px] font-semibold text-[12.5px] bg-[#171D8D] text-white">Go to dashboard</Link>
            : <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-[7px] font-semibold text-[12.5px] bg-[#171D8D] text-white">Staff login</Link>}
          </div>
          {/* mobile hamburger */}
          <button onClick={()=> setMenuOpen(v=>!v)} aria-label="Toggle menu" aria-expanded={menuOpen} className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#E3E8F1] bg-white text-[#0B1220]">
            <span className="sr-only">Menu</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={menuOpen ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
      {/* mobile sheet */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E3E8F1] bg-white/95 backdrop-blur-[10px]">
          <nav className="px-4 py-3 flex flex-col gap-1 text-[14px] font-semibold text-[#0B1220]">
            <Link href="/" onClick={()=> setMenuOpen(false)} className="px-3 py-2.5 rounded-[10px] hover:bg-[#F5F7FB]">Home</Link>
            <Link href="/track" onClick={()=> setMenuOpen(false)} className="px-3 py-2.5 rounded-[10px] hover:bg-[#F5F7FB]">Track a repair</Link>
            <div className="pt-2 mt-1 border-t border-[#E3E8F1]">
              {session ? <Link href="/dashboard" onClick={()=> setMenuOpen(false)} className="block text-center rounded-[10px] px-5 py-3 font-semibold text-[13px] bg-[#171D8D] text-white">Go to dashboard</Link>
              : <Link href="/login" onClick={()=> setMenuOpen(false)} className="block text-center rounded-[10px] px-5 py-3 font-semibold text-[13px] bg-[#171D8D] text-white">Staff login</Link>}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export function Footer(){
  const [s, setS] = useState({shopName:"MuhaAlifa Repairs", address:"No. 14 Ali Akilu Road, Jalingo, Taraba State", phone:"0803 123 4567"});
  useEffect(()=>{ fetch("/api/settings").then(r=>r.json()).then(d=> d.settings && setS(d.settings)).catch(()=>{}); },[]);
  return (
    <footer className="bg-[#0B1220] text-[#8790AF] py-8 sm:py-9 px-4 sm:px-5 mt-auto">
      <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-center gap-3 sm:gap-4 text-[12px] sm:text-[12.5px] text-center sm:text-left">
        <div className="text-white order-1"><Brandmark variant="dark"/></div>
        <div className="order-2 sm:order-2 text-[#A9B0CC]">{s.address} · {s.phone}</div>
        <div className="order-3 text-[11px] sm:text-[12.5px]">© {new Date().getFullYear()} {s.shopName}. Built on NEXA. <span className="opacity-60 hidden sm:inline">•</span> <a href="/logo.svg" target="_blank" className="underline decoration-[#66708A] hover:text-white">Logo pack</a></div>
      </div>
    </footer>
  )
}
