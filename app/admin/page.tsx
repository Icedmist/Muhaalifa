"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICES, fmtNaira } from "@/lib/constants";
import { Brandmark } from "@/components/Header";
import { PERMISSIONS } from "@/lib/permissions";
import { authFetch } from "@/lib/client";

export default function Admin(){
  const router=useRouter();
  const [session,setSession]=useState<any>(null);
  const [tab,setTab]=useState("overview");
  const [stats,setStats]=useState<any>(null);
  const [staff,setStaff]=useState<any[]>([]);
  const [settings,setSettings]=useState<any>({shopName:"", address:"", phone:"", accent:"#0FB5C8", footer:"", logo:null, branches:[]});
  const [branches,setBranches]=useState<string[]>([]);

  useEffect(()=>{
    const raw=localStorage.getItem("muha_session");
    if(!raw){ router.replace("/login"); return;}
    const s=JSON.parse(raw);
    if(s.role!=="Admin"){ router.replace("/dashboard"); return;}
    setSession(s);
    authFetch("/api/stats").then(r=> r.json().then(d=> { if(r.ok) setStats(d); })).catch(()=>{});
    authFetch("/api/staff").then(r=> r.json().then(d=> { if(r.ok) setStaff(d.staff); })).catch(()=>{});
    fetch("/api/settings").then(r=>r.json()).then(d=> { setSettings(d.settings); setBranches(d.settings.branches||[]); }).catch(()=>{});
  },[]);

  const saveBranding=async()=>{
    const r = await authFetch("/api/settings",{method:"PUT", body:JSON.stringify({...settings, branches})});
    const d = await r.json();
    if(!r.ok){ alert(d.error || "Failed — forbidden"); return; }
    alert("Branding saved");
    document.documentElement.style.setProperty('--teal', settings.accent);
  }
  const handleLogo=(e:any)=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=> setSettings((s:any)=>({...s, logo:r.result as string})); r.readAsDataURL(f);
  }
  const setAccent=(c:string)=> setSettings((s:any)=>({...s, accent:c}));

  if(!session) return <div className="p-10 text-center">Checking admin…</div>;

  const initials = session.name.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#F5F7FB]">
      <aside className="hidden md:flex w-[220px] flex-none bg-[#0B1220] text-white p-4 flex-col gap-1">
        <div className="text-white mb-6 px-2"><Brandmark logo={settings.logo}/></div>
        <button onClick={()=> router.push("/dashboard")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13.5px] font-semibold text-[#A9B0CC] hover:bg-white/10 hover:text-white">⊞ Tickets</button>
        <button onClick={()=> router.push("/dashboard")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13.5px] font-semibold text-[#A9B0CC] hover:bg-white/10 hover:text-white">+ New repair</button>
        <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13.5px] font-semibold bg-[#0FB5C8] text-[#04262B]">⚙ Admin console</button>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[60px] flex-none border-b border-[#E3E8F1] bg-white flex items-center justify-between px-4 md:px-[30px]">
          <div className="font-bold text-[13.5px] text-[#66708A]">{settings.shopName}</div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#171D8D] text-white flex items-center justify-center text-[12px] font-bold">{initials}</div>
            <div className="hidden sm:flex flex-col leading-none"><b className="text-[12.5px]">{session.name}</b><span className="text-[10.5px] text-[#66708A]">{session.role}</span></div>
            <button onClick={async()=>{ await fetch("/api/auth/logout",{method:"POST", credentials:"include"}); localStorage.removeItem("muha_session"); router.replace("/");}} className="border border-[#E3E8F1] rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">Sign out</button>
          </div>
        </div>
        <main className="flex-1 p-4 md:p-7 max-w-[1080px] w-full">
          <div className="flex justify-between items-center mb-6"><div><h2 className="text-[22px] font-bold">Admin console</h2><p className="text-[#66708A] text-[13px]">Run the shop — staff, pricing, branding, and reports.</p></div></div>
          <div className="flex gap-1 border-b border-[#E3E8F1] mb-5 flex-wrap">
            {[
              ["overview","Overview"], ["staff","Staff & Permissions"], ["catalog","Pricing catalog"], ["branding","Branding & theme"], ["reminders","Reminders"]
            ].map(([id,label])=>(
              <button key={id} onClick={()=> setTab(id)} className={`px-3.5 py-2.5 text-[13px] font-semibold border-b-2 ${tab===id ? "text-[#171D8D] border-[#171D8D]":"text-[#66708A] border-transparent"}`}>{label}</button>
            ))}
          </div>

          {tab==="overview" && stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-[#E3E8F1] rounded-[10px] p-4"><span className="text-[11px] text-[#66708A] uppercase tracking-[.02em]">Total tickets</span><b className="block font-['Sora'] text-[23px] mt-1.5">{stats.total}</b><div className="text-[11px] text-[#16A34A] font-semibold">+3 this week</div></div>
                <div className="bg-white border border-[#E3E8F1] rounded-[10px] p-4"><span className="text-[11px] text-[#66708A] uppercase tracking-[.02em]">Revenue collected</span><b className="block font-['Sora'] text-[23px] mt-1.5">{fmtNaira(stats.revenue)}</b><div className="text-[11px] text-[#16A34A] font-semibold">this month</div></div>
                <div className="bg-white border border-[#E3E8F1] rounded-[10px] p-4"><span className="text-[11px] text-[#66708A] uppercase tracking-[.02em]">Outstanding balance</span><b className="block font-['Sora'] text-[23px] mt-1.5">{fmtNaira(stats.outstanding)}</b></div>
                <div className="bg-white border border-[#E3E8F1] rounded-[10px] p-4"><span className="text-[11px] text-[#66708A] uppercase tracking-[.02em]">Avg turnaround</span><b className="block font-['Sora'] text-[23px] mt-1.5">3.4 days</b></div>
              </div>
              <div className="grid md:grid-cols-[1.2fr_.8fr] gap-4">
                <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
                  <h4 className="font-bold text-[14.5px]">Most common repair types</h4><p className="text-[12px] text-[#66708A] mb-4">Across all logged tickets</p>
                  {Object.entries(stats.byService as Record<string,number>).map(([id,count])=>{
                    const s=SERVICES.find(x=>x.id===id); const max=Math.max(...Object.values(stats.byService as Record<string,number>),1);
                    return (<div key={id} className="flex items-center gap-2.5 mb-2.5 text-[12.5px]"><span className="w-[130px] flex-none text-[#66708A]">{s?.name||id}</span><div className="flex-1 h-2 bg-[#E3E8F1] rounded-full overflow-hidden"><div className="h-full bg-[#0FB5C8] rounded-full" style={{width:`${(count/max)*100}%`}}></div></div><span className="w-8 text-right font-bold text-[12px]">{count}</span></div>)
                  })}
                </div>
                <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
                  <h4 className="font-bold text-[14.5px]">Per-technician job count</h4><p className="text-[12px] text-[#66708A] mb-4">All-time</p>
                  {staff.filter(s=>s.role==='Technician').map((s:any)=>(<div key={s.email} className="flex items-center gap-2.5 mb-2.5 text-[12.5px]"><span className="w-[130px] flex-none text-[#66708A]">{s.name}</span><div className="flex-1 h-2 bg-[#E3E8F1] rounded-full overflow-hidden"><div className="h-full bg-[#7C3AED] rounded-full" style={{width:`${(s.tickets/16)*100}%`}}></div></div><span className="w-8 text-right font-bold text-[12px]">{s.tickets}</span></div>))}
                </div>
              </div>
            </>
          )}

          {tab==="staff" && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4"><div><h4 className="font-bold text-[14.5px]">Staff accounts</h4><p className="text-[12px] text-[#66708A]">Add or remove staff, assign roles: Admin, Technician, Front Desk. Current user highlighted.</p></div><button onClick={()=> alert('Add-staff form would open here — POST /api/staff (Admin only)')} className="bg-[#0FB5C8] text-[#04262B] rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">+ Add staff</button></div>
                <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse"><thead><tr className="text-[10.5px] uppercase tracking-[.03em] text-[#98A2B8]"><th className="text-left p-2 border-b border-[#E3E8F1]">Name</th><th className="text-left p-2 border-b border-[#E3E8F1]">Email</th><th className="text-left p-2 border-b border-[#E3E8F1]">Role</th><th className="text-left p-2 border-b border-[#E3E8F1]">Tickets handled</th><th className="p-2 border-b border-[#E3E8F1]"></th></tr></thead>
                <tbody>{staff.map((s:any)=>{
                  const isMe = session?.email===s.email;
                  return <tr key={s.email} className={isMe?"bg-[#EEF1FA]":""}><td className="p-2 border-b border-[#E3E8F1]">{s.name} {isMe && <span className="text-[10px] bg-[#171D8D] text-white px-2 py-0.5 rounded-full ml-1">YOU</span>}</td><td className="p-2 border-b border-[#E3E8F1] font-mono text-[11.5px]">{s.email}</td><td className="p-2 border-b border-[#E3E8F1]"><span className="text-[10.5px] font-bold px-2.5 py-1 rounded-md bg-[#EEF1FA] text-[#171D8D]">{s.role}</span></td><td className="p-2 border-b border-[#E3E8F1]">{s.tickets}</td><td className="p-2 border-b border-[#E3E8F1]"><button onClick={()=> alert(`Edit ${s.name} — requires staff:write (Admin only).`)} className="border border-[#E3E8F1] rounded-lg px-3 py-1 text-[12.5px]">Edit</button></td></tr>;
                })}</tbody>
                </table>
                </div>
                <div className="mt-4 p-3 bg-[#F5F7FB] border border-[#E3E8F1] rounded-[9px] text-[11px] text-[#66708A]">
                  Accounts are provisioned by an Admin via <span className="font-mono">POST /api/staff</span>. Role checks are enforced server-side (401/403) via HttpOnly JWT.
                </div>
              </div>
              <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
                <h4 className="font-bold text-[14.5px]">Role → Permissions matrix</h4><p className="text-[12px] text-[#66708A] mb-3">Source: <span className="font-mono">lib/auth.ts:PERMISSIONS</span>. Server returns 401 if unauthenticated, 403 if role too low.</p>
                <div className="overflow-x-auto">
                <table className="w-full text-[12.5px] border-collapse">
                  <thead><tr className="text-[10.5px] uppercase tracking-[.03em] text-[#98A2B8]"><th className="text-left p-2 border-b border-[#E3E8F1]">Permission</th><th className="text-left p-2 border-b border-[#E3E8F1]">Min role</th><th className="text-center p-2 border-b border-[#E3E8F1]">Front Desk</th><th className="text-center p-2 border-b border-[#E3E8F1]">Technician</th><th className="text-center p-2 border-b border-[#E3E8F1]">Admin</th></tr></thead>
                  <tbody>{Object.entries(PERMISSIONS).map(([key, p])=>{
                    const ranks:Record<string,number>={"Front Desk":1,"Technician":2,"Admin":3};
                    const need = ranks[p.minRole];
                    const check = (r:string)=> ranks[r]>=need ? "✓" : "—";
                    const color = (r:string)=> ranks[r]>=need ? "text-[#16A34A] font-bold" : "text-[#98A2B8]";
                    return <tr key={key}><td className="p-2 border-b border-[#E3E8F1]"><span className="font-mono text-[11px] bg-[#F5F7FB] border border-[#E3E8F1] px-1.5 py-0.5 rounded">{key}</span><span className="ml-2 text-[11.5px] text-[#66708A]">{p.desc}</span></td><td className="p-2 border-b border-[#E3E8F1]"><span className="text-[10.5px] font-bold px-2 py-1 rounded bg-[#EEF1FA] text-[#171D8D]">{p.minRole}</span></td><td className={`p-2 border-b border-[#E3E8F1] text-center ${color("Front Desk")}`}>{check("Front Desk")}</td><td className={`p-2 border-b border-[#E3E8F1] text-center ${color("Technician")}`}>{check("Technician")}</td><td className={`p-2 border-b border-[#E3E8F1] text-center ${color("Admin")}`}>{check("Admin")}</td></tr>;
                  })}</tbody>
                </table>
                </div>
                <div className="mt-3 text-[11px] text-[#98A2B8]">Front desk accounts are read-only for status transitions — the API returns 403 when permission is insufficient.</div>
              </div>
            </div>
          )}

          {tab==="catalog" && (
            <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4"><div><h4 className="font-bold text-[14.5px]">Service & pricing catalog</h4><p className="text-[12px] text-[#66708A]">Fixed-price services auto-fill at intake; adjustable ones need a manual amount.</p></div><button onClick={()=> alert('Add-service form would open here')} className="bg-[#0FB5C8] text-[#04262B] rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">+ Add service</button></div>
              <table className="w-full text-[13px] border-collapse"><thead><tr className="text-[10.5px] uppercase tracking-[.03em] text-[#98A2B8]"><th className="text-left p-2 border-b border-[#E3E8F1]">Service</th><th className="text-left p-2 border-b border-[#E3E8F1]">Type</th><th className="text-left p-2 border-b border-[#E3E8F1]">Price</th><th className="p-2 border-b border-[#E3E8F1]"></th></tr></thead>
              <tbody>{SERVICES.map(s=><tr key={s.id}><td className="p-2 border-b border-[#E3E8F1]">{s.name}</td><td className="p-2 border-b border-[#E3E8F1]"><span className="text-[10.5px] font-bold px-2.5 py-1 rounded-md" style={{background:s.type==='fixed'?'#EEF1FA':'#FDF3E7', color:s.type==='fixed'?'#1D53B7':'#D97706'}}>{s.type==='fixed'?'Fixed':'Adjustable'}</span></td><td className="p-2 border-b border-[#E3E8F1] font-mono">{s.type==='fixed'?fmtNaira(s.price!):'Set at intake'}</td><td className="p-2 border-b border-[#E3E8F1]"><button onClick={()=> alert('Edit pricing')} className="border border-[#E3E8F1] rounded-lg px-3 py-1 text-[12.5px]">Edit</button></td></tr>)}</tbody>
              </table>
            </div>
          )}

          {tab==="branding" && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
                <h4 className="font-bold text-[14.5px] mb-1">Shop branding</h4><p className="text-[12px] text-[#66708A] mb-4">Appears on the landing page, tracking page, and every printed ticket.</p>
                <div className="grid md:grid-cols-2 gap-3.5">
                  <div><label className="block text-[12px] font-bold text-[#66708A] uppercase mb-1.5">Shop name</label><input value={settings.shopName} onChange={e=> setSettings((s:any)=>({...s, shopName:e.target.value}))} className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none"/></div>
                  <div><label className="block text-[12px] font-bold text-[#66708A] uppercase mb-1.5">Contact phone</label><input value={settings.phone} onChange={e=> setSettings((s:any)=>({...s, phone:e.target.value}))} className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm font-mono outline-none"/></div>
                </div>
                <div className="mt-3.5"><label className="block text-[12px] font-bold text-[#66708A] uppercase mb-1.5">Address</label><input value={settings.address} onChange={e=> setSettings((s:any)=>({...s, address:e.target.value}))} className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none"/></div>
                <div className="mt-3.5"><label className="block text-[12px] font-bold text-[#66708A] uppercase mb-1.5">Receipt footer text</label><input value={settings.footer} onChange={e=> setSettings((s:any)=>({...s, footer:e.target.value}))} className="w-full border-[1.5px] border-[#E3E8F1] rounded-[9px] px-3 py-2.5 text-sm outline-none"/></div>
                <div className="mt-3.5"><label className="block text-[12px] font-bold text-[#66708A] uppercase mb-1.5">Shop logo (optional)</label><input type="file" accept="image/*" onChange={handleLogo}/>
                  <div className="flex gap-3 mt-2 items-center">
                    {settings.logo ? <img src={settings.logo} alt="Uploaded logo" className="w-11 h-11 rounded-[9px] object-cover"/> : <img src="/logo.svg" alt="Default logo" className="w-36 h-auto border border-[#E3E8F1] rounded-[9px] p-1"/>}
                    <div className="text-[11px] text-[#66708A]">
                      Pack: <a href="/logo.svg" target="_blank" className="text-[#1D53B7] underline">logo.svg</a> · <a href="/logo-dark.svg" target="_blank" className="text-[#1D53B7] underline">logo-dark.svg</a> · <a href="/logo-icon.svg" target="_blank" className="text-[#1D53B7] underline">logo-icon.svg</a> · <a href="/favicon.svg" target="_blank" className="text-[#1D53B7] underline">favicon.svg</a> · <a href="/og-image.svg" target="_blank" className="text-[#1D53B7] underline">og-image.svg</a>
                    </div>
                  </div>
                </div>
                <button onClick={saveBranding} className="mt-4 bg-[#171D8D] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold">Save branding</button>
              </div>
              <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
                <h4 className="font-bold text-[14.5px] mb-1">Theme colour</h4><p className="text-[12px] text-[#66708A] mb-4">Ships with NEXA&apos;s default teal accent — pick any colour to match your shop.</p>
                <div className="flex items-center gap-4">
                  <input type="color" value={settings.accent} onChange={e=> setAccent(e.target.value)} className="w-[52px] h-[52px] border-none rounded-[10px] cursor-pointer p-0"/>
                  <div><div className="font-mono font-bold text-[13.5px]">{settings.accent}</div><div className="text-[11.5px] text-[#66708A]">Click the swatch to choose any colour</div></div>
                </div>
                <div className="flex gap-2.5 mt-3.5">{["#0FB5C8","#1D53B7","#171D8D","#16A34A","#D97706","#7C3AED"].map(c=><button key={c} onClick={()=> setAccent(c)} style={{background:c, border: c===settings.accent ? "2px solid #0B1220": "2px solid transparent"}} className="w-[34px] h-[34px] rounded-[9px]"></button>)}</div>
                <button onClick={saveBranding} className="mt-4 bg-[#171D8D] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold">Save theme</button>
              </div>
              <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
                <h4 className="font-bold text-[14.5px] mb-1">Locations</h4><p className="text-[12px] text-[#66708A] mb-4">Add branches if you operate from more than one location.</p>
                <table className="w-full text-[13px] border-collapse"><thead><tr className="text-[10.5px] uppercase tracking-[.03em] text-[#98A2B8]"><th className="text-left p-2 border-b border-[#E3E8F1]">Branch</th><th className="p-2 border-b border-[#E3E8F1]"></th></tr></thead>
                  <tbody>{branches.map((b,i)=><tr key={i}><td className="p-2 border-b border-[#E3E8F1]">{b}</td><td className="p-2 border-b border-[#E3E8F1]"><button onClick={()=> alert('Edit branch')} className="border border-[#E3E8F1] rounded-lg px-3 py-1 text-[12.5px]">Edit</button></td></tr>)}</tbody>
                </table>
                <button onClick={()=> {const v=prompt("Branch name"); if(v){ setBranches([...branches,v]);}}} className="mt-2.5 border border-[#E3E8F1] rounded-lg px-3 py-1.5 text-[12.5px]">+ Add branch</button>
                <button onClick={saveBranding} className="ml-2 mt-2.5 bg-[#171D8D] text-white rounded-lg px-3 py-1.5 text-[12.5px]">Save</button>
              </div>
            </div>
          )}

          {tab==="reminders" && (
            <div className="bg-white border border-[#E3E8F1] rounded-2xl p-5">
              <h4 className="font-bold text-[14.5px] mb-1">Reminders</h4><p className="text-[12px] text-[#66708A] mb-4">Automatically notify customers by SMS or WhatsApp as their repair progresses.</p>
              <div className="flex justify-between items-center py-3 border-b border-[#E3E8F1]"><div><b className="block text-[13px]">Ready for pickup</b><span className="text-[11.5px] text-[#66708A]">Sent the moment a ticket moves to &quot;Ready for Pickup&quot;</span></div><label className="relative inline-block w-[38px] h-[21px]"><input type="checkbox" defaultChecked className="peer sr-only"/><span className="absolute inset-0 bg-[#E3E8F1] rounded-full peer-checked:bg-[#0FB5C8] transition"></span><span className="absolute w-[15px] h-[15px] left-[3px] top-[3px] bg-white rounded-full transition peer-checked:translate-x-[17px]"></span></label></div>
              <div className="flex justify-between items-center py-3 border-b border-[#E3E8F1]"><div><b className="block text-[13px]">Uncollected follow-up</b><span className="text-[11.5px] text-[#66708A]">Sent if a device isn&apos;t collected within 7 days of being ready</span></div><label className="relative inline-block w-[38px] h-[21px]"><input type="checkbox" defaultChecked className="peer sr-only"/><span className="absolute inset-0 bg-[#E3E8F1] rounded-full peer-checked:bg-[#0FB5C8] transition"></span><span className="absolute w-[15px] h-[15px] left-[3px] top-[3px] bg-white rounded-full transition peer-checked:translate-x-[17px]"></span></label></div>
              <p className="text-[11.5px] text-[#98A2B8] mt-3">Connect an SMS/WhatsApp provider (e.g. Termii, Twilio) under Integrations to activate live sending.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
