"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export type BrandVariant = "default" | "dark" | "icon";

export function Brandmark({ logo, variant="default", size=34, title="Muha Alifa" }: { logo?: string|null; variant?: BrandVariant; size?: number; title?: string }){
  // If shop uploaded a logo, prefer it; otherwise use the built-in glyph.
  // Variants: default (light bg), dark (for footers/sidebars), icon (glyph only)
  if(logo){
    return (
      <div className="flex items-center gap-[10px] font-['Sora',sans-serif] font-bold text-[19px]">
        <img src={logo} alt={`${title} logo`} className="rounded-[9px] object-cover flex-none" style={{width:size,height:size}}/>
        {variant!=="icon" && <span className={variant==="dark" ? "text-white" : "text-[#0B1220]"}>{title}</span>}
      </div>
    )
  }
  if(variant==="icon"){
    return <img src="/logo.jpg" alt={title} style={{width:size,height:size}} className="flex-none rounded-[9px] object-cover"/>;
  }
  return (
    <div className="flex items-center gap-[10px] font-['Sora',sans-serif] font-bold text-[19px]">
      <img src="/logo.jpg" alt={title} className="flex-none rounded-[9px] object-cover" style={{width:size,height:size}}/>
      <span className={variant==="dark" ? "text-white" : "text-[#0B1220]"}>{title}</span>
    </div>
  )
}

// Logo: /logo.jpg (also used as favicon via /favicon.ico) — single source in public/

export function PublicHeader(){
  const [session, setSession] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(()=>{
    try{
      const s=localStorage.getItem("muha_session");
      if(s) setSession(JSON.parse(s));
      fetch("/api/settings").then(r=>r.json()).then(d=> setSettings(d.settings)).catch(()=>{});
    }catch{}
  },[]);
  const logo = settings?.logo || null;
  const brandTitle = settings?.shopName?.split("—")[0]?.trim() || "Muha Alifa";
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
  const [s, setS] = useState<any>(null);
  useEffect(()=>{ fetch("/api/settings").then(r=>r.json()).then(d=> d.settings && setS(d.settings)).catch(()=>{}); },[]);
  const shop = s || {shopName:"Muha Alifa Communication Center", address:"No. 14 Ali Akilu Road, Jalingo, Taraba State", phone:"+2348060521188", email:"Musasalehakwaki@gmail.com"};
  return (
    <footer className="bg-[#0B1220] text-[#8790AF] py-8 sm:py-9 px-4 sm:px-5 mt-auto">
      <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-center gap-3 sm:gap-4 text-[12px] sm:text-[12.5px] text-center sm:text-left">
        <div className="text-white order-1"><Brandmark variant="dark" title={shop.shopName.split("—")[0]?.trim() || "Muha Alifa"}/></div>
        <div className="order-2 sm:order-2 text-[#A9B0CC] flex flex-col sm:flex-row gap-1 sm:gap-2 items-center"><span>{shop.address}</span><span className="hidden sm:inline">·</span><a href={`tel:${shop.phone}`} className="hover:text-white">{shop.phone}</a> <span className="hidden sm:inline">·</span><a href={`mailto:${shop.email}`} className="hover:text-white">{shop.email}</a></div>
        <div className="order-3 text-[11px] sm:text-[12.5px]">© {new Date().getFullYear()} {shop.shopName}. Built on NEXA. <span className="opacity-60 hidden sm:inline">•</span> <a href="/logo.jpg" target="_blank" className="underline decoration-[#66708A] hover:text-white">Logo</a></div>
      </div>
    </footer>
  )
}
