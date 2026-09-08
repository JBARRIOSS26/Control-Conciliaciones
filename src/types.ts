export type AuditStatus = 'al_dia' | 'corte_requerido' | 'pendiente_revision';

export interface ConsignmentItem {
  sku: string;
  productName: string;
  delivered: number;
  sold: number;
  remaining: number;
  returned?: number;
  unitPrice: number;
  physicalCount?: number;
  consignmentDays?: number; // Días promedio bajo resguardo del cliente
}

export interface Client {
  id: string;
  initials: string;
  name: string;
  branch: string;
  contract: string;
  virtualWarehouseCode: string; // ej. 'ALM-VIR-001'
  virtualWarehouseName: string; // ej. 'Sub-almacén Virtual Boutique La Condesa'
  type: string; // 'Boutique' | 'Mayorista' | 'Retail' | 'Punto de Venta' | 'Isla Comercial'
  phone: string;
  email: string;
  contactPerson: string;
  creditLimit: number;
  lastMovementDate: string;
  totalDelivered: number;
  salesReconciled: number;
  totalReturned: number;
  remainingBalance: number;
  daysWithoutCut: number;
  auditStatus: AuditStatus;
  items: ConsignmentItem[];
  avgConsignmentDays?: number; // Antigüedad media de mercancía en el cliente
}

export type MovementType = 
  | 'entrega' 
  | 'devolucion' 
  | 'venta_remision' 
  | 'venta_cierre' 
  | 'devolucion_merma' 
  | 'ajuste_auditoria';

export interface Movement {
  id: string;
  code: string;
  type: MovementType;
  clientId: string;
  clientName: string;
  productName: string;
  sku: string;
  quantity: number; // Positivo para traslados hacia cliente, negativo para bajas o devoluciones
  amount?: number;
  date: string;
  timestamp: string;
  notes?: string;
  referenceDoc?: string;
  sourceWarehouse?: string;
  targetWarehouse?: string;
  billingStatus?: 'pendiente' | 'canalizada_facturacion' | 'facturada' | 'no_aplica';
  reason?: string;
}

export interface ProductProperties {
  color?: string;
  size?: string;
  material?: string;
  barcode?: string;
}

export interface Product {
  sku: string;
  name: string;
  description?: string;
  category: string;
  unitCost: number;
  consignPrice: number;
  centralStock: number;
  consignedStock: number;
  inTransitStock: number;
  minAlert: number;
  entryDate?: string; // Fecha de ingreso al Almacén Central
  centralAgeDays?: number; // Tiempo de permanencia en Almacén Central (días)
  properties?: ProductProperties;
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

export type UserRole = 'admin' | 'almacen' | 'facturacion' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar?: string;
}

export interface PhysicalVoucherData {
  voucherType: 'entrega' | 'devolucion' | 'remision';
  title: string;
  folio: string;
  date: string;
  clientName: string;
  clientId: string;
  branch: string;
  virtualWarehouseCode: string;
  virtualWarehouseName: string;
  items: Array<{
    sku: string;
    productName: string;
    quantity: number;
    unitPrice?: number;
    totalAmount?: number;
    notes?: string;
  }>;
  totalUnits: number;
  totalAmount?: number;
  notes?: string;
  deliveredBy: string;
  receivedBy: string;
  authorizedBy?: string;
  billingChannelInfo?: string;
  companySettings?: CompanySettings;
}

export interface CompanySettings {
  companyName: string;
  rfc: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  legalTermsDelivery: string;
  legalTermsReturn: string;
  legalTermsRemission: string;
  updatedAt?: string;
}

export type ActiveTab = 
  | 'dashboard-general' 
  | 'almacen-central-y-catalogo'
  | 'clientes-y-consignaciones' 
  | 'registro-de-movimientos' 
  | 'reportes-estadisticos'
  | 'catalogo-de-productos'
  | 'reportes-y-cortes';
