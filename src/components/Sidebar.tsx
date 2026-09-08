import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  BarChart3, 
  Warehouse, 
  ShieldCheck, 
  X,
  LogOut,
  User as UserIcon,
  Building2
} from 'lucide-react';
import { ActiveTab, User, CompanySettings } from '../types';
import { BRAND_LOGO_URL } from '../data/mockData';
import { getRolePermissions } from '../utils/permissions';
import { Users as UsersIcon } from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingAuditsCount?: number;
  currentUser?: User | null;
  companySettings?: CompanySettings;
  onOpenSettings?: () => void;
  onOpenUsers?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  pendingAuditsCount = 5,
  currentUser,
  companySettings,
  onOpenSettings,
  onOpenUsers,
  onLogout,
}) => {
  const permissions = getRolePermissions(currentUser?.role);
  const navItems = [
    {
      id: 'dashboard-general' as ActiveTab,
      label: 'Dashboard General',
      icon: LayoutDashboard,
    },
    {
      id: 'almacen-central-y-catalogo' as ActiveTab,
      label: 'Almacén Central & Catálogo',
      icon: Warehouse,
    },
    {
      id: 'clientes-y-consignaciones' as ActiveTab,
      label: 'Clientes & Sub-almacenes',
      icon: Users,
      badge: pendingAuditsCount > 0 ? `${pendingAuditsCount} alertas` : undefined,
      badgeColor: 'bg-[#ffdad6] text-[#ba1a1a]',
    },
    {
      id: 'registro-de-movimientos' as ActiveTab,
      label: 'Kardex & Vales Físicos',
      icon: ArrowLeftRight,
    },
    {
      id: 'reportes-estadisticos' as ActiveTab,
      label: 'Reportes Estadísticos',
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={companySettings?.logoUrl || BRAND_LOGO_URL}
                alt={companySettings?.companyName || "Logo"}
                className="h-8 w-auto max-w-[90px] object-contain shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BRAND_LOGO_URL;
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm sm:text-base text-[#0b1c30] tracking-tight leading-tight truncate">
                  {companySettings?.companyName || 'ConsignLedger'}
                </span>
                <span className="text-[10px] font-semibold text-[#0051d5] uppercase tracking-wider">
                  CONTROL CONSIGNACIÓN
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              id="close-mobile-sidebar-btn"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] cursor-pointer shrink-0"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Period Status Pill */}
          <div className="px-4 py-3">
            <div className="px-3 py-2 rounded-lg bg-[#eff4ff] text-[#45464d] text-xs flex items-center justify-between border border-[#dce9ff]/60">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0051d5] animate-pulse"></span>
                Almacén Origen
              </span>
              <span className="font-semibold text-[#0b1c30] text-[11px] truncate max-w-[100px]">
                Bodega Matriz
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 px-3 mt-1" aria-label="Navegación principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'almacen-central-y-catalogo' && activeTab === 'catalogo-de-productos') ||
                (item.id === 'reportes-estadisticos' && activeTab === 'reportes-y-cortes');

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0051d5] text-white shadow-xs font-semibold'
                      : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-[#45464d]'}`} />
                    <span className="text-xs sm:text-sm">{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Company Settings & Logout */}
        <div className="p-3 border-t border-[#f1f5f9] space-y-2">
          {permissions.canAccessCompanySettings && onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full px-3 py-2 rounded-xl bg-white hover:bg-[#eff4ff] border border-[#dce9ff] text-xs font-semibold text-[#0b1c30] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Building2 className="w-4 h-4 text-[#0051d5]" />
              <span>Ajustes de Empresa & Logo</span>
            </button>
          )}

          {permissions.canManageUsers && onOpenUsers && (
            <button
              type="button"
              onClick={onOpenUsers}
              className="w-full px-3 py-2 rounded-xl bg-white hover:bg-[#eff4ff] border border-[#dce9ff] text-xs font-semibold text-[#0b1c30] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <UsersIcon className="w-4 h-4 text-[#0051d5]" />
              <span>Gestión de Usuarios</span>
            </button>
          )}

          {currentUser && (
            <div className="p-2.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#0b1c30] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#0b1c30] truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[#45464d] truncate">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Cerrar Sesión"
                    className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#fff1f0] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Role Scope Badge */}
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center justify-between ${permissions.roleColorClass}`}>
                <span className="truncate">{permissions.roleBadgeText}</span>
              </div>
            </div>
          )}

          <div className="px-2 text-[10px] text-[#76777d] flex items-center justify-between">
            <span className="truncate">BD Conectada (SQLite/Cloud)</span>
            <span className="font-mono text-[#069669] font-bold">ACTIVA</span>
          </div>
        </div>
      </aside>
    </>
  );
};
