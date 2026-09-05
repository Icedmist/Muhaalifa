"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicHeader, Footer } from "@/components/Header";

export default function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState<string|null>(null);
  const [showHint,setShowHint]=useState(false);
  const [staff,setStaff]=useState<any[]>([]);
  const router=useRouter();
  useEffect(()=>{ fetch("/api/staff").then(r=>r.json()).then(d=> setStaff(d.staff)).catch(()=>{}); },[]);
  const doLogin=async()=>{
    setError(null);
    const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const data=await res.json();
    if(!res.ok){ setError(data.error); return; }
    localStorage.setItem("muha_session", JSON.stringify(data.user));
    router.push("/dashboard");
  }
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      <PublicHeader/>
      <div className="flex-1 flex items-center justify-center p-10 bg-gradient-to-br from-[#171D8D] to-[#10136B]">
        <div className="bg-white rounded-2xl p-8 w-full max-w-[380px] shadow-[0_24px_60px_-20px_rgba(23,29,141,.35)]">
          <h2 className="text-[21px] font-bold mb-1.5">Sign in to MuhaAlifa</h2>
          <p className="text-[#66708A] text-[13px] mb-5">Access your repair dashboard.</p>
          {error && <div className="bg-[#FDEDED] text-[#DC2626] border border-[#F3C4C4] px-3 py-2.5 rounded-[9px] text-[12.5px] mb-3.5">{error}</div>}
          <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] mb-1.5 uppercase">Email</label><input value={email} onChange={e=> setEmail(e.target.value)} placeholder="you@muhaalifa.app" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[10px] px-3 py-2.5 text-sm outline-none focus:border-[#0FB5C8]"/></div>
          <div className="mb-4"><label className="block text-[12px] font-bold text-[#66708A] mb-1.5 uppercase">Password</label><input type="password" value={password} onChange={e=> setPassword(e.target.value)} placeholder="••••••••" className="w-full border-[1.5px] border-[#E3E8F1] rounded-[10px] px-3 py-2.5 text-sm outline-none focus:border-[#0FB5C8]"/></div>
          <button onClick={doLogin} className="w-full bg-[#171D8D] text-white rounded-[10px] py-2.5 font-semibold">Sign in</button>
          <button onClick={()=> setShowHint(!showHint)} className="w-full text-center text-[#1D53B7] text-[12.5px] font-semibold mt-3.5 hover:underline">{showHint?'Hide demo accounts':'Need a demo account?'}</button>
          {showHint && <div className="mt-2 bg-[#F5F7FB] border border-[#E3E8F1] rounded-[9px] p-3 text-[11px] text-[#66708A] leading-7">
            {staff.map((s:any)=> <div key={s.email}>{s.role}: <span className="font-mono">{s.email}</span></div>)}
            <div>Any password works in this preview.</div>
          </div>}
        </div>
      </div>
      <Footer/>
    </div>
  )
}
