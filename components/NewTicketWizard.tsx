"use client";
import { useState } from "react";
import { BRAND_MODELS, BRAND_ORDER, SERVICES, SERVICE_ETA_DAYS } from "@/lib/constants";

const STEPS = ["Device","Customer & issue","Service & payment","Review"];

export function NewTicketWizard({tech, onCreated, onCancel}:{tech:string, onCreated:(id:string)=>void, onCancel:()=>void}){
  const [step,setStep]=useState(0);
  const [draft,setDraft]=useState<any>({
    brand:"Samsung", model:"", color:"", imei:"", photo:null,
    custName:"", custPhone:"", issue:"",
    service:SERVICES[0].id, customAmount:"", paidNow:"",
    expected: new Date(Date.now()+ SERVICE_ETA_DAYS[SERVICES[0].id]*864e5).toISOString().slice(0,10),
    expectedTouched:false,
  });
  const [loading,setLoading]=useState(false);

  const chosen = SERVICES.find(s=>s.id===draft.service)!;
  const amount = Number(draft.customAmount || chosen.price || 0);
  const selectService=(id:string)=>{
    setDraft((d:any)=>({...d, service:id, customAmount:"", expected: !d.expectedTouched ? new Date(Date.now()+SERVICE_ETA_DAYS[id]*864e5).toISOString().slice(0,10) : d.expected }));
  }

  const handlePhoto=(e:any)=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=> setDraft((d:any)=>({...d, photo:r.result as string})); r.readAsDataURL(f);
  }

  const submit=async()=>{
    setLoading(true);
    const res=await fetch("/api/tickets",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
      brand:draft.brand, model:draft.model, color:draft.color, imei:draft.imei, photo:draft.photo,
      custName:draft.custName, custPhone:draft.custPhone, issue:draft.issue,
      service:chosen.id, amount, paid: Number(draft.paidNow||0), expected: draft.expected, tech
    })});
    const data=await res.json();
    setLoading(false);
    if(data.ticket) onCreated(data.ticket.id);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div><h2 className="text-[22px] font-bold">New repair</h2><p className="text-[#66708A] text-[13px]">Step {step+1} of {STEPS.length} — {STEPS[step]}</p></div>
        <button onClick={onCancel} className="border border-[#E3E8F1] bg-white rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">Cancel</button>
      </div>
      <div className="bg-white border border-[#E3E8F1] rounded-2xl p-6 max-w-[700px]">
        <div className="flex gap-1.5 mb-6">{STEPS.map((_,i)=><span key={i} className={`h-1 flex-1 rounded-full ${i<=step?"bg-[#0FB5C8]":"bg-[#E3E8F1]"}`}></span>)}</div>

        {step===0 && (
          <div>
            <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Brand</label>
              <input list="brand-list" value={draft.brand} onChange={e=> setDraft((d:any)=>({...d, brand:e.target.value}))} placeholder="Start typing or choose — e.g. Samsung" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none focus:border-[#0FB5C8]"/>
              <datalist id="brand-list">{BRAND_ORDER.map(b=> <option key={b} value={b}/>) }<option value="Other brand"/></datalist>
              <div className="text-[12px] text-[#98A2B8] mt-1.5">Pinned first: Samsung, iPhone, Pixel, Infinix, Tecno — then A–Z. Type any other brand.</div>
            </div>
            <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Model (optional)</label>
              <input list="model-list" value={draft.model} onChange={e=> setDraft((d:any)=>({...d, model:e.target.value}))} placeholder="Start typing or choose" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none focus:border-[#0FB5C8]"/>
              <datalist id="model-list">{(BRAND_MODELS[draft.brand]||[]).map((m:string)=> <option key={m} value={m}/>)}</datalist>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
              <div><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Colour (optional)</label><input value={draft.color} onChange={e=> setDraft((d:any)=>({...d,color:e.target.value}))} placeholder="e.g. Midnight Black" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none focus:border-[#0FB5C8]"/></div>
              <div><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">IMEI (optional)</label><input value={draft.imei} onChange={e=> setDraft((d:any)=>({...d, imei:e.target.value.replace(/\D/g,"").slice(0,15)}))} maxLength={15} placeholder="15 digits, or skip" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0FB5C8]"/></div>
            </div>
            <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Device photo (optional)</label><input type="file" accept="image/*" onChange={handlePhoto} className="text-sm"/><div className="text-[12px] text-[#98A2B8] mt-1.5">A quick photo of the phone&apos;s condition at drop-off — protects against disputes.</div>
              {draft.photo && <div className="mt-2.5 relative w-[110px]"><img src={draft.photo} className="w-[110px] h-[110px] object-cover rounded-[9px] border border-[#E3E8F1]"/><button onClick={()=> setDraft((d:any)=>({...d,photo:null}))} className="absolute -top-2 -right-2 bg-[#DC2626] text-white rounded-full w-5 h-5 text-[11px]">✕</button></div>}
            </div>
          </div>
        )}
        {step===1 && (
          <div>
            <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Customer name (optional)</label><input value={draft.custName} onChange={e=> setDraft((d:any)=>({...d,custName:e.target.value}))} placeholder="Full name — leave blank for walk-in" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none focus:border-[#0FB5C8]"/></div>
            <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Phone number (optional)</label><input value={draft.custPhone} onChange={e=> setDraft((d:any)=>({...d,custPhone:e.target.value}))} placeholder="Needed only for SMS/WhatsApp updates" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0FB5C8]"/></div>
            <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Issue description (optional)</label><textarea rows={3} value={draft.issue} onChange={e=> setDraft((d:any)=>({...d,issue:e.target.value}))} placeholder="e.g. Cracked screen, won't charge…" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none focus:border-[#0FB5C8]"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Expected collection</label><input type="date" value={draft.expected} onChange={e=> setDraft((d:any)=>({...d,expected:e.target.value, expectedTouched:true}))} className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none focus:border-[#0FB5C8]"/></div>
            </div>
            <div className="text-[12px] text-[#98A2B8] mt-2">Collection date auto-estimates from the service chosen in the next step — edit any time.</div>
          </div>
        )}
        {step===2 && (
          <div>
            <div className="text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-2.5">Type of fix</div>
            {SERVICES.map(s=>(
              <div key={s.id} onClick={()=> selectService(s.id)} className={`border-[1.5px] rounded-[9px] p-3 flex justify-between items-center mb-2 cursor-pointer ${draft.service===s.id ? "border-[#0FB5C8] bg-[#EFFBFC]" : "border-[#E3E8F1] hover:border-[#98A2B8]"}`}>
                <div><b className="text-[13.5px]">{s.name}</b><br/><span className="text-[11.5px] text-[#66708A]">{s.type==='fixed'?'Fixed price · staff can override':'Adjustable · enter amount manually'} · est. {SERVICE_ETA_DAYS[s.id]} day{SERVICE_ETA_DAYS[s.id]>1?'s':''}</span></div>
                <div className="font-mono font-bold text-[#171D8D] text-[13px]">{s.type==='fixed'?"₦"+Number(s.price).toLocaleString("en-NG"):"Custom"}</div>
              </div>
            ))}
            <div className="mt-3.5 mb-4"><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">{chosen.type==='fixed'?"Price (override if needed)":"Amount agreed (optional)"}</label><input value={draft.customAmount || (chosen.type==='fixed'?String(chosen.price):"")} onChange={e=> setDraft((d:any)=>({...d,customAmount:e.target.value}))} placeholder="₦" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0FB5C8]"/></div>
            <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] uppercase tracking-[.02em] mb-1.5">Amount paid now (optional)</label><input value={draft.paidNow} onChange={e=> setDraft((d:any)=>({...d,paidNow:e.target.value}))} placeholder="₦0 if none yet" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0FB5C8]"/></div>
            <div className="text-[12px] text-[#98A2B8]">Balance due: <b className="font-mono">₦{Number(amount-Number(draft.paidNow||0)).toLocaleString("en-NG")}</b></div>
          </div>
        )}
        {step===3 && (
          <div>
            <div className="grid grid-cols-2 gap-3.5">
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Device</span><b className="text-[13.5px]">{draft.brand} {draft.model}</b></div>
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Colour</span><b className="text-[13.5px]">{draft.color||"Not recorded"}</b></div>
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">IMEI</span><b className="text-[13.5px]">{draft.imei||"Not provided"}</b></div>
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Customer</span><b className="text-[13.5px]">{draft.custName||"Walk-in customer"}</b></div>
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Phone</span><b className="text-[13.5px]">{draft.custPhone||"Not provided"}</b></div>
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Service</span><b className="text-[13.5px]">{chosen.name}</b></div>
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Amount</span><b className="text-[13.5px]">₦{Number(amount).toLocaleString("en-NG")}</b></div>
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Paid now</span><b className="text-[13.5px]">₦{Number(draft.paidNow||0).toLocaleString("en-NG")}</b></div>
              <div><span className="block text-[11px] text-[#66708A] uppercase tracking-[.03em] mb-1">Expected collection</span><b className="text-[13.5px]">{draft.expected ? new Date(draft.expected).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"}</b></div>
            </div>
            {draft.photo && <div className="mt-3.5"><div className="text-[12px] text-[#98A2B8] mb-2">DEVICE PHOTO</div><img src={draft.photo} className="w-[100px] h-[100px] object-cover rounded-[9px] border border-[#E3E8F1]"/></div>}
            <p className="text-[12px] text-[#66708A] mt-3.5">Generating this ticket creates a unique ID and QR code, and adds it to the active bench list.</p>
          </div>
        )}

        <div className="flex justify-between mt-5 pt-4 border-t border-[#E3E8F1]">
          <button disabled={step===0} onClick={()=> setStep(s=> Math.max(0,s-1))} className="border border-[#E3E8F1] rounded-[10px] px-5 py-2.5 text-sm font-semibold disabled:opacity-50">← Back</button>
          {step < STEPS.length-1 ? <button onClick={()=> setStep(s=> Math.min(STEPS.length-1,s+1))} className="bg-[#171D8D] text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold">Continue</button>
          : <button disabled={loading} onClick={submit} className="bg-[#0FB5C8] text-[#04262B] rounded-[10px] px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{loading ? "Creating…":"Generate ticket"}</button>}
        </div>
      </div>
    </div>
  )
}
