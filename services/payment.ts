/**
 * Client-side service — wraps Razorpay payment flow.
 * Pages import and call these instead of having raw fetch calls.
 */
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from '@/types'

export async function createOrder(body: CreateOrderRequest): Promise<CreateOrderResponse> {
  const res = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Failed to create order: ${res.status}`)
  }

  return res.json()
}

export async function verifyPayment(body: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  const res = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Payment verification failed: ${res.status}`)
  }

  return res.json()
}
