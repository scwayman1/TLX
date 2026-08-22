import { describe, expect, it } from 'vitest'
import { createDemoOperations, transitionWorkOrder } from './work-orders'

describe('work-order lifecycle', () => {
  it('starts an open work order and records an audit event', () => {
    const state = createDemoOperations()
    const next = transitionWorkOrder(state, 'WO-24082', 'START', 'user-jross')

    expect(next.workOrders.find(order => order.id === 'WO-24082')?.status).toBe('In progress')
    expect(next.auditEvents.at(-1)).toMatchObject({
      entityId: 'WO-24082',
      action: 'work_order.started',
      actorId: 'user-jross',
      before: { status: 'Open' },
      after: { status: 'In progress' },
    })
  })

  it('rejects completing a work order with incomplete required tasks', () => {
    const state = createDemoOperations()
    expect(() => transitionWorkOrder(state, 'WO-24091', 'COMPLETE', 'user-dfoster'))
      .toThrow('Required tasks must be complete')
  })

  it('does not mutate the prior operating state', () => {
    const state = createDemoOperations()
    transitionWorkOrder(state, 'WO-24082', 'START', 'user-jross')
    expect(state.workOrders.find(order => order.id === 'WO-24082')?.status).toBe('Open')
    expect(state.auditEvents).toHaveLength(0)
  })
})
