import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Building2, 
  UploadCloud, 
  Check, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { BRAND_LOGO_URL } from '../../data/mockData';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => Promise<void>;
  onResetDatabase: (mode: 'empty' | 'demo') => Promise<void>;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDatabase,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [rfc, setRfc] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [legalTermsDelivery, setLegalTermsDelivery] = useState('');
  const [legalTermsReturn, setLegalTermsReturn] = useState('');
  const [legalTermsRemission, setLegalTermsRemission] = useState('');

  const [activeTab, setActiveTab] = useState<'empresa' | 'clausulas' | 'mantenimiento'>('empresa');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setRfc(settings.rfc || '');
      setAddress(settings.address || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setLogoUrl(settings.logoUrl || BRAND_LOGO_URL);
      setLegalTermsDelivery(settings.legalTermsDelivery || '');
      setLegalTermsReturn(settings.legalTermsReturn || '');
      setLegalTermsRemission(settings.legalTermsRemission || '');
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleLogoFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setLogoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        companyName: companyName.trim() || 'MI EMPRESA S.A. DE C.V.',
        rfc: rfc.trim().toUpperCase(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        logoUrl: logoUrl.trim() || BRAND_LOGO_URL,
        legalTermsDelivery,
        legalTermsReturn,
        legalTermsRemission,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      alert(`Error al guardar configuración: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0051d5] flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Ajustes de la Empresa & Marca
              </h2>
              <p className="text-xs text-white/70">
                Personaliza la razón social, logotipo y cláusulas legales impresas en los vales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-3 border-b border-[#e5eeff] flex items-center gap-3 bg-[#f8f9ff]">
          <button
            type="button"
            onClick={() => setActiveTab('empresa')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'empresa'
                ? 'border-[#0051d5] text-[#0051d5]'
                : 'border-transparent text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            Datos de la Empresa & Logo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clausulas')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'clausulas'
                ? 'border-[#0051d5] text-[#0051d5]'
                : 'border-transparent text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            Cláusulas Legales de Vales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mantenimiento')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'mantenimiento'
                ? 'border-[#ba1a1a] text-[#ba1a1a]'
                : 'border-transparent text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            Modo Producción / Reset
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {activeTab === 'empresa' && (
            <div className="space-y-4">
              {/* Logo Manager */}
              <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white border border-[#dce9ff] p-2 flex items-center justify-center shrink-0 shadow-xs">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo de Empresa"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = BRAND_LOGO_URL;
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-[#76777d]" />
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <span className="font-bold text-xs text-[#0b1c30] block">
                    Logotipo Corporativo
                  </span>
                  <p className="text-[11px] text-[#45464d]">
                    Aparecerá en el encabezado del sistema y en todos los Vales de Entrega y Devolución impresos.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleLogoFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Subir Imagen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoUrl(BRAND_LOGO_URL)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dce9ff] text-xs text-[#45464d] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                    >
                      Logo por Defecto
                    </button>
                  </div>
                </div>
              </div>

              {/* URL input fallback */}
              <div>
                <label className="block text-[10px] text-[#45464d] uppercase font-semibold mb-1">
                  O ingresar URL directa de imagen del Logo
                </label>
                <input
                  type="text"
                  placeholder="https://miempresa.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono text-[#0b1c30] outline-none"
                />
              </div>

              {/* Fiscal & Contact Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                    Razón Social / Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. DISTRIBUIDORA TEXTIL S.A."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-semibold text-[#0b1c30] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                    RFC / Registro Fiscal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. ABC010203-XYZ"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#0051d5] outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                  Dirección de Bodega Central (Origen) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Parque Industrial Vallejo, Bodega 12, CDMX"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="+52 55 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                    Correo de Operaciones
                  </label>
                  <input
                    type="email"
                    placeholder="operaciones@miempresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clausulas' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0051d5] uppercase mb-1">
                  Cláusula Impresa en: Vale de Entrega a Consignación
                </label>
                <textarea
                  rows={3}
                  value={legalTermsDelivery}
                  onChange={(e) => setLegalTermsDelivery(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#ba1a1a] uppercase mb-1">
                  Cláusula Impresa en: Soporte de Devolución Física a Central
                </label>
                <textarea
                  rows={3}
                  value={legalTermsReturn}
                  onChange={(e) => setLegalTermsReturn(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#069669] uppercase mb-1">
                  Cláusula Impresa en: Nota de Remisión para Facturación
                </label>
                <textarea
                  rows={3}
                  value={legalTermsRemission}
                  onChange={(e) => setLegalTermsRemission(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'mantenimiento' && (
            <div className="space-y-4 p-4 rounded-xl bg-[#fff1f0] border border-[#ffdad6]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#ba1a1a]">
                    Zona de Puesta en Marcha (Para tu Cliente)
                  </h4>
                  <p className="text-[11px] text-[#45464d] mt-1 leading-relaxed">
                    Cuando tu cliente vaya a iniciar operaciones reales, puedes vaciar los datos de demostración para que el inventario comience en ceros y puedan cargar sus SKUs reales vía Excel.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('¿Seguro que deseas vaciar el inventario y clientes para arrancar en MODO PRODUCCIÓN LIMPIA (en ceros)?')) {
                      await onResetDatabase('empty');
                      onClose();
                    }
                  }}
                  className="flex-1 py-2.5 px-3 bg-[#ba1a1a] hover:bg-[#991515] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar para Producción Real</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('¿Deseas restaurar los productos y clientes de demostración?')) {
                      await onResetDatabase('demo');
                      onClose();
                    }
                  }}
                  className="flex-1 py-2.5 px-3 bg-white border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-white/80 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Recargar Datos de Prueba</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 flex justify-end gap-3 border-t border-[#e5eeff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0051d5] disabled:opacity-40 text-white text-xs font-semibold rounded-lg hover:bg-[#003ea8] transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios de Empresa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
