export type AuditStatus = 'al_dia' | 'corte_requerido' | 'pendiente_revision';

export interface ConsignmentItem {
  sku: string;
  productName: string;
  delivered: number;
  sold: number;
  remaining: number;
  unitPrice: number;
  physicalCount?: number;
}

export interface Client {
  id: string;
  initials: string;
  name: string;
  branch: string;
  contract: string;
  type: string; // 'Boutique' | 'Mayorista' | 'Retail' | 'Punto de Venta' | 'Isla Comercial'
  phone: string;
  email: string;
  contactPerson: string;
  creditLimit: number;
  lastMovementDate: string;
  totalDelivered: number;
  salesReconciled: number;
  remainingBalance: number;
  daysWithoutCut: number;
  auditStatus: AuditStatus;
  items: ConsignmentItem[];
}

export type MovementType = 'entrega' | 'venta_cierre' | 'devolucion_merma' | 'ajuste_auditoria';

export interface Movement {
  id: string;
  code: string;
  type: MovementType;
  clientId: string;
  clientName: string;
  productName: string;
  sku: string;
  quantity: number;
  amount?: number;
  date: string;
  timestamp: string;
  notes?: string;
  referenceDoc?: string;
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  consignPrice: number;
  centralStock: number;
  consignedStock: number;
  inTransitStock: number;
  minAlert: number;
}

export interface ReconciliationCut {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  period: string;
  date: string;
  totalDelivered: number;
  totalReportedSales: number;
  expectedRemaining: number;
  physicalCounted: number;
  discrepancy: number;
  amountToPay: number;
  status: 'balanceado' | 'con_diferencia' | 'pendiente_pago' | 'liquidado';
  auditor: string;
  notes?: string;
}

export type ActiveTab = 
  | 'dashboard-general' 
  | 'clientes-y-consignaciones' 
  | 'registro-de-movimientos' 
  | 'reportes-y-cortes' 
  | 'catalogo-de-productos';
