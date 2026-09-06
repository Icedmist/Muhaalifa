"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicHeader, Footer } from "@/components/Header";
import { STATUS_FLOW, STATUS_META, Ticket, fmtDate, fmtDateTime, fmtNaira } from "@/lib/constants";
import { PrintableTicket } from "@/components/PrintableTicket";
import { Suspense } from "react";

function TrackInner(){
  const sp = useSearchParams();
  const router = useRouter();
  const initialQ = sp.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [ticket, setTicket] = useState<Ticket|null>(null);
  const [matches, setMatches] = useState<Ticket[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(()=>{ fetch("/api/settings").then(r=>r.json()).then(d=> setShop(d.settings || {shopName:"Muha Alifa Communication Center", phone:"+2348060521188", email:"Musasalehakwaki@gmail.com", address:"No. 14 Ali Akilu Road, Jalingo, Taraba State", footer:"Repair estimates are valid for 7 days."})).catch(()=>{}); },[]);
  useEffect(()=>{ if(initialQ) doTrack(initialQ); },[initialQ]);

  const doTrack = async (val?: string)=>{
    const query = (val ?? q).trim();
    if(!query){ setTicket(null); setMatches([]); setSearched(true); return; }
    setLoading(true);
    const res = await fetch(`/api/track?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setTicket(data.ticket||null);
    setMatches(data.matches||[]);
    setSearched(true);
    setLoading(false);
    router.replace(`/track?q=${encodeURIComponent(query)}`);
  }

  const pipeline = (status: string)=>{
    if(status==="cancelled") return (<div className="bg-white border border-[#E3E8F1] rounded-2xl p-6 text-center mt-4"><span className="bg-[#DC262622] text-[#DC2626] text-[11px] font-bold px-3 py-1.5 rounded-md uppercase">Cancelled</span><p className="mt-2.5 text-[#66708A] text-[13px]">This repair was cancelled. Contact the shop for details.</p></div>);
    const idx = STATUS_FLOW.indexOf(status as any);
    return (<div className="flex flex-col gap-0 my-6">
      {STATUS_FLOW.map((s,i)=>{
        const m = (STATUS_META as any)[s];
        const cls = i < idx ? "done" : i===idx ? "current":"";
        const dotBg = cls==="done" ? "#16A34A" : cls==="current" ? "#0FB5C8" : "#E3E8F1";
        return (<div key={s} className="flex gap-3.5 relative pb-5 last:pb-0">
          {i < STATUS_FLOW.length-1 && <div className="absolute left-[11.5px] top-6 bottom-[-4px] w-0.5" style={{background: i<idx ? "#16A34A": "#E3E8F1"}}/>}
          <div className="w-6 h-6 rounded-full flex-none flex items-center justify-center text-[11.5px] font-bold text-white z-[2]" style={{background:dotBg, boxShadow: cls==="current" ? "0 0 0 5px rgba(15,181,200,.2)":undefined}}>{i<idx ? "✓": i+1}</div>
          <div><b className="block text-[13.5px]">{m.label}</b>{i===idx && <span className="text-[11.5px] text-[#66708A]">Current stage</span>}</div>
        </div>)
      })}
    </div>)
  }

  const download = async (id:string, format:"pdf"|"jpg")=>{
    const el = document.getElementById(`printable-${id}`);
    if(!el) return;
    const { toJpeg } = await import("html-to-image");
    const dataUrl = await toJpeg(el, {quality:.95, backgroundColor:"#ffffff", pixelRatio:2});
    if(format==="jpg"){
      const a=document.createElement("a"); a.download=id+".jpg"; a.href=dataUrl; a.click();
    } else {
      const {jsPDF}= await import("jspdf");
      const img = new Image(); img.src=dataUrl; await new Promise(r=> img.onload=r);
      const w=320, h= (img.height/img.width)*320;
      const pdf=new jsPDF({unit:"pt", format:[w,h]}); pdf.addImage(dataUrl,"JPEG",0,0,w,h); pdf.save(id+".pdf");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      <PublicHeader/>
      <section className="flex-1 py-6 sm:py-[52px] px-4 sm:px-5 pb-10 sm:pb-[84px]">
        <div className="max-w-[520px] mx-auto">
          <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5 sm:p-[26px] shadow-[0_1px_2px_rgba(11,18,32,.04),0_12px_28px_-12px_rgba(23,29,141,.18)] text-center">
            <h2 className="text-[19px] sm:text-[21px] font-bold mb-1 sm:mb-1.5">Track your repair</h2>
            <p className="text-[#66708A] text-[13px] sm:text-[13.5px] mb-4">Enter your ticket ID or the phone number you gave at drop-off.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={q} onChange={e=> setQ(e.target.value)} onKeyDown={e=> e.key==='Enter'&&doTrack()} placeholder="Ticket ID or phone number" className="flex-1 border-[1.5px] border-[#E3E8F1] rounded-[10px] px-3.5 py-3 text-sm font-mono tracking-[.02em] focus:border-[#0FB5C8] outline-none"/>
              <button onClick={()=>doTrack()} className="bg-[#171D8D] text-white rounded-[10px] px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2"> {loading?"…":"Track"}</button>
            </div>
          </div>

          {searched && !ticket && matches.length===0 && q && (
            <div className="bg-white border border-[#E3E8F1] rounded-2xl p-4 sm:p-6 mt-4">
              <div className="text-center py-4 sm:py-5 text-[#66708A]">
                <b className="text-[#0B1220]">No repair found for &quot;{q}&quot;</b>
                <p className="mt-1.5 text-[13px]">Check the ID on your receipt, or contact us at {shop?.phone || "+2348060521188"}.</p>
              </div>
            </div>
          )}

          {matches.length>0 && (
            <div className="bg-white border border-[#E3E8F1] rounded-2xl p-4 sm:p-6 mt-4">
              <p className="text-[12.5px] text-[#66708A] mb-2.5">{matches.length} repairs found for this number — select one:</p>
              {matches.map(m=>(
                <div key={m.id} onClick={()=>{ setTicket(m); setMatches([]); }} className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1.5 py-3 px-2 border-b border-[#E3E8F1] cursor-pointer text-[13px] hover:bg-[#F5F7FB]">
                  <span className="font-mono font-bold text-[#171D8D]">{m.id}</span>
                  <span className="text-[12.5px]">{m.brand.replace(' (iPhone)','')} {m.model}</span>
                  <span className="self-start xs:self-auto text-[11px] font-bold px-3 py-1 rounded-full uppercase" style={{background: (STATUS_META as any)[m.status].color+"22", color: (STATUS_META as any)[m.status].color}}>{(STATUS_META as any)[m.status].label}</span>
                </div>
              ))}
            </div>
          )}

          {ticket && (
            <>
              <div className="bg-white border border-[#E3E8F1] rounded-2xl p-4 sm:p-6 mt-4 shadow-[0_1px_2px_rgba(11,18,32,.04),0_12px_28px_-12px_rgba(23,29,141,.18)]">
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-3 mb-4">
                  <div>
                    <div className="text-[11px] text-[#66708A] uppercase tracking-[.04em]">Ticket</div>
                    <div className="font-mono font-bold text-[19px] text-[#171D8D]">{ticket.id}</div>
                    {(ticket as any).branch && <div className="text-[11px] text-[#98A2B8]">{(ticket as any).branch}</div>}
                  </div>
                  <span className="self-start xs:self-auto text-[11px] font-bold px-3 py-1.5 rounded-full uppercase" style={{background: (STATUS_META as any)[ticket.status].color+"22", color: (STATUS_META as any)[ticket.status].color}}>{(STATUS_META as any)[ticket.status].label}</span>
                </div>
                {pipeline(ticket.status)}
                {/* customer-visible audit */}
                {(ticket as any).history && (ticket as any).history.length>0 && (
                  <div className="mt-5 border-t border-[#E3E8F1] pt-4">
                    <h4 className="text-[11px] font-bold text-[#66708A] uppercase tracking-[.03em] mb-2.5">Updates</h4>
                    <div className="space-y-2">
                      {(ticket as any).history.slice().reverse().slice(0,6).map((h:any,i:number)=>(
                        <div key={i} className="flex justify-between text-[12.5px] border-l-2 pl-3 py-1" style={{borderColor:(STATUS_META as any)[h.to]?.color || "#E3E8F1"}}>
                          <span><b>{(STATUS_META as any)[h.to]?.label}</b> <span className="text-[#98A2B8]">· {fmtDateTime(h.at)}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3.5 mt-4 border-t border-dashed border-[#E3E8F1] pt-4">
                  <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Device</span><b className="text-[13.5px] break-words">{ticket.brand.replace(" (iPhone)","")} {ticket.model}</b></div>
                  <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Colour</span><b className="text-[13.5px]">{ticket.color||"—"}</b></div>
                  <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Logged</span><b className="text-[13.5px]">{fmtDate(ticket.received)}</b></div>
                  <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Expected collection</span><b className="text-[13.5px]">{fmtDate(ticket.expected)}</b></div>
                  {(ticket as any).payments?.length>0 && (
                    <>
                      <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Paid</span><b className="text-[13.5px]">{fmtNaira(ticket.paid)}</b></div>
                      <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Balance</span><b className={`text-[13.5px] ${ticket.amount-ticket.paid>0?"text-[#D97706]":"text-[#16A34A]"}`}>{fmtNaira(ticket.amount-ticket.paid)}</b></div>
                    </>
                  )}
                </div>
                <button onClick={()=>download(ticket.id,"pdf")} className="mt-4 border border-[#E3E8F1] bg-white rounded-lg px-4 py-2.5 text-[12.5px] font-semibold w-full sm:w-auto">Download receipt (PDF)</button>
                <div className="mt-4 pt-3.5 border-t border-dashed border-[#E3E8F1] text-[12px] text-[#66708A]">Questions? Call {shop?.shopName || "Muha Alifa"} at <b className="text-[#0B1220]">{shop?.phone || "+2348060521188"}</b> {shop?.email && <span>· {shop.email}</span>}.</div>
              </div>
              <div className="mt-6 flex justify-center overflow-x-auto"><PrintableTicket ticket={ticket} shop={shop || {shopName:"Muha Alifa Communication Center", address:"No. 14 Ali Akilu Road, Jalingo, Taraba State", phone:"+2348060521188", email:"Musasalehakwaki@gmail.com", footer:"Repair estimates are valid for 7 days."}} /></div>
              <div className="flex gap-2 justify-center mt-3 flex-col sm:flex-row">
                <button onClick={()=>download(ticket.id,"pdf")} className="bg-[#171D8D] text-white rounded-lg px-4 py-3 sm:py-2 text-sm">Download PDF</button>
                <button onClick={()=>download(ticket.id,"jpg")} className="border border-[#E3E8F1] bg-white rounded-lg px-4 py-3 sm:py-2 text-sm">Download JPG</button>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer/>
    </div>
  )
}

export default function TrackPage(){
  return <Suspense fallback={<div className="p-10 text-center">Loading…</div>}><TrackInner/></Suspense>
}
