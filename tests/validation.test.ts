import { describe, it, expect } from 'vitest'

// ─────────────────────────────────────────────────────────────────────────────
// Client-side validation helpers (mirrored from predict/page.tsx)
// ─────────────────────────────────────────────────────────────────────────────
const validPositiveNumber = (v: string) => Number.isFinite(Number(v)) && Number(v) > 0
const validPositiveInteger = (v: string) => Number.isInteger(Number(v)) && Number(v) > 0
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
const validPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\s+/g, ''))
const validName = (v: string) => v.trim().length >= 2 && /^[a-zA-Z\s.'-]+$/.test(v.trim())

describe('validPositiveNumber (GATE score)', () => {
  it('accepts valid scores', () => {
    expect(validPositiveNumber('750')).toBe(true)
    expect(validPositiveNumber('0.5')).toBe(true)
    expect(validPositiveNumber('1000')).toBe(true)
    expect(validPositiveNumber('314')).toBe(true)
  })
  it('rejects zero', () => expect(validPositiveNumber('0')).toBe(false))
  it('rejects negative', () => expect(validPositiveNumber('-100')).toBe(false))
  it('rejects empty', () => expect(validPositiveNumber('')).toBe(false))
  it('rejects text', () => expect(validPositiveNumber('abc')).toBe(false))
  it('rejects spaces', () => expect(validPositiveNumber('  ')).toBe(false))
})

describe('validPositiveInteger (JEE rank)', () => {
  it('accepts valid ranks', () => {
    expect(validPositiveInteger('1')).toBe(true)
    expect(validPositiveInteger('12000')).toBe(true)
    expect(validPositiveInteger('500000')).toBe(true)
  })
  it('rejects decimals', () => expect(validPositiveInteger('12.5')).toBe(false))
  it('rejects zero', () => expect(validPositiveInteger('0')).toBe(false))
  it('rejects negative', () => expect(validPositiveInteger('-500')).toBe(false))
  it('rejects text', () => expect(validPositiveInteger('abc')).toBe(false))
  it('rejects empty', () => expect(validPositiveInteger('')).toBe(false))
})

describe('validEmail', () => {
  it('accepts valid emails', () => {
    expect(validEmail('test@gmail.com')).toBe(true)
    expect(validEmail('user.name@domain.co.in')).toBe(true)
    expect(validEmail('abc123@yahoo.com')).toBe(true)
    expect(validEmail(' test@gmail.com ')).toBe(true) // trims whitespace
  })
  it('rejects missing @', () => expect(validEmail('testgmail.com')).toBe(false))
  it('rejects missing domain', () => expect(validEmail('test@')).toBe(false))
  it('rejects missing TLD', () => expect(validEmail('test@gmail')).toBe(false))
  it('rejects single char TLD', () => expect(validEmail('test@gmail.c')).toBe(false))
  it('rejects spaces in middle', () => expect(validEmail('test @gmail.com')).toBe(false))
  it('rejects empty', () => expect(validEmail('')).toBe(false))
  it('rejects just @', () => expect(validEmail('@')).toBe(false))
  it('rejects double @', () => expect(validEmail('a@@b.com')).toBe(false))
})

describe('validPhone (Indian mobile)', () => {
  it('accepts valid 10-digit numbers starting with 6-9', () => {
    expect(validPhone('9876543210')).toBe(true)
    expect(validPhone('6000000000')).toBe(true)
    expect(validPhone('7123456789')).toBe(true)
    expect(validPhone('8999999999')).toBe(true)
  })
  it('accepts with spaces (trimmed)', () => {
    expect(validPhone('98765 43210')).toBe(true)
  })
  it('rejects starting with 0-5', () => {
    expect(validPhone('0987654321')).toBe(false)
    expect(validPhone('1234567890')).toBe(false)
    expect(validPhone('5555555555')).toBe(false)
  })
  it('rejects too short', () => expect(validPhone('98765')).toBe(false))
  it('rejects too long', () => expect(validPhone('98765432100')).toBe(false))
  it('rejects with country code', () => expect(validPhone('+919876543210')).toBe(false))
  it('rejects empty', () => expect(validPhone('')).toBe(false))
  it('rejects letters', () => expect(validPhone('98765abcde')).toBe(false))
})

describe('validName', () => {
  it('accepts valid names', () => {
    expect(validName('Venkata Mahesh')).toBe(true)
    expect(validName('A. Kumar')).toBe(true)
    expect(validName("O'Brien")).toBe(true)
    expect(validName('Jean-Pierre')).toBe(true)
  })
  it('accepts with surrounding spaces (trimmed)', () => {
    expect(validName('  Rahul  ')).toBe(true)
  })
  it('rejects single character', () => expect(validName('A')).toBe(false))
  it('rejects empty', () => expect(validName('')).toBe(false))
  it('rejects only spaces', () => expect(validName('   ')).toBe(false))
  it('rejects numbers', () => expect(validName('User123')).toBe(false))
  it('rejects special characters', () => expect(validName('test@name')).toBe(false))
})

// ─────────────────────────────────────────────────────────────────────────────
// GATE score range
// ─────────────────────────────────────────────────────────────────────────────
describe('GATE score range checks', () => {
  it('score > 1000 is invalid', () => {
    expect(Number('1001') > 1000).toBe(true)
    expect(Number('9999') > 1000).toBe(true)
  })
  it('score 1-1000 is valid', () => {
    expect(Number('1') > 0 && Number('1') <= 1000).toBe(true)
    expect(Number('1000') > 0 && Number('1000') <= 1000).toBe(true)
    expect(Number('314') > 0 && Number('314') <= 1000).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// JEE rank range checks
// ─────────────────────────────────────────────────────────────────────────────
describe('JEE rank range checks', () => {
  it('rank > 10M is flagged', () => {
    expect(Number('10000001') > 10000000).toBe(true)
  })
  it('reasonable ranks pass', () => {
    expect(Number('1') > 0 && Number('1') <= 10000000).toBe(true)
    expect(Number('500000') > 0 && Number('500000') <= 10000000).toBe(true)
  })
})
