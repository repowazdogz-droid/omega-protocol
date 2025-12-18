import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    app: 'omega-5-mode',
    repo: 'Omega',
    port: process.env.PORT || '4317',
    route: '/five-mode/ui',
    buildStamp: new Date().toISOString(),
  })
}




