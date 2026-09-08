import React from 'react';
import { X, Printer, CheckCircle2, Building, ShieldCheck, ArrowDownLeft, Truck, Receipt } from 'lucide-react';
import { PhysicalVoucherData } from '../../types';
import { BRAND_LOGO_URL } from '../../data/mockData';

interface PrintVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherData: PhysicalVoucherData | null;
}

export const PrintVoucherModal: React.FC<PrintVoucherModalProps> = ({
  isOpen,
  onClose,
  voucherData,
}) => {
  if (!isOpen || !voucherData) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDelivery = voucherData.voucherType === 'entrega';
  const isReturn = voucherData.voucherType === 'devolucion';
  const isRemision = voucherData.voucherType === 'remision';

  const settings = voucherData.companySettings;
  const companyName = settings?.companyName || 'CONSIGNLEDGER S.A. DE C.V.';
  const rfc = settings?.rfc || 'CLG210405-TX8';
  const address = settings?.address || 'Almacén Central Origen • Parque Industrial CEDI Bodega 4-B';
  const logo = settings?.logoUrl || BRAND_LOGO_URL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-[#0b1c30] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDelivery ? 'bg-[#0051d5]' : isReturn ? 'bg-[#ba1a1a]' : 'bg-[#069669]'
            }`}>
              {isDelivery ? <Truck className="w-4 h-4 text-white" /> : 
               isReturn ? <ArrowDownLeft className="w-4 h-4 text-white" /> : 
               <Receipt className="w-4 h-4 text-white" />}
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white/70">
                Soporte Oficial Generado
              </span>
              <h3 className="text-sm font-bold text-white leading-tight">
                {voucherData.folio} • {voucherData.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#316bf3] hover:bg-[#2055d4] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Físico / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div id="printable-voucher-document" className="p-6 sm:p-8 bg-white text-[#0b1c30] space-y-6 text-xs sm:text-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#dce9ff] pb-5">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo Corporativo"
                className="h-11 w-auto max-w-[140px] object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = BRAND_LOGO_URL; }}
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#0b1c30] tracking-tight uppercase">
                  {companyName}
                </h1>
                <p className="text-[11px] text-[#45464d]">
                  Sistema de Control Centralizado de Mercancía en Consignación
                </p>
                <p className="text-[10px] text-[#76777d]">
                  {address} • RFC: {rfc}
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-[#e5eeff] sm:pl-6 w-full sm:w-auto">
              <div className="inline-block px-2.5 py-1 rounded-md font-mono font-bold text-xs bg-[#eff4ff] text-[#0051d5] border border-[#dce9ff]">
                FOLIO: {voucherData.folio}
              </div>
              <div className="text-[11px] text-[#45464d] mt-1 font-mono">
                Fecha de Emisión: {voucherData.date}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#069669]">
                {isDelivery ? 'Despacho Autorizado' : isReturn ? 'Recepción Central Validada' : 'Canalizada a Facturación'}
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className={`px-4 py-2.5 rounded-xl border flex items-center justify-between ${
            isDelivery ? 'bg-[#eff4ff] border-[#0051d5]/20 text-[#00174b]' :
            isReturn ? 'bg-[#fff1f0] border-[#ba1a1a]/20 text-[#410002]' :
            'bg-[#ecfdf5] border-[#069669]/20 text-[#002114]'
          }`}>
            <span className="font-bold uppercase tracking-wider text-xs sm:text-sm">
              {voucherData.title}
            </span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 border">
              ORIGEN: {isReturn ? voucherData.virtualWarehouseName : 'Almacén Central (Origen)'}
            </span>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9ff] p-4 rounded-xl border border-[#e5eeff]">
            <div>
              <span className="text-[10px] font-semibold text-[#0051d5] uppercase tracking-wider block mb-1">
                {isReturn ? 'Entidad Receptora (Custodia Central)' : 'Consignatario / Destino Asignado'}
              </span>
              <div className="font-bold text-sm text-[#0b1c30]">{voucherData.clientName}</div>
              <div className="text-xs text-[#45464d]">{voucherData.branch}</div>
              <div className="font-mono text-[11px] text-[#0051d5] font-semibold mt-1">
                Sub-almacén Virtual: {voucherData.virtualWarehouseCode} ({voucherData.virtualWarehouseName})
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-[#0051d5] uppercase tracking-wider block mb-1">
                Detalles Operativos del Movimiento
              </span>
              <div className="text-xs text-[#45464d]">
                <strong className="text-[#0b1c30]">Canal:</strong> Modelo Flexible N a N en Consignación
              </div>
              <div className="text-xs text-[#45464d]">
                <strong className="text-[#0b1c30]">Observaciones:</strong> {voucherData.notes || 'Operación física regular bajo contrato vigente.'}
              </div>
              {voucherData.billingChannelInfo && (
                <div className="text-xs text-[#069669] font-medium mt-1">
                  {voucherData.billingChannelInfo}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-[#e5eeff] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#eff4ff] text-[#45464d] text-[10px] uppercase font-bold tracking-wider border-b border-[#e5eeff]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Descripción / Artículo</th>
                  <th className="py-2.5 px-3 text-right">Cantidad</th>
                  {voucherData.items.some(i => i.unitPrice) && (
                    <>
                      <th className="py-2.5 px-3 text-right">Precio Consig.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </>
                  )}
                  <th className="py-2.5 px-3">Condición / Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {voucherData.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9ff]">
                    <td className="py-2.5 px-3 text-[#76777d] font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0051d5]">{item.sku}</td>
                    <td className="py-2.5 px-3 font-medium text-[#0b1c30]">{item.productName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0b1c30]">
                      {item.quantity.toLocaleString()} uds
                    </td>
                    {voucherData.items.some(i => i.unitPrice) && (
                      <>
                        <td className="py-2.5 px-3 text-right font-mono text-[#45464d]">
                          ${item.unitPrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0b1c30]">
                          ${((item.unitPrice || 0) * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </>
                    )}
                    <td className="py-2.5 px-3 text-[11px] text-[#76777d]">
                      {item.notes || 'Conforme a norma de empaque'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#eff4ff]/60 font-bold border-t border-[#dce9ff]">
                  <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[11px]">
                    Total de Unidades Trasladadas:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-[#0051d5]">
                    {voucherData.totalUnits.toLocaleString()} uds
                  </td>
                  {voucherData.totalAmount !== undefined && (
                    <>
                      <td className="py-2.5 px-3 text-right uppercase text-[11px]">Total Valuado:</td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm text-[#069669]">
                        ${voucherData.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </>
                  )}
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal Declarations */}
          <div className="p-3 bg-[#f8f9ff] rounded-lg border border-[#e5eeff] text-[10px] text-[#45464d] leading-relaxed">
            <p>
              <strong>Cláusula de Resguardo y Responsabilidad:</strong> {isDelivery ? (
                settings?.legalTermsDelivery || 'La mercancía detallada se entrega en calidad de consignación mercantil con destino al sub-almacén virtual del cliente. El consignatario asume la custodia, conservación e integridad física de las prendas hasta su venta definitiva o retorno documentado al Almacén Central.'
              ) : isReturn ? (
                settings?.legalTermsReturn || 'El Almacén Central certifica el reingreso físico de las piezas devueltas y su reintegración inmediata al stock disponible. La firma avala la inspección de calidad y libera de custodia al consignatario por dichas unidades.'
              ) : (
                settings?.legalTermsRemission || 'La emisión de la presente Nota de Remisión legaliza la venta efectuada por el consignatario y ejecuta la baja definitiva del inventario. El documento se canaliza formalmente al área de facturación fiscal.'
              )}
            </p>
          </div>

          {/* Signatures Area (Essential for physical voucher requirement) */}
          <div className="pt-6 border-t border-[#e5eeff] grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="h-14 border-b border-dashed border-[#76777d] flex items-end justify-center pb-1">
                <span className="text-[10px] text-[#76777d] italic">(Firma autorizada)</span>
              </div>
              <span className="block font-bold text-[11px] text-[#0b1c30] mt-1.5">
                {voucherData.deliveredBy}
              </span>
              <span className="block text-[10px] text-[#45464d]">
                {isReturn ? 'Entrega por Consignatario' : 'Despachó Almacén Central'}
              </span>
            </div>

            <div>
              <div className="h-14 border-b border-dashed border-[#76777d] flex items-end justify-center pb-1">
                <span className="text-[10px] text-[#76777d] italic">(Firma y Sello de Recepción)</span>
              </div>
              <span className="block font-bold text-[11px] text-[#0b1c30] mt-1.5">
                {voucherData.receivedBy}
              </span>
              <span className="block text-[10px] text-[#45464d]">
                {isReturn ? 'Recibió en Bodega Central' : 'Recibió Consignatario (Tienda)'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="h-14 border-b border-dashed border-[#76777d] flex items-end justify-center pb-1">
                <span className="text-[10px] text-[#76777d] italic">(Sello de Control / Auditoría)</span>
              </div>
              <span className="block font-bold text-[11px] text-[#0b1c30] mt-1.5">
                Dirección de Operaciones
              </span>
              <span className="block text-[10px] text-[#45464d]">
                Validación de Kardex y Sistema
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden in Print) */}
        <div className="px-6 py-4 bg-[#f8f9ff] border-t border-[#e5eeff] flex items-center justify-between print:hidden">
          <span className="text-xs text-[#45464d]">
            Documento físico válido para archivo de auditoría y respaldo fiscal.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] rounded-lg transition-colors cursor-pointer"
            >
              Cerrar Vista Previa
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Físico (PDF / Térmica)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
