/**
 * Client-side service — wraps /api/predict calls.
 * All prediction API logic lives here; pages just call these functions.
 */
import type { PredictRequest, PredictApiResponse } from '@/types'

export async function fetchPredictions(body: PredictRequest): Promise<PredictApiResponse> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `API error: ${res.status}`)
  }

  return res.json()
}
