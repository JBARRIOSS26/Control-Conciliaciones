import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Plus, 
  User as UserIcon, 
  Menu,
  Check,
  Bell,
  LogOut,
  Warehouse,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { User, CompanySettings } from '../types';
import { BRAND_LOGO_URL } from '../data/mockData';
import { Building2, Users as UsersIcon } from 'lucide-react';
import { getRolePermissions } from '../utils/permissions';

interface HeaderProps {
  currentUser: User | null;
  companySettings?: CompanySettings;
  onOpenSettings?: () => void;
  onOpenUsers?: () => void;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
  onOpenNewMovement: () => void;
  onOpenDelivery?: () => void;
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  companySettings,
  onOpenSettings,
  onOpenUsers,
  onLogout,
  onOpenMobileMenu,
  onOpenNewMovement,
  onOpenDelivery,
  selectedPeriod,
  onSelectPeriod,
}) => {
  const permissions = getRolePermissions(currentUser?.role);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const periods = [
    'Corte Semanal: 14 - 20 Oct, 2024',
    'Corte Semanal: 07 - 13 Oct, 2024',
    'Corte Semanal: 30 Sep - 06 Oct, 2024',
    'Corte Mensual: Septiembre 2024',
  ];

  return (
    <header 
      id="app-header"
      className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 flex items-center justify-between px-4 sm:px-6"
    >
      {/* Left: Mobile hamburger & Brand/Period selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          id="toggle-mobile-menu-btn"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand identity on Header */}
        <div className="flex items-center gap-2">
          <img
            src={companySettings?.logoUrl || BRAND_LOGO_URL}
            alt={companySettings?.companyName || "ConsignLedger"}
            className="h-8 w-auto max-w-[120px] object-contain hidden sm:block"
            onError={(e) => { (e.target as HTMLImageElement).src = BRAND_LOGO_URL; }}
          />
          <span className="font-semibold text-sm sm:text-base text-[#0b1c30] tracking-tight hidden sm:inline truncate max-w-[200px]">
            {companySettings?.companyName || "ConsignLedger"}
          </span>
        </div>

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            id="period-selector-btn"
            type="button"
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 bg-[#eff4ff] hover:bg-[#e5eeff] px-3 py-1.5 rounded-lg text-[#0b1c30] text-xs sm:text-sm font-medium transition-colors border border-[#dce9ff] cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#0051d5]" />
            <span className="truncate max-w-[140px] sm:max-w-none">{selectedPeriod}</span>
            <ChevronDown className="w-4 h-4 text-[#45464d]" />
          </button>

          {showPeriodDropdown && (
            <div 
              id="period-dropdown-menu"
              className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-[#e5eeff] py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
            >
              <div className="px-3 py-1 text-[11px] font-semibold text-[#45464d] uppercase tracking-wider border-b border-[#f1f5f9]">
                Seleccionar Periodo Operativo
              </div>
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    onSelectPeriod(p);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedPeriod === p 
                      ? 'bg-[#eff4ff] text-[#0051d5] font-semibold' 
                      : 'text-[#0b1c30] hover:bg-[#f8f9ff]'
                  }`}
                >
                  <span>{p}</span>
                  {selectedPeriod === p && <Check className="w-3.5 h-3.5 text-[#0051d5]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions and User profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {permissions.canDispatchConsignment && onOpenDelivery && (
          <button
            type="button"
            onClick={onOpenDelivery}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Despacho</span>
          </button>
        )}

        {/* New Movement Primary Button */}
        <button
          id="btn-nuevo-movimiento-header"
          type="button"
          onClick={onOpenNewMovement}
          className="inline-flex items-center gap-1.5 bg-[#0b1c30] hover:bg-[#1f2937] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Movimiento</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

        {/* User Card with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#e5eeff] cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex flex-col items-end hidden sm:flex text-right">
              <span className="text-xs font-semibold text-[#0b1c30] leading-tight">
                {currentUser?.name || 'Usuario'}
              </span>
              <span className="text-[10px] font-bold text-[#0051d5]">
                {permissions.roleBadgeText}
              </span>
            </div>
            <div 
              id="user-avatar-badge"
              className="w-8 h-8 rounded-full bg-[#0b1c30] flex items-center justify-center text-white ring-2 ring-[#e5eeff]"
            >
              <UserIcon className="w-4 h-4" />
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#e5eeff] py-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-3 py-2 border-b border-[#f1f5f9]">
                <div className="font-bold text-[#0b1c30]">{currentUser?.name}</div>
                <div className="text-[11px] text-[#76777d] truncate">{currentUser?.email}</div>
                <div className="mt-1.5 flex flex-col gap-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${permissions.roleColorClass}`}>
                    {permissions.roleBadgeText}
                  </span>
                  <span className="text-[10px] text-[#45464d]">
                    {permissions.roleDescription}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {permissions.canAccessCompanySettings && onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenSettings();
                    }}
                    className="w-full px-3 py-2 text-left text-[#0b1c30] hover:bg-[#eff4ff] flex items-center gap-2 font-medium cursor-pointer transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Ajustes de Empresa & Logo</span>
                  </button>
                )}

                {permissions.canManageUsers && onOpenUsers && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenUsers();
                    }}
                    className="w-full px-3 py-2 text-left text-[#0b1c30] hover:bg-[#eff4ff] flex items-center gap-2 font-medium cursor-pointer transition-colors"
                  >
                    <UsersIcon className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Gestión de Usuarios</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 text-left text-[#ba1a1a] hover:bg-[#fff1f0] flex items-center gap-2 font-medium cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
