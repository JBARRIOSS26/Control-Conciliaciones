import { UserRole } from '../types';

export interface UserPermissions {
  canAccessCompanySettings: boolean;
  canManageUsers: boolean;
  canResetDatabase: boolean;
  canCreateProduct: boolean;
  canEditProduct: boolean;
  canImportExcel: boolean;
  canCreateClient: boolean;
  canDispatchConsignment: boolean;
  canReturnToCentral: boolean;
  canEmitRemissionSale: boolean;
  canReconcileAudit: boolean;
  canViewReports: boolean;
  roleBadgeText: string;
  roleColorClass: string;
  roleDescription: string;
}

export function getRolePermissions(role?: UserRole): UserPermissions {
  switch (role) {
    case 'admin':
      return {
        canAccessCompanySettings: true,
        canManageUsers: true,
        canResetDatabase: true,
        canCreateProduct: true,
        canEditProduct: true,
        canImportExcel: true,
        canCreateClient: true,
        canDispatchConsignment: true,
        canReturnToCentral: true,
        canEmitRemissionSale: true,
        canReconcileAudit: true,
        canViewReports: true,
        roleBadgeText: 'ADMINISTRADOR GENERAL',
        roleColorClass: 'bg-[#eff4ff] text-[#0051d5] border-[#dce9ff]',
        roleDescription: 'Acceso Total y Configuración Maestra del Sistema',
      };

    case 'almacen':
      return {
        canAccessCompanySettings: false,
        canManageUsers: false,
        canResetDatabase: false,
        canCreateProduct: true,
        canEditProduct: true,
        canImportExcel: true,
        canCreateClient: false,
        canDispatchConsignment: true,
        canReturnToCentral: true,
        canEmitRemissionSale: false,
        canReconcileAudit: true,
        canViewReports: true,
        roleBadgeText: 'JEFE DE ALMACÉN CENTRAL',
        roleColorClass: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]',
        roleDescription: 'Gestión de Stock Físico, Despachos (2.B) y Retornos (2.C)',
      };

    case 'facturacion':
      return {
        canAccessCompanySettings: false,
        canManageUsers: false,
        canResetDatabase: false,
        canCreateProduct: false,
        canEditProduct: false,
        canImportExcel: false,
        canCreateClient: false,
        canDispatchConsignment: false,
        canReturnToCentral: false,
        canEmitRemissionSale: true,
        canReconcileAudit: true,
        canViewReports: true,
        roleBadgeText: 'CONTROL Y FACTURACIÓN',
        roleColorClass: 'bg-[#fff8e1] text-[#b45309] border-[#fde68a]',
        roleDescription: 'Legalización Comercial, Notas de Remisión (2.D) y Cartera',
      };

    default:
      return {
        canAccessCompanySettings: false,
        canManageUsers: false,
        canResetDatabase: false,
        canCreateProduct: false,
        canEditProduct: false,
        canImportExcel: false,
        canCreateClient: false,
        canDispatchConsignment: false,
        canReturnToCentral: false,
        canEmitRemissionSale: false,
        canReconcileAudit: false,
        canViewReports: true,
        roleBadgeText: 'CONSULTOR',
        roleColorClass: 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]',
        roleDescription: 'Solo Consulta de Información',
      };
  }
}
