import fs from "fs";
import path from "path";
import { Ticket, Settings, STAFF_SEED } from "./constants";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

type DB = {
  tickets: Ticket[];
  settings: Settings;
  staff: typeof STAFF_SEED;
};

function daysAgo(n:number){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString(); }
function daysFromNow(n:number){ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString(); }

function makeHistory(seedStatus: string, received: string, tech: string): any[] {
  const base = new Date(received).getTime();
  const flow = ["received","diagnosis","repair","awaiting-parts","ready","collected"];
  const idx = flow.indexOf(seedStatus);
  const hist: any[] = [];
  if(idx>=0){
    for(let i=0;i<=idx;i++){
      hist.push({ from: i===0?null:flow[i-1], to: flow[i], at: new Date(base + i* 3600*1000*6).toISOString(), by: tech });
    }
    // add an extra earlier step variance for demo
    if(seedStatus==="awaiting-parts" && hist.length>3) hist[3].by="Grace Okon";
  } else {
    hist.push({ from:null, to: seedStatus, at: received, by: tech });
  }
  return hist;
}

function seed(): DB {
  const t1Received = daysAgo(2), t2Received=daysAgo(1), t3Received=daysAgo(4), t4Received=daysAgo(6), t5Received=daysAgo(9);
  return {
    tickets: [
      {id:"MA-7F3K2", brand:"Apple (iPhone)", model:"iPhone 13 Pro", color:"Graphite", imei:"356938035643809", custName:"Amina Yusuf", custPhone:"08031234567", issue:"Cracked screen, touch still works", photo:null, service:"screen", amount:15000, paid:15000, received:t1Received, expected:daysAgo(-1), status:"repair", tech:"Bello Sani", branch:"Main Branch — Jalingo", history: makeHistory("repair", t1Received,"Bello Sani"), payments: [{amount:15000, at: t1Received, by:"Fatima Sule", method:"cash"}]},
      {id:"MA-9QX41", brand:"Samsung", model:"Galaxy A54", color:"Black", imei:"", custName:"Chuka Okafor", custPhone:"08099887766", issue:"Won't charge, port feels loose", photo:null, service:"port", amount:6000, paid:3000, received:t2Received, expected:daysAgo(-2), status:"diagnosis", tech:"Grace Okon", branch:"Main Branch — Jalingo", history: makeHistory("diagnosis", t2Received,"Grace Okon"), payments: [{amount:3000, at: t2Received, by:"Fatima Sule", method:"transfer"}]},
      {id:"MA-2LK88", brand:"Infinix", model:"Note 30", color:"Blue", imei:"862011045823671", custName:"Hauwa Bello", custPhone:"08155667788", issue:"Fell in water, won't power on", photo:null, service:"water", amount:12000, paid:6000, received:t3Received, expected:daysAgo(-1), status:"awaiting-parts", tech:"Bello Sani", branch:"Main Branch — Jalingo", history: makeHistory("awaiting-parts", t3Received,"Bello Sani"), payments: [{amount:6000, at: t3Received, by:"Fatima Sule", method:"cash"}]},
      {id:"MA-5T0P7", brand:"Google Pixel", model:"Pixel 8", color:"Obsidian", imei:"", custName:"Tunde Alabi", custPhone:"08022334455", issue:"Camera app crashes on open", photo:null, service:"camera", amount:12000, paid:12000, received:t4Received, expected:daysAgo(1), status:"ready", tech:"Grace Okon", branch:"Main Branch — Jalingo", history: makeHistory("ready", t4Received,"Grace Okon"), payments: [{amount:12000, at: t4Received, by:"Grace Okon", method:"pos"}]},
      {id:"MA-3B9V0", brand:"Tecno", model:"Camon 20", color:"Gold", imei:"", custName:"Ibrahim Sale", custPhone:"08066112233", issue:"Battery drains within 2 hours", photo:null, service:"battery", amount:8000, paid:8000, received:t5Received, expected:daysAgo(6), status:"collected", tech:"Bello Sani", branch:"Main Branch — Jalingo", history: makeHistory("collected", t5Received,"Bello Sani"), payments: [{amount:8000, at: t5Received, by:"Fatima Sule", method:"cash"}]},
    ],
    settings: {
      shopName:"Motoo — All iPhone solution",
      address:"No. 14 Ali Akilu Road, Jalingo, Taraba State",
      phone:"+2348060521188",
      email:"Musasalehakwaki@gmail.com",
      accent:"#0FB5C8",
      footer:"Repair estimates are valid for 7 days.",
      logo:null,
      branches:["Main Branch — Jalingo"]
    },
    staff: STAFF_SEED as any
  };
}

export function getDb(): DB {
  try{
    if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
    if(!fs.existsSync(DB_PATH)){
      const s = seed();
      fs.writeFileSync(DB_PATH, JSON.stringify(s,null,2));
      return s;
    }
    const raw = fs.readFileSync(DB_PATH,"utf-8");
    return JSON.parse(raw) as DB;
  } catch {
    return seed();
  }
}

export function saveDb(db:DB){
  if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true});
  fs.writeFileSync(DB_PATH, JSON.stringify(db,null,2));
}

// For serverless environments where FS is readonly (Vercel), fallback to in-memory.
// Vercel's filesystem is ephemeral - data resets on cold start but still works for demo.
// For production, swap this with Vercel KV / Postgres / Neon.
let mem: DB | null = null;
function isReadOnlyFs(){
  // Vercel sets VERCEL env
  return !!process.env.VERCEL;
}

export function readDb(): DB {
  if(isReadOnlyFs()){
    if(!mem) mem = getDb();
    return mem;
  }
  return getDb();
}
export function writeDb(db:DB){
  if(isReadOnlyFs()){
    mem = db;
    try{ saveDb(db); } catch {}
    return;
  }
  saveDb(db);
}
