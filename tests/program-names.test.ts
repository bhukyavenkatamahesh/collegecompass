import { describe, it, expect } from 'vitest'
import { expandProgramName } from '@/lib/program-names'
import { resolveInstituteState } from '@/lib/institute-state'

describe('expandProgramName', () => {
  it('expands COAP codes to full names', () => {
    expect(expandProgramName('MCS')).toBe('Computer Science & Engineering')
    expect(expandProgramName('AMA')).toBe('Applied Mathematics')
    expect(expandProgramName('EEP')).toBe('Electrical — Power Systems')
    expect(expandProgramName('JTM')).toBe('Telecom Technology & Management')
    expect(expandProgramName('CHE')).toBe('Chemical Engineering')
    expect(expandProgramName('MEE')).toBe('Mechanical — Energy Studies')
  })

  it('strips trailing N/Y/digit suffixes', () => {
    expect(expandProgramName('CS1Y')).toBe('Computer Science & Engineering')
    expect(expandProgramName('ME2N')).toBe('Mechanical Engineering')
    expect(expandProgramName('EE3Y')).toBe('Electrical Engineering')
    expect(expandProgramName('DA1N')).toBe('Data Science & AI')
    expect(expandProgramName('CE4Y')).toBe('Civil Engineering')
  })

  it('strips trailing asterisk', () => {
    expect(expandProgramName('MA1Y*')).toBe('Mathematics')
    expect(expandProgramName('ME1N*')).toBe('Mechanical Engineering')
  })

  it('returns full names as-is', () => {
    expect(expandProgramName('Computer Science and Engineering')).toBe(
      'Computer Science and Engineering'
    )
    expect(expandProgramName('Artificial Intelligence')).toBe('Artificial Intelligence')
  })

  it('returns unknown codes as-is', () => {
    expect(expandProgramName('XYZ')).toBe('XYZ')
    expect(expandProgramName('UNKNOWN99')).toBe('UNKNOWN99')
  })

  it('handles empty/null input', () => {
    expect(expandProgramName('')).toBe('')
  })
})

describe('resolveInstituteState', () => {
  it('resolves IIT states', () => {
    expect(resolveInstituteState('IIT Delhi')).toBe('Delhi')
    expect(resolveInstituteState('IIT Hyderabad')).toBe('Telangana')
    expect(resolveInstituteState('IIT Madras')).toBe('Tamil Nadu')
    expect(resolveInstituteState('IISc Bangalore')).toBe('Karnataka')
    expect(resolveInstituteState('IIT Kharagpur')).toBe('West Bengal')
  })

  it('resolves NIT states', () => {
    expect(resolveInstituteState('National Institute of Technology, Tiruchirappalli')).toBe(
      'Tamil Nadu'
    )
    expect(resolveInstituteState('National Institute of Technology, Warangal')).toBe('Telangana')
    expect(resolveInstituteState('National Institute of Technology, Silchar')).toBe('Assam')
  })

  it('resolves IIIT states by city name', () => {
    expect(resolveInstituteState('Indian Institute of Information Technology, Allahabad')).toBe(
      'Uttar Pradesh'
    )
    expect(resolveInstituteState('Indian Institute of Information Technology, Lucknow')).toBe(
      'Uttar Pradesh'
    )
    expect(resolveInstituteState('Indian Institute of Information Technology, Pune')).toBe(
      'Maharashtra'
    )
  })

  it('returns empty for unknown institutes', () => {
    expect(resolveInstituteState('Unknown University')).toBe('')
    expect(resolveInstituteState('')).toBe('')
  })
})
