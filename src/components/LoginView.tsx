import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Warehouse, 
  Receipt, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { BRAND_LOGO_URL } from '../data/mockData';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentialsHint, setShowCredentialsHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingrese su correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.login(email.trim(), password.trim());
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setErrorMessage('Credenciales inválidas. Verifique su correo o contraseña.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Credenciales inválidas. Verifique su correo o contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070d18] text-[#e5eeff] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0051d5]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#069669]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#316bf3]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden relative z-10">
        {/* Left Side: System Value Proposition & Branding */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-linear-to-b from-white/[0.05] to-transparent border-b lg:border-b-0 lg:border-r border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img
                src={BRAND_LOGO_URL}
                alt="ConsignLedger"
                className="h-10 w-auto object-contain brightness-110"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div>
                <span className="font-bold text-xl text-white tracking-tight block">
                  ConsignLedger
                </span>
                <span className="text-[10px] font-semibold text-[#82aaff] uppercase tracking-widest block">
                  SISTEMA DE CONTROL DE INVENTARIOS
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#316bf3]/15 border border-[#316bf3]/30 text-[#82aaff] text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#85f8c4]" />
              <span>Gestión Integral en Consignación</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-4">
              Trazabilidad total entre Almacén Central y Clientes.
            </h2>

            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed mb-6">
              Plataforma diseñada para cumplir con el ciclo completo de inventarios en consignación: ingreso por Excel/manual, vales de entrega físicos obligatorios, retorno documentado y bajas automáticas mediante Notas de Remisión canalizadas a Facturación.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <Warehouse className="w-4 h-4 text-[#82aaff] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">Almacén Central (Origen)</span>
                  <span className="text-[11px] text-[#94a3b8]">Carga manual 1 a 1 e importación masiva por Excel / CSV.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <ShieldCheck className="w-4 h-4 text-[#85f8c4] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">Vales Físicos Obligatorios</span>
                  <span className="text-[11px] text-[#94a3b8]">Entrega y Devolución con soportes oficiales firmados.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <Receipt className="w-4 h-4 text-[#fbbf24] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">Notas de Remisión a Facturación</span>
                  <span className="text-[11px] text-[#94a3b8]">Legalización de ventas con baja definitiva automática.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#64748b]">
            <span>ConsignLedger Enterprise</span>
            <span className="flex items-center gap-1.5 text-[#85f8c4]">
              <span className="w-2 h-2 rounded-full bg-[#069669] animate-pulse" />
              Base de Datos Activa
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-black/20">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Iniciar Sesión
              </h3>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
                Ingrese sus credenciales de acceso para entrar al sistema de control.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#ba1a1a]/20 border border-[#ba1a1a]/40 text-[#ffdad6] text-xs flex items-center gap-2.5 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a] shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#64748b]" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@consignledger.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748b] focus:border-[#316bf3] focus:bg-white/[0.08] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#64748b]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#64748b] focus:border-[#316bf3] focus:bg-white/[0.08] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#64748b] hover:text-white p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#0051d5] to-[#316bf3] hover:from-[#0041ab] hover:to-[#2558d4] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#0051d5]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Acceder al Sistema</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Informative Credentials Helper (Read-only, secure, no 1-click bypass) */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCredentialsHint(!showCredentialsHint)}
                className="w-full text-left flex items-center justify-between text-xs text-[#82aaff] hover:text-white transition-colors cursor-pointer py-1"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5" />
                  Cuentas y roles registrados inicialmente
                </span>
                {showCredentialsHint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCredentialsHint && (
                <div className="mt-2 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] space-y-2 text-[#cbd5e1] animate-in fade-in">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <div>
                      <span className="font-semibold text-white block">Administrador General</span>
                      <span className="text-[#82aaff] font-mono text-[10px]">admin@consignledger.com</span>
                    </div>
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white text-[10px]">admin123</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <div>
                      <span className="font-semibold text-white block">Almacén Central (Logística)</span>
                      <span className="text-[#82aaff] font-mono text-[10px]">almacen@consignledger.com</span>
                    </div>
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white text-[10px]">almacen123</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <span className="font-semibold text-white block">Control y Facturación</span>
                      <span className="text-[#82aaff] font-mono text-[10px]">facturacion@consignledger.com</span>
                    </div>
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white text-[10px]">facturacion123</span>
                  </div>

                  <div className="text-[10px] text-[#94a3b8] italic pt-1">
                    * El administrador puede crear más cuentas, cambiar contraseñas o gestionar usuarios desde el sistema.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

