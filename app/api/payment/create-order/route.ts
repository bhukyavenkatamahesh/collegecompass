import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { examType, name, email, phone } = await req.json()

    // In production: use Razorpay SDK to create real order
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
    // const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `receipt_${Date.now()}` })
    
    const amount = examType === 'GATE' 
      ? parseInt(process.env.GATE_PRICE || '4900')
      : parseInt(process.env.JEE_PRICE || '4900')

    // Mock order for demo — replace with real Razorpay order
    const mockOrder = {
      id: `order_${Date.now()}`,
      amount,
      currency: 'INR',
    }

    return NextResponse.json({ 
      orderId: mockOrder.id, 
      amount: mockOrder.amount, 
      currency: mockOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
