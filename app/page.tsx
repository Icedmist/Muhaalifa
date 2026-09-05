"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicHeader, Footer } from "@/components/Header";

export default function Landing(){
  const [trackId, setTrackId] = useState("");
  const router = useRouter();
  const [settings, setSettings] = useState({accent:"#0FB5C8"});
  useEffect(()=>{ fetch("/api/settings").then(r=>r.json()).then(d=> setSettings(d.settings)).catch(()=>{}); },[]);
  const doTrack = ()=>{
    if(!trackId.trim()) return;
    router.push(`/track?q=${encodeURIComponent(trackId.trim())}`);
  }
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      <style>{`:root{--teal:${settings.accent}}`}</style>
      <PublicHeader/>
      <section className="hero bg-gradient-to-br from-[#171D8D] to-[#10136B] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize:"26px 26px", maskImage:"radial-gradient(700px 500px at 25% 0%, black, transparent)"}} />
        <div className="relative z-[2] max-w-[1120px] mx-auto px-4 sm:px-5 py-8 sm:py-12 lg:py-[60px] lg:pb-[84px] grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-8 sm:gap-10 lg:gap-[52px] items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 bg-[rgba(15,181,200,.16)] border border-[rgba(15,181,200,.4)] text-[#7FE3EE] px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold tracking-[.04em] uppercase mb-4 sm:mb-5">Live Repair Tracking</div>
            <h1 className="text-[28px] xs:text-[30px] sm:text-[36px] lg:text-[46px] leading-[1.12] font-bold mb-3 sm:mb-4 font-['Sora']">Every repair, tracked from <em className="not-italic text-[#7FE3EE]">drop-off to pickup.</em></h1>
            <p className="text-[15px] sm:text-[16.5px] text-[#C6CBE9] max-w-[460px] mb-5 sm:mb-7 leading-relaxed">Log a repair in under a minute. Customers check status anytime with a ticket ID or QR code — no phone calls required.</p>
            <div className="bg-[rgba(255,255,255,.08)] border border-[rgba(255,255,255,.18)] rounded-[10px] flex flex-col xs:flex-row p-1.5 gap-1.5 max-w-[440px] mb-3 sm:mb-3.5">
              <input value={trackId} onChange={e=> setTrackId(e.target.value)} onKeyDown={e=> e.key==='Enter'&&doTrack()} placeholder="Ticket ID or phone number" className="flex-1 min-w-0 bg-transparent border-none text-white px-3 py-2.5 sm:py-2.5 text-[13.5px] font-mono tracking-[.02em] placeholder:text-[#9AA1CF] outline-none" />
              <button onClick={doTrack} className="bg-[#0FB5C8] text-[#04262B] rounded-lg px-5 py-3 sm:py-2.5 text-sm font-semibold hover:brightness-[.94] w-full xs:w-auto">Track</button>
            </div>
            <div className="text-[11.5px] sm:text-[12.5px] text-[#9AA1CF]">Scan the QR code printed on your receipt, or enter your ticket ID above.</div>
            <div className="flex flex-wrap gap-6 sm:gap-[30px] mt-6 sm:mt-9">
              <div><b className="block font-['Sora'] text-[20px] sm:text-[22px]">60s</b><span className="text-[11px] sm:text-[12px] text-[#9AA1CF]">average intake time</span></div>
              <div><b className="block font-['Sora'] text-[20px] sm:text-[22px]">6</b><span className="text-[11px] sm:text-[12px] text-[#9AA1CF]">status stages tracked</span></div>
              <div><b className="block font-['Sora'] text-[20px] sm:text-[22px]">0</b><span className="text-[11px] sm:text-[12px] text-[#9AA1CF]">calls needed to check status</span></div>
            </div>
          </div>
          <div className="relative flex justify-center lg:order-none order-first -mx-2 sm:mx-0">
            <div className="w-[280px] xs:w-[310px] bg-white text-[#0B1220] rounded-t-xl shadow-[0_24px_60px_-20px_rgba(23,29,141,.35)] rotate-[1deg] p-[18px] sm:p-[22px] pb-[22px] sm:pb-[26px] relative animate-[ticket-in_.5s_ease_both] scale-[0.9] xs:scale-100">
              <div className="absolute top-[18px] right-[-1px] bg-[#0FB5C8] text-[#04262B] text-[10.5px] font-bold px-2.5 py-1 rounded-l-md tracking-[.02em]">QR tracked</div>
              <div className="flex justify-between items-start border-b-[1.5px] border-dashed border-[#E3E8F1] pb-3.5 mb-3.5">
                <div><div className="text-[10px] uppercase tracking-[.08em] text-[#66708A] font-bold">Ticket ID</div><div className="font-mono font-bold text-[19px] text-[#171D8D]">MA-7F3K2</div></div>
                <div className="text-[10.5px] font-bold px-2.5 py-1 rounded-md uppercase tracking-[.03em] bg-[#1D53B722] text-[#1D53B7]">In Repair</div>
              </div>
              <div className="flex justify-between text-[12.5px] mb-2"><span className="text-[#66708A]">Device</span><span className="font-semibold text-right">iPhone 13 Pro · Graphite</span></div>
              <div className="flex justify-between text-[12.5px] mb-2"><span className="text-[#66708A]">Customer</span><span className="font-semibold text-right">Amina Yusuf</span></div>
              <div className="flex justify-between text-[12.5px] mb-2"><span className="text-[#66708A]">Issue</span><span className="font-semibold text-right">Cracked screen</span></div>
              <div className="flex justify-between text-[12.5px] mb-2"><span className="text-[#66708A]">Collect by</span><span className="font-semibold text-right">Tomorrow</span></div>
              <div className="w-[60px] h-[60px] rounded-md mt-3 opacity-80" style={{background:"repeating-linear-gradient(45deg,#0B1220 0 3px,#fff 3px 6px)"}} />
              <div className="absolute left-0 right-0 bottom-[-11px] h-[22px]" style={{backgroundImage:"radial-gradient(circle at 10px 0, transparent 10px, #fff 10.5px)", backgroundSize:"20px 22px", backgroundRepeat:"repeat-x"}} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-[72px] px-4 sm:px-5">
        <div className="max-w-[1120px] mx-auto">
          <div className="max-w-[620px] mb-8 sm:mb-10">
            <div className="text-[11px] sm:text-[12px] font-bold tracking-[.07em] uppercase text-[#0FB5C8] mb-2 sm:mb-2.5">How it works</div>
            <h2 className="text-[22px] sm:text-[26px] lg:text-[32px] font-bold mb-2 sm:mb-3 font-['Sora'] leading-tight">Three steps, one running record</h2>
            <p className="text-[#66708A] text-[14px] sm:text-[15px]">The same ticket follows the phone from drop-off to pickup — for staff and the customer.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-[22px]">
            {[
              ["01 — Log","Staff logs the device","Brand, model, issue and price captured in under a minute. Ticket and QR code generated instantly."],
              ["02 — Track","Status updates as work happens","Diagnosis, repair, awaiting parts — every change is visible the moment a technician updates it."],
              ["03 — Collect","Customer picks up, informed","They check the QR code any time — no login, no interruption to the bench."],
            ].map(([kicker,title,desc])=>(
              <div key={kicker} className="bg-white border border-[#E3E8F1] rounded-2xl p-5 sm:p-6">
                <div className="font-mono text-[12.5px] text-[#0FB5C8] font-bold mb-2 sm:mb-3">{kicker}</div>
                <h3 className="text-[15px] sm:text-[16.5px] font-bold mb-1.5 sm:mb-2">{title}</h3>
                <p className="text-[#66708A] text-[13px] sm:text-[13.5px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-5 pb-8 sm:pb-[52px]">
        <div className="max-w-[1120px] mx-auto">
          <div className="bg-[#0B1220] rounded-[20px] p-6 sm:p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-10 text-white">
            <div className="max-w-[380px] text-center md:text-left">
              <h3 className="text-[18px] sm:text-[21px] font-bold mb-2 sm:mb-2.5">Built for the bench, not a boardroom</h3>
              <p className="text-[#A9B0CC] text-[13px] sm:text-[14px] leading-relaxed">No login walls for customers, no clutter for staff. A ticket, a status, and a QR code that does the explaining.</p>
            </div>
            <svg width="120" height="175" viewBox="0 0 150 220" fill="none" className="flex-none w-[120px] h-[175px] sm:w-[140px] sm:h-[205px]">
              <rect x="10" y="6" width="130" height="208" rx="26" stroke="#0FB5C8" strokeWidth="3"/>
              <rect x="24" y="26" width="102" height="168" rx="6" stroke="#3A4468" strokeWidth="2"/>
              <circle cx="75" cy="16" r="2.5" fill="#3A4468"/>
              <path d="M50 70 L70 100 L58 100 L86 150" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="40" cy="180" r="4" stroke="#8790AF" strokeWidth="1.6"/>
              <circle cx="110" cy="180" r="4" stroke="#8790AF" strokeWidth="1.6"/>
              <circle cx="40" cy="40" r="4" stroke="#8790AF" strokeWidth="1.6"/>
              <circle cx="110" cy="40" r="4" stroke="#8790AF" strokeWidth="1.6"/>
            </svg>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-5 pb-8 sm:pb-[52px]">
        <div className="max-w-[1120px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 text-center">
          {[
            ["5","status stages, always visible"],
            ["3","roles: Admin, Technician, Front Desk"],
            ["PDF/JPG","printable ticket, every time"],
            ["0","apps for the customer to install"],
          ].map(([b,s])=>(
            <div key={b} className="bg-white sm:bg-transparent border border-[#E3E8F1] sm:border-0 rounded-2xl sm:rounded-none p-4 sm:p-0"><b className="block font-['Sora'] text-[22px] sm:text-[26px] text-[#171D8D]">{b}</b><span className="text-[11px] sm:text-[12px] text-[#66708A]">{s}</span></div>
          ))}
        </div>
      </section>
      <Footer/>
      <style>{`@keyframes ticket-in{from{opacity:0;transform:rotate(1deg) translateY(10px)}to{opacity:1;transform:rotate(1deg) translateY(0)}}`}</style>
    </div>
  )
}
