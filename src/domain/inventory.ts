import type { AuditEvent } from './work-orders'

export type InventoryTransaction = {
  partId: string
  workOrderId: string
  quantity: number
  unitCostCents: number
  actorId: string
  idempotencyKey: string
}
export type InventoryState = {
  balances: Record<string, number>
  unitCostsCents: Record<string, number>
  workOrderCostsCents: Record<string, number>
  transactions: InventoryTransaction[]
  auditEvents: AuditEvent[]
}
export type IssuePartCommand = {
  partId: string
  workOrderId: string
  quantity: number
  actorId: string
  idempotencyKey: string
}

export function createDemoInventory(): InventoryState {
  return {
    balances: { 'PART-HF320': 6 },
    unitCostsCents: { 'PART-HF320': 4860 },
    workOrderCostsCents: { 'WO-24088': 0 },
    transactions: [],
    auditEvents: [],
  }
}

export function issuePart(state: InventoryState, command: IssuePartCommand): InventoryState {
  if (state.transactions.some(item => item.idempotencyKey === command.idempotencyKey)) return state
  if (!Number.isInteger(command.quantity) || command.quantity <= 0) throw new Error('Quantity must be a positive integer')
  const balance = state.balances[command.partId]
  const unitCostCents = state.unitCostsCents[command.partId]
  if (balance === undefined || unitCostCents === undefined) throw new Error('Part not found')
  if (balance < command.quantity) throw new Error('Insufficient stock')

  const costCents = unitCostCents * command.quantity
  const nextBalance = balance - command.quantity
  return {
    ...state,
    balances: { ...state.balances, [command.partId]: nextBalance },
    workOrderCostsCents: { ...state.workOrderCostsCents, [command.workOrderId]: (state.workOrderCostsCents[command.workOrderId] ?? 0) + costCents },
    transactions: [...state.transactions, { ...command, quantity: -command.quantity, unitCostCents }],
    auditEvents: [...state.auditEvents, {
      entityId: command.partId,
      action: 'inventory.part_issued',
      actorId: command.actorId,
      before: { quantityOnHand: balance },
      after: { quantityOnHand: nextBalance, workOrderId: command.workOrderId, costCents },
      occurredAt: new Date().toISOString(),
    }],
  }
}
