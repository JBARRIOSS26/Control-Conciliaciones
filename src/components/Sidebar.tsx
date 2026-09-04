import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  Package, 
  ShieldCheck, 
  X
} from 'lucide-react';
import { ActiveTab } from '../types';
import { BRAND_LOGO_URL } from '../data/mockData';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingAuditsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  pendingAuditsCount = 5,
}) => {
  const navItems = [
    {
      id: 'dashboard-general' as ActiveTab,
      label: 'Dashboard General',
      icon: LayoutDashboard,
    },
    {
      id: 'clientes-y-consignaciones' as ActiveTab,
      label: 'Clientes y Consignaciones',
      icon: Users,
      badge: pendingAuditsCount > 0 ? `${pendingAuditsCount} alertas` : undefined,
      badgeColor: 'bg-[#ffdad6] text-[#ba1a1a]',
    },
    {
      id: 'registro-de-movimientos' as ActiveTab,
      label: 'Registro de Movimientos',
      icon: ArrowLeftRight,
    },
    {
      id: 'reportes-y-cortes' as ActiveTab,
      label: 'Reportes y Cortes',
      icon: FileSpreadsheet,
    },
    {
      id: 'catalogo-de-productos' as ActiveTab,
      label: 'Catálogo de Productos',
      icon: Package,
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
            <div className="flex items-center gap-3">
              <img
                src={BRAND_LOGO_URL}
                alt="ConsignLedger Brand Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  // Fallback if network blocked
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-semibold text-base text-[#0b1c30] tracking-tight leading-tight">
                  ConsignLedger
                </span>
                <span className="text-[10px] font-semibold text-[#45464d] uppercase tracking-wider">
                  CONTROL CONCILIACIÓN
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              id="close-mobile-sidebar-btn"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]"
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
                Periodo Activo
              </span>
              <span className="font-semibold text-[#0b1c30]">Octubre 2024</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 px-3 mt-1" aria-label="Navegación principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0051d5] text-white shadow-xs font-semibold'
                      : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-[#45464d]'}`} />
                    <span>{item.label}</span>
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

        {/* Bottom Health / Audit Status */}
        <div className="p-4 border-t border-[#f1f5f9]">
          <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0051d5]" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#0b1c30]">Conciliación al día</span>
                <span className="text-[10px] text-[#45464d]">Auditoría semana 42</span>
              </div>
            </div>
            <span className="text-sm font-bold text-[#0051d5]">98.4%</span>
          </div>
        </div>
      </aside>
    </>
  );
};
