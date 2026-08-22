import { describe, expect, it } from 'vitest'
import { createDemoInventory, issuePart } from './inventory'

describe('inventory transactions', () => {
  it('issues stock to a work order atomically and records cost in cents', () => {
    const state = createDemoInventory()
    const next = issuePart(state, {
      partId: 'PART-HF320',
      workOrderId: 'WO-24088',
      quantity: 2,
      actorId: 'user-mpatel',
      idempotencyKey: 'issue-24088-hf320',
    })

    expect(next.balances['PART-HF320']).toBe(4)
    expect(next.transactions.at(-1)).toMatchObject({ quantity: -2, unitCostCents: 4860 })
    expect(next.workOrderCostsCents['WO-24088']).toBe(9720)
    expect(next.auditEvents).toHaveLength(1)
  })

  it('rejects issuing more stock than is on hand', () => {
    const state = createDemoInventory()
    expect(() => issuePart(state, {
      partId: 'PART-HF320', workOrderId: 'WO-24088', quantity: 7,
      actorId: 'user-mpatel', idempotencyKey: 'too-many',
    })).toThrow('Insufficient stock')
  })

  it('makes retried issues idempotent', () => {
    const state = createDemoInventory()
    const command = { partId: 'PART-HF320', workOrderId: 'WO-24088', quantity: 2, actorId: 'user-mpatel', idempotencyKey: 'same-request' }
    const once = issuePart(state, command)
    const twice = issuePart(once, command)
    expect(twice).toEqual(once)
  })
})
