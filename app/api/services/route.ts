import { NextResponse } from "next/server";
import { SERVICES, SERVICE_ETA_DAYS } from "@/lib/constants";
export async function GET(){
  return NextResponse.json({services: SERVICES, eta: SERVICE_ETA_DAYS});
}
