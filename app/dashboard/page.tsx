"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_FLOW, STATUS_META, Ticket, fmtDate, fmtDateTime, fmtNaira } from "@/lib/constants";
import { Brandmark } from "@/components/Header";
import { PrintableTicket } from "@/components/PrintableTicket";
import { NewTicketWizard } from "@/components/NewTicketWizard";
import { authFetch } from "@/lib/client";

function useSession(){
  const [s,setS]=useState<any>(null);
  const router=useRouter();
  useEffect(()=>{
    const raw=localStorage.getItem("muha_session");
    if(!raw){ router.replace("/login"); return; }
    setS(JSON.parse(raw));
  },[]);
  return s;
}

export default function Dashboard(){
  const session = useSession();
  const router=useRouter();
  const [tickets,setTickets]=useState<Ticket[]>([]);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [view,setView]=useState<"list"|"new"|"detail">("list");
  const [activeId,setActiveId]=useState<string|null>(null);
  const [shop,setShop]=useState<any>(null);
  const [showLogout,setShowLogout]=useState(false);

  const load = async ()=>{
    const p=new URLSearchParams();
    if(filter!=="all") p.set("status",filter);
    if(search) p.set("q",search);
    const res=await authFetch(`/api/tickets?${p.toString()}`);
    const data=await res.json();
    if(res.ok) setTickets(data.tickets||[]);
    else if(res.status===401) setTickets([]);
  }
  useEffect(()=>{ if(session) load(); },[session,filter,search]);
  useEffect(()=>{ fetch("/api/settings").then(r=>r.json()).then(d=> setShop(d.settings || {shopName:"Muha Alifa Communication Center", phone:"+2348060521188", email:"Musasalehakwaki@gmail.com", address:"No. 14 Ali Akilu Road, Jalingo, Taraba State", footer:"Repair estimates are valid for 7 days.", accent:"#0FB5C8", logo:null})).catch(()=>{}); },[]);

  const [payAmount, setPayAmount]=useState("");
  const [payMethod, setPayMethod]=useState("cash");

  if(!session) return <div className="p-10 text-center text-[#66708A]">Checking session…</div>;
  const activeTicket = tickets.find(t=>t.id===activeId) || null;

  const openTicket = async (id:string)=>{
    const res=await fetch(`/api/tickets/${id}`);
    const data=await res.json();
    if(data.ticket){
      setActiveId(data.ticket.id);
      // ensure ticket in list
      if(!tickets.find(t=>t.id===data.ticket.id)) setTickets(prev=>[data.ticket,...prev]);
      setView("detail");
    }
  }

  const updateStatus = async (id:string, status:string)=>{
    const r = await authFetch(`/api/tickets/${id}`,{method:"PATCH", body:JSON.stringify({status})});
    if(!r.ok){ const e=await r.json(); alert(e.error || "Failed to update"); return; }
    // refresh both list and detail
    load();
    const res=await fetch(`/api/tickets/${id}`); const d=await res.json(); if(d.ticket){
      setTickets(prev=> prev.map(x=> x.id===d.ticket.id ? d.ticket : x));
    }
  }
  const addPayment = async (id:string)=>{
    const amt = Number(payAmount);
    if(!amt || amt<=0) return alert("Enter valid amount");
    const r = await authFetch(`/api/tickets/${id}`,{method:"PATCH", body:JSON.stringify({addPayment: amt, paymentMethod: payMethod})});
    if(!r.ok){ const e=await r.json(); alert(e.error||"Payment failed"); return; }
    const d=await r.json();
    setTickets(prev=> prev.map(x=> x.id===id ? d.ticket : x));
    setPayAmount("");
    load();
  }
  const doLogout = async ()=>{
    await fetch("/api/auth/logout", {method:"POST", credentials:"include"});
    localStorage.removeItem("muha_session");
    router.replace("/");
  }

  const download = async (t:Ticket, format:"pdf"|"jpg")=>{
    const el = document.getElementById(`printable-${t.id}`);
    if(!el) return;
    const { toJpeg } = await import("html-to-image");
    const dataUrl = await toJpeg(el, {quality:.95, backgroundColor:"#ffffff", pixelRatio:2});
    if(format==="jpg"){
      const a=document.createElement("a"); a.download=t.id+".jpg"; a.href=dataUrl; a.click();
    } else {
      const {jsPDF}= await import("jspdf");
      const img=new Image(); img.src=dataUrl; await new Promise(r=> img.onload=r);
      const w=320, h=(img.height/img.width)*320;
      const pdf=new jsPDF({unit:"pt", format:[w,h]}); pdf.addImage(dataUrl,"JPEG",0,0,w,h); pdf.save(t.id+".pdf");
    }
  }

  const initials = session.name.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      <div className="flex flex-1">
        <aside className="hidden md:flex w-[220px] flex-none bg-[#0B1220] text-white p-4 flex-col gap-1">
          <div className="text-white mb-6 px-2"><Brandmark logo={shop?.logo} title={shop?.shopName?.split("—")[0]?.trim() || "Muha Alifa"}/></div>
          <button onClick={()=> setView("list")} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13.5px] font-semibold ${view==="list"?"bg-[#0FB5C8] text-[#04262B]":"text-[#A9B0CC] hover:bg-white/10 hover:text-white"}`}>⊞ Tickets</button>
          <button onClick={()=> setView("new")} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13.5px] font-semibold ${view==="new"?"bg-[#0FB5C8] text-[#04262B]":"text-[#A9B0CC] hover:bg-white/10 hover:text-white"}`}>+ New repair</button>
          {session.role==="Admin" && <button onClick={()=> router.push("/admin")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13.5px] font-semibold text-[#A9B0CC] hover:bg-white/10 hover:text-white">⚙ Admin console</button>}
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-[60px] flex-none border-b border-[#E3E8F1] bg-white flex items-center justify-between px-4 md:px-[30px]">
            <div className="font-bold text-[13.5px] text-[#66708A]">{shop?.shopName || "Muha Alifa Communication Center"}</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#171D8D] text-white flex items-center justify-center text-[12px] font-bold">{initials}</div>
              <div className="hidden sm:flex flex-col leading-none"><b className="text-[12.5px]">{session.name}</b><span className="text-[10.5px] text-[#66708A]">{session.role}</span></div>
              <button onClick={()=> setShowLogout(true)} className="border border-[#E3E8F1] rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">Sign out</button>
            </div>
          </div>

          <main className="flex-1 p-4 md:p-7 max-w-[1080px] w-full">
            {view==="list" && (
              <>
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                  <div><h2 className="text-[22px] font-bold">Repair tickets</h2><p className="text-[#66708A] text-[13px]">{tickets.length} total · {tickets.filter(t=>t.status!=='collected'&&t.status!=='cancelled').length} active on the bench</p></div>
                  <div className="flex gap-2.5">
                    <input value={search} onChange={e=> setSearch(e.target.value)} placeholder="Search name, ID, device…" className="border-[1.5px] border-[#E3E8F1] rounded-[10px] px-3.5 py-2 text-sm w-[200px] outline-none"/>
                    <button onClick={()=> setView("new")} className="bg-[#0FB5C8] text-[#04262B] rounded-[10px] px-5 py-2.5 text-sm font-semibold">+ New repair</button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-5">
                  {["all",...STATUS_FLOW].map(f=>(
                    <button key={f} onClick={()=> setFilter(f)} className={`border-[1.5px] rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold ${filter===f?"bg-[#171D8D] border-[#171D8D] text-white":"bg-white border-[#E3E8F1] text-[#66708A]"}`}>{f==="all" ? "All" : (STATUS_META as any)[f]?.label}</button>
                  ))}
                </div>
                <div className="hidden md:grid grid-cols-[100px_1.4fr_1fr_1fr_130px_90px] gap-3.5 px-4 text-[10.5px] uppercase tracking-[.04em] text-[#98A2B8] font-bold mb-2.5"><span>Ticket</span><span>Device</span><span>Customer</span><span>Received</span><span>Status</span><span></span></div>
                <div className="grid gap-2.5">
                  {tickets.length ? tickets.map(t=>(
                    <div key={t.id} className="bg-white border border-[#E3E8F1] rounded-[10px] p-4 grid md:grid-cols-[100px_1.4fr_1fr_1fr_130px_90px] gap-3.5 items-center hover:border-[#98A2B8]">
                      <span className="font-mono font-bold text-[#171D8D] text-[13px]">{t.id}</span>
                      <span><b className="block text-[13.5px]">{t.brand.replace(" (iPhone)","")} {t.model}</b><span className="text-[11.5px] text-[#66708A]">{t.color||"—"}</span></span>
                      <span className="text-[12.5px]">{t.custName||"Walk-in"}<span className="block text-[11px] text-[#66708A]">{t.custPhone||"No phone on file"}</span></span>
                      <span className="text-[12px] text-[#66708A]">{fmtDate(t.received)}</span>
                      <span><span className="text-[11px] font-bold px-3 py-1 rounded-md uppercase" style={{background: (STATUS_META as any)[t.status].color+"22", color: (STATUS_META as any)[t.status].color}}>{(STATUS_META as any)[t.status].label}</span></span>
                      <button onClick={()=> openTicket(t.id)} className="border border-[#E3E8F1] rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">Open</button>
                    </div>
                  )) : <div className="text-center py-5 text-[#66708A]">No tickets match this view.</div>}
                </div>
              </>
            )}

            {view==="new" && (
              <NewTicketWizard tech={session.name} onCreated={(id)=>{ load(); setActiveId(id); setView("detail"); }} onCancel={()=> setView("list")}/>
            )}

            {view==="detail" && activeId && (
              (()=> {
                const t = tickets.find(x=>x.id===activeId) as any;
                if(!t) return <div className="text-center py-10">Loading ticket… <button onClick={()=> setView("list")} className="text-[#1D53B7] underline">Back</button></div>;
                const canUpdate = session.role !== "Front Desk";
                const payments: any[] = t.payments || [];
                const history: any[] = t.history || [];
                const balance = t.amount - t.paid;
                return (
                  <div>
                    <button onClick={()=> setView("list")} className="border border-[#E3E8F1] bg-white rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold mb-4">← Back to tickets</button>
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                      <div><h2 className="font-mono text-[22px] font-bold">{t.id}</h2><p className="text-[#66708A] text-[13px]">Logged {fmtDate(t.received)} by {t.tech} {t.branch && `· ${t.branch}`}</p></div>
                      <span className="text-[11px] font-bold px-3 py-1.5 rounded-md uppercase" style={{background: (STATUS_META as any)[t.status].color+"22", color: (STATUS_META as any)[t.status].color}}>{(STATUS_META as any)[t.status].label}</span>
                    </div>
                    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-[22px] items-start">
                      <div className="space-y-4">
                        {canUpdate ? (
                          <div className="bg-white border border-[#E3E8F1] rounded-2xl p-6">
                            <h4 className="font-bold mb-3.5">Update status</h4>
                            <div className="flex gap-2 flex-wrap">
                              {STATUS_FLOW.map((s,i)=>(
                                <button key={s} onClick={()=> updateStatus(t.id,s)} className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold border ${t.status===s ? "bg-[#171D8D] text-white border-[#171D8D]":"bg-white border-[#E3E8F1]"}`}>{i+1}. {(STATUS_META as any)[s].label}</button>
                              ))}
                              <button onClick={()=> updateStatus(t.id,"cancelled")} className="bg-transparent text-[#DC2626] border border-[#F3C4C4] rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">Cancel job</button>
                            </div>
                            {history.length>0 && (
                              <div className="mt-5 border-t border-[#E3E8F1] pt-4">
                                <h5 className="text-[12px] font-bold text-[#66708A] uppercase tracking-[.03em] mb-2.5">Timeline — audit log</h5>
                                <div className="space-y-2">
                                  {history.slice().reverse().map((h:any, idx:number)=>(
                                    <div key={idx} className="flex gap-2.5 text-[12.5px] border-l-2 pl-3 py-1" style={{borderColor: (STATUS_META as any)[h.to]?.color || "#E3E8F1"}}>
                                      <div className="flex-1"><span className="font-semibold">{h.from ? `${(STATUS_META as any)[h.from]?.label} → ${(STATUS_META as any)[h.to]?.label}` : `Created → ${(STATUS_META as any)[h.to]?.label}`}</span><span className="text-[#66708A]"> by {h.by}</span></div>
                                      <span className="text-[11px] text-[#98A2B8] whitespace-nowrap">{fmtDateTime(h.at)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white border border-[#E3E8F1] rounded-2xl p-6">
                            <h4 className="font-bold mb-1.5">Status</h4>
                            <p className="text-[#66708A] text-[13px]">{(STATUS_META as any)[t.status].label} — only technicians and admins can change repair status.</p>
                            {history.length>0 && (
                              <div className="mt-4 space-y-2">
                                {history.slice().reverse().slice(0,4).map((h:any,i:number)=>(
                                  <div key={i} className="text-[12px] text-[#66708A]">• {(STATUS_META as any)[h.to]?.label} — {fmtDateTime(h.at)} by {h.by.split("@")[0]}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="bg-white border border-[#E3E8F1] rounded-2xl p-6">
                          <h4 className="font-bold mb-3.5">Device & customer</h4>
                          <div className="grid grid-cols-2 gap-3.5">
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Brand / Model</span><b className="text-[13.5px]">{t.brand.replace(" (iPhone)","")} {t.model}</b></div>
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Colour</span><b className="text-[13.5px]">{t.color||"Not recorded"}</b></div>
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">IMEI</span><b className="text-[13.5px]">{t.imei||"Not provided"}</b></div>
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Customer</span><b className="text-[13.5px]">{t.custName||"Walk-in customer"}</b></div>
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Phone</span><b className="text-[13.5px]">{t.custPhone||"Not provided"}</b></div>
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Technician</span><b className="text-[13.5px]">{t.tech}</b></div>
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Branch</span><b className="text-[13.5px]">{t.branch || "—"}</b></div>
                            <div className="col-span-2"><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Issue reported</span><b className="text-[13.5px]">{t.issue||"—"}</b></div>
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Amount</span><b className="text-[13.5px]">{fmtNaira(t.amount)}</b></div>
                            <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Paid / Balance</span><b className={`text-[13.5px] ${balance>0?"text-[#D97706]":"text-[#16A34A]"}`}>{fmtNaira(t.paid)} / {fmtNaira(balance)}</b></div>
                          </div>
                          {t.photo && <div className="mt-4"><div className="text-[11px] text-[#66708A] mb-2">DEVICE PHOTO AT DROP-OFF</div><img src={t.photo} alt="Device" className="w-[140px] h-[140px] object-cover rounded-[10px] border border-[#E3E8F1]"/></div>}
                        </div>
                        <div className="bg-white border border-[#E3E8F1] rounded-2xl p-6">
                          <h4 className="font-bold mb-3.5">Payment ledger</h4>
                          {payments.length ? (
                            <div className="space-y-2 mb-4">
                              {payments.map((p:any,i:number)=>(
                                <div key={i} className="flex justify-between items-center text-[12.5px] border-b border-[#F5F7FB] pb-2 last:border-0">
                                  <div><b>{fmtNaira(p.amount)}</b> <span className="text-[#66708A]">· {p.method||"cash"} · by {p.by.split("@")[0]}</span></div>
                                  <span className="text-[11px] text-[#98A2B8]">{fmtDateTime(p.at)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-[12.5px] font-bold pt-2"><span>Total paid</span><span>{fmtNaira(t.paid)} / {fmtNaira(t.amount)}</span></div>
                              {balance>0 && <div className="text-[11px] text-[#D97706]">Outstanding: {fmtNaira(balance)}</div>}
                              {balance<=0 && <div className="text-[11px] text-[#16A34A]">Fully paid ✓</div>}
                            </div>
                          ) : <div className="text-[12.5px] text-[#66708A] mb-4">No payments recorded yet.</div>}
                          <div className="flex gap-2">
                            <input value={payAmount} onChange={e=> setPayAmount(e.target.value)} placeholder="₦ amount" className="flex-1 border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2 text-sm outline-none font-mono"/>
                            <select value={payMethod} onChange={e=> setPayMethod(e.target.value)} className="border-[1.5px] border-[#E3E8F1] rounded-[9px] px-2 py-2 text-[12.5px]"><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="pos">POS</option></select>
                            <button onClick={()=> addPayment(t.id)} className="bg-[#0FB5C8] text-[#04262B] rounded-[9px] px-4 py-2 text-[12.5px] font-semibold">Add</button>
                          </div>
                          <div className="text-[11px] text-[#98A2B8] mt-2">Front Desk can mark payments — no status change needed.</div>
                        </div>
                      </div>
                      <div>
                        <PrintableTicket ticket={t} shop={shop || {shopName:"Muha Alifa Communication Center", address:"No. 14 Ali Akilu Road, Jalingo, Taraba State", phone:"+2348060521188", email:"Musasalehakwaki@gmail.com", footer:"Repair estimates are valid for 7 days."}}/>
                        <div className="flex gap-2.5 mt-3.5">
                          <button onClick={()=>download(t,"pdf")} className="flex-1 bg-[#171D8D] text-white rounded-[10px] py-2.5 font-semibold">Download PDF</button>
                          <button onClick={()=>download(t,"jpg")} className="flex-1 border border-[#E3E8F1] bg-white rounded-[10px] py-2.5 font-semibold">Download JPG</button>
                        </div>
                        <button onClick={()=> window.print()} className="w-full mt-2 border border-[#E3E8F1] bg-white rounded-[10px] py-2 text-[12.5px] font-semibold">⎙ Print</button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </main>
        </div>
      </div>
      {showLogout && (
        <div className="fixed inset-0 bg-[rgba(11,18,32,.5)] flex items-center justify-center z-[600] p-5">
          <div className="bg-white rounded-2xl p-7 max-w-[400px] w-full text-center">
            <h3 className="text-[18px] font-bold mb-2">Sign out?</h3>
            <p className="text-[#66708A] text-[13.5px] mb-5">You&apos;ll return to the staff login screen.</p>
            <div className="flex gap-2.5">
              <button onClick={()=> setShowLogout(false)} className="flex-1 border border-[#E3E8F1] rounded-[10px] py-2.5 font-semibold">Stay signed in</button>
              <button onClick={doLogout} className="flex-1 bg-[#171D8D] text-white rounded-[10px] py-2.5 font-semibold">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
