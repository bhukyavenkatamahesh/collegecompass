import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { hasPlaceholderRazorpayKeys } from '@/lib/report-access'

export async function POST(req: NextRequest) {
  try {
    const { examType } = await req.json()
    
    const amount = examType === 'GATE' 
      ? parseInt(process.env.GATE_PRICE || '4900')
      : parseInt(process.env.JEE_PRICE || '4900')

    if (hasPlaceholderRazorpayKeys()) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 })
      }
      return NextResponse.json({
        orderId: `order_mock_${Date.now()}`,
        amount,
        currency: 'INR',
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        mock: true,
      })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
