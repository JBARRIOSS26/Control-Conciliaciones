import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Plus, 
  User, 
  Menu,
  Check,
  Bell
} from 'lucide-react';
import { BRAND_LOGO_URL } from '../data/mockData';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewMovement: () => void;
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewMovement,
  selectedPeriod,
  onSelectPeriod,
}) => {
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

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
          className="lg:hidden p-2 rounded-lg text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand identity on Header */}
        <div className="flex items-center gap-2">
          <img
            src={BRAND_LOGO_URL}
            alt="ConsignLedger"
            className="h-7 w-auto object-contain hidden sm:block"
          />
          <span className="font-semibold text-base text-[#0b1c30] tracking-tight hidden sm:inline">
            ConsignLedger
          </span>
        </div>

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            id="period-selector-btn"
            type="button"
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 bg-[#eff4ff] hover:bg-[#e5eeff] px-3 py-1.5 rounded-lg text-[#0b1c30] text-xs sm:text-sm font-medium transition-colors border border-[#dce9ff]"
          >
            <Calendar className="w-4 h-4 text-[#0051d5]" />
            <span className="truncate max-w-[150px] sm:max-w-none">{selectedPeriod}</span>
            <ChevronDown className="w-4 h-4 text-[#45464d]" />
          </button>

          {showPeriodDropdown && (
            <div 
              id="period-dropdown-menu"
              className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-[#e5eeff] py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
            >
              <div className="px-3 py-1 text-[11px] font-semibold text-[#45464d] uppercase tracking-wider border-b border-[#f1f5f9]">
                Seleccionar Periodo de Corte
              </div>
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    onSelectPeriod(p);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
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
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick notification indicator */}
        <div className="relative hidden md:flex items-center justify-center p-2 rounded-lg text-[#45464d] hover:bg-[#eff4ff] cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
        </div>

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

        {/* User Card */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#e5eeff]">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-semibold text-[#0b1c30] leading-tight">Carlos Mendoza</span>
            <span className="text-[11px] text-[#45464d]">Auditor / Operador</span>
          </div>
          <div 
            id="user-avatar-badge"
            className="w-8 h-8 rounded-full bg-[#0b1c30] flex items-center justify-center text-white ring-2 ring-[#e5eeff]"
            title="Carlos Mendoza - Auditor / Operador"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
