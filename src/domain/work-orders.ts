export type WorkOrderStatus = 'Open' | 'In progress' | 'Waiting parts' | 'Completed'
export type WorkOrder = {
  id: string
  status: WorkOrderStatus
  requiredTasks: { id: string; complete: boolean }[]
}
export type AuditEvent = {
  entityId: string
  action: string
  actorId: string
  before: Record<string, unknown>
  after: Record<string, unknown>
  occurredAt: string
}
export type OperationsState = { workOrders: WorkOrder[]; auditEvents: AuditEvent[] }
export type WorkOrderCommand = 'START' | 'COMPLETE'

export function createDemoOperations(): OperationsState {
  return {
    workOrders: [
      { id: 'WO-24091', status: 'In progress', requiredTasks: [{ id: 'brake-repair', complete: false }] },
      { id: 'WO-24082', status: 'Open', requiredTasks: [{ id: 'safety-inspection', complete: true }] },
    ],
    auditEvents: [],
  }
}

export function transitionWorkOrder(state: OperationsState, workOrderId: string, command: WorkOrderCommand, actorId: string): OperationsState {
  const order = state.workOrders.find(item => item.id === workOrderId)
  if (!order) throw new Error('Work order not found')
  if (command === 'START' && order.status !== 'Open') throw new Error('Only open work orders can be started')
  if (command === 'COMPLETE' && order.requiredTasks.some(task => !task.complete)) throw new Error('Required tasks must be complete')

  const nextStatus: WorkOrderStatus = command === 'START' ? 'In progress' : 'Completed'
  const action = command === 'START' ? 'work_order.started' : 'work_order.completed'
  return {
    workOrders: state.workOrders.map(item => item.id === workOrderId ? { ...item, status: nextStatus } : { ...item, requiredTasks: item.requiredTasks.map(task => ({ ...task })) }),
    auditEvents: [...state.auditEvents, {
      entityId: workOrderId,
      action,
      actorId,
      before: { status: order.status },
      after: { status: nextStatus },
      occurredAt: new Date().toISOString(),
    }],
  }
}
