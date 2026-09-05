"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Brandmark({ logo }: { logo?: string|null }){
  return (
    <div className="flex items-center gap-[10px] font-['Space_Grotesk',sans-serif] font-bold text-[19px]">
      {logo ? <img src={logo} alt="Shop logo" className="w-[34px] h-[34px] rounded-[9px] object-cover"/> :
      <svg className="w-[34px] h-[34px] flex-none" viewBox="0 0 34 34" fill="none"><rect width="34" height="34" rx="9" fill="url(#g)"/><path d="M12 10h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z" stroke="#fff" strokeWidth="1.6"/><path d="M15 24h4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/><path d="M16 13.5l-2.4 3.2 2.4 3.1M18 13.5l2.4 3.2-2.4 3.1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="g" x1="0" y1="0" x2="34" y2="34"><stop stopColor="#1D53B7"/><stop offset="1" stopColor="#0FB5C8"/></linearGradient></defs></svg>}
      <span>MuhaAlifa</span>
    </div>
  )
}

export function PublicHeader(){
  const [session, setSession] = useState<any>(null);
  const [logo, setLogo] = useState<string|null>(null);
  useEffect(()=>{
    try{
      const s=localStorage.getItem("muha_session");
      if(s) setSession(JSON.parse(s));
      fetch("/api/settings").then(r=>r.json()).then(d=> setLogo(d.settings?.logo||null)).catch(()=>{});
    }catch{}
  },[]);
  return (
    <header className="sticky top-0 z-[100] bg-[rgba(245,247,251,.9)] backdrop-blur-[10px] border-b border-[#E3E8F1]">
      <div className="max-w-[1120px] mx-auto px-5 h-[68px] flex items-center justify-between">
        <Link href="/"><Brandmark logo={logo}/></Link>
        <nav className="hidden md:flex gap-[22px] text-[14px] font-semibold text-[#66708A]">
          <Link href="/" className="hover:text-[#0B1220]">Home</Link>
          <Link href="/track" className="hover:text-[#0B1220]">Track a repair</Link>
        </nav>
        <div className="flex items-center gap-[10px]">
          {session ? <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-[7px] font-semibold text-[12.5px] bg-[#171D8D] text-white">Go to dashboard</Link>
          : <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-[7px] font-semibold text-[12.5px] bg-[#171D8D] text-white">Staff login</Link>}
        </div>
      </div>
    </header>
  )
}

export function Footer(){
  const [s, setS] = useState({shopName:"MuhaAlifa Repairs", address:"No. 14 Ali Akilu Road, Jalingo, Taraba State", phone:"0803 123 4567"});
  useEffect(()=>{ fetch("/api/settings").then(r=>r.json()).then(d=> d.settings && setS(d.settings)).catch(()=>{}); },[]);
  return (
    <footer className="bg-[#0B1220] text-[#8790AF] py-9 px-5 mt-auto">
      <div className="max-w-[1120px] mx-auto flex justify-between items-center flex-wrap gap-4 text-[12.5px]">
        <div className="text-white"><Brandmark/></div>
        <div>{s.address} · {s.phone}</div>
        <div>© {new Date().getFullYear()} {s.shopName}. Built on NEXA.</div>
      </div>
    </footer>
  )
}
