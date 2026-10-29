import { test, expect } from '@playwright/test'
import { getEstimatedReservationsShared } from '../src/reservationTotals'

const estimate = (date: string) => getEstimatedReservationsShared(new Date(date))

test('the October 29 baseline stays at approximately 50 and earlier dates are clamped', () => {
  expect(estimate('2026-10-29T07:00:00Z')).toBe('≈50')
  expect(estimate('2026-10-29T23:59:59-07:00')).toBe('≈50')
  expect(estimate('2026-10-28T12:00:00-07:00')).toBe('≈50')
  expect(estimate('2025-01-01T00:00:00Z')).toBe('≈50')
})

test('weekday and weekend increments start after the baseline day', () => {
  expect(estimate('2026-10-30T12:00:00-07:00')).toBe('≈52')
  expect(estimate('2026-10-31T12:00:00-07:00')).toBe('≈53')
  expect(estimate('2026-11-01T12:00:00-08:00')).toBe('≈54')
  expect(estimate('2026-11-02T12:00:00-08:00')).toBe('≈56')
})

test('the count changes at Los Angeles midnight rather than UTC midnight', () => {
  expect(estimate('2026-10-30T00:00:00Z')).toBe('≈50')
  expect(estimate('2026-10-30T06:59:59Z')).toBe('≈50')
  expect(estimate('2026-10-30T07:00:00Z')).toBe('≈52')
  expect(estimate('2026-11-02T07:59:59Z')).toBe('≈54')
  expect(estimate('2026-11-02T08:00:00Z')).toBe('≈56')
})

test('the November daylight-saving transition counts its 25-hour Sunday once', () => {
  for (const instant of ['2026-11-01T07:00:00Z', '2026-11-01T08:30:00Z', '2026-11-01T09:30:00Z', '2026-11-02T07:59:59Z']) {
    expect(estimate(instant)).toBe('≈54')
  }
})

test('complete weeks and following weekdays accumulate without elapsed-hour drift', () => {
  expect(estimate('2026-11-05T00:00:00-08:00')).toBe('≈62')
  expect(estimate('2026-11-06T00:00:00-08:00')).toBe('≈64')
  expect(estimate('2027-10-28T12:00:00-07:00')).toBe('≈674')
})
