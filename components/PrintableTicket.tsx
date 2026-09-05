"use client";
import { Ticket, fmtDate, fmtNaira } from "@/lib/constants";
import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export function PrintableTicket({ ticket, shop, id }: { ticket: Ticket; shop: any; id?: string }){
  const domId = id || `printable-${ticket.id}`;
  return (
    <div id={domId} className="w-[320px] mx-auto bg-white border border-dashed border-[#E3E8F1] rounded-xl p-5">
      <div className="text-center mb-3.5 pb-3.5 border-b-2 border-dashed border-[#E3E8F1]">
        <b className="font-['Space_Grotesk'] text-[16px] block">{shop.shopName}</b>
        <span className="text-[10.5px] text-[#66708A] block">{shop.address}</span>
        <span className="text-[10.5px] text-[#66708A] block">{shop.phone}</span>
      </div>
      <div className="text-center mb-3.5">
        <div className="text-[10px] uppercase text-[#66708A] tracking-[.05em]">Ticket ID</div>
        <div className="font-mono font-bold text-[22px] text-[#171D8D]">{ticket.id}</div>
      </div>
      <div className="w-[104px] h-[104px] mx-auto mb-3.5 bg-white flex items-center justify-center">
        <QRCodeSVG value={`https://muhaalifa.vercel.app/track?q=${ticket.id}`} size={104} level="M" />
      </div>
      {[
        ["Customer", ticket.custName||"Walk-in"],
        ["Device", `${ticket.brand.replace(" (iPhone)","")} ${ticket.model}`],
        ["Colour", ticket.color||"—"],
        ["IMEI", ticket.imei||"—"],
        ["Issue", ticket.issue||"—"],
        ["Received", fmtDate(ticket.received)],
        ["Expected collection", fmtDate(ticket.expected)],
        ["Amount", fmtNaira(ticket.amount)],
        ["Paid / Balance", `${fmtNaira(ticket.paid)} / ${fmtNaira(ticket.amount-ticket.paid)}`],
        ["Technician", ticket.tech],
      ].map(([k,v])=>(
        <div key={k} className="flex justify-between text-[11.5px] py-1 border-b border-dotted border-[#E3E8F1] last:border-0"><span>{k}</span><span className="font-semibold">{v}</span></div>
      ))}
      <div className="text-[10px] text-[#98A2B8] mt-3 text-center leading-[1.5]">{shop.footer} Not liable for data loss. Uncollected devices after 30 days may incur storage fees.</div>
    </div>
  )
}
