// Shared constants — mirrors original muhaalifa_v2.html design tokens
export const STATUS_FLOW = ["received","diagnosis","repair","awaiting-parts","ready","collected"] as const;
export type Status = typeof STATUS_FLOW[number] | "cancelled";

export const STATUS_META: Record<Status, {label:string,color:string}> = {
  "received": {label:"Received", color:"#64748B"},
  "diagnosis": {label:"In Diagnosis", color:"#D97706"},
  "repair": {label:"In Repair", color:"#1D53B7"},
  "awaiting-parts": {label:"Awaiting Parts", color:"#7C3AED"},
  "ready": {label:"Ready for Pickup", color:"#0FB5C8"},
  "collected": {label:"Collected", color:"#16A34A"},
  "cancelled": {label:"Cancelled", color:"#DC2626"},
};

export const BRAND_MODELS: Record<string,string[]> = {
  "Samsung": ["Galaxy S24 Ultra","Galaxy S24","Galaxy S23","Galaxy A54","Galaxy A34","Galaxy A14","Note 20","Other Samsung model"],
  "Apple (iPhone)": ["iPhone 16 Pro Max","iPhone 16 Pro","iPhone 16","iPhone 15 Pro Max","iPhone 15 Pro","iPhone 15","iPhone 14 Pro Max","iPhone 14","iPhone 13 Pro","iPhone 13","iPhone 12 Pro Max","iPhone 12","iPhone 11","Other iPhone model"],
  "Google Pixel": ["Pixel 9 Pro","Pixel 9","Pixel 8 Pro","Pixel 8","Pixel 7","Pixel 6","Other Pixel model"],
  "Infinix": ["Note 30","Zero 30","Hot 40","Smart 8","Other Infinix model"],
  "Tecno": ["Camon 20","Phantom X2","Spark 10","Pova 5","Other Tecno model"],
  "Huawei": ["P50","Nova 11","Y70","Other Huawei model"],
  "Itel": ["A70","S23","Other Itel model"],
  "Oppo": ["Reno 11","A78","Find X6","Other Oppo model"],
  "Xiaomi": ["Redmi Note 13","Poco X6","13T","Other Xiaomi model"],
};
export const BRAND_ORDER = ["Samsung","Apple (iPhone)","Google Pixel","Infinix","Tecno","Huawei","Itel","Oppo","Xiaomi"];

export const SERVICES = [
  {id:"screen", name:"Screen Replacement", type:"fixed" as const, price:15000},
  {id:"battery", name:"Battery Replacement", type:"fixed" as const, price:8000},
  {id:"port", name:"Charging Port Repair", type:"fixed" as const, price:6000},
  {id:"backglass", name:"Back Glass Replacement", type:"fixed" as const, price:10000},
  {id:"camera", name:"Camera Repair", type:"fixed" as const, price:12000},
  {id:"water", name:"Water Damage Treatment", type:"adjustable" as const, price:null},
  {id:"diagnostics", name:"Diagnostics Only", type:"adjustable" as const, price:null},
  {id:"motherboard", name:"Motherboard Repair", type:"adjustable" as const, price:null},
  {id:"other", name:"Other (describe below)", type:"adjustable" as const, price:null},
];
export const SERVICE_ETA_DAYS: Record<string,number> = {screen:1,battery:1,port:1,backglass:1,camera:2,water:4,diagnostics:1,motherboard:3,other:2};

export const STAFF_SEED = [
  {name:"MuhaAlifa", role:"Admin" as const, email:"admin@muhaalifa.app", tickets:0},
  {name:"Bello Sani", role:"Technician" as const, email:"bello@muhaalifa.app", tickets:14},
  {name:"Grace Okon", role:"Technician" as const, email:"grace@muhaalifa.app", tickets:9},
  {name:"Fatima Sule", role:"Front Desk" as const, email:"fatima@muhaalifa.app", tickets:5},
];

export type Ticket = {
  id:string;
  brand:string; model:string; color:string; imei:string;
  custName:string; custPhone:string; issue:string; photo:string|null;
  service:string; amount:number; paid:number;
  received:string; expected:string;
  status: Status; tech:string;
};

export type Settings = {
  shopName:string; address:string; phone:string; accent:string; footer:string; logo:string|null;
  branches: string[];
};

export function genId(){
  const c="ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s="MA-"; for(let i=0;i<5;i++) s+=c[Math.floor(Math.random()*c.length)];
  return s;
}
export function fmtNaira(n:number){ return "₦"+Number(n||0).toLocaleString("en-NG"); }
export function fmtDate(d:string){ return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); }
