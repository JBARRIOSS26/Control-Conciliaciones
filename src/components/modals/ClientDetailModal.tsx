import React from 'react';
import { 
  X, 
  Building2, 
  FileSpreadsheet, 
  Receipt, 
  Truck, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Client } from '../../types';

interface ClientDetailModalProps {
  client: Client | null;
  onClose: () => void;
  onOpenReconcile: (client: Client) => void;
  onOpenSale: (client: Client) => void;
  onOpenDelivery: (client: Client) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onOpenReconcile,
  onOpenSale,
  onOpenDelivery,
}) => {
  if (!client) return null;

  const totalValue = client.items.reduce((acc, item) => acc + (item.remaining * item.unitPrice), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-[#f8f9ff] border-b border-[#e5eeff] flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#dbe1ff] text-[#00174b] font-bold text-base flex items-center justify-center">
              {client.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0b1c30]">{client.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[11px] font-mono font-semibold text-[#0051d5]">
                  {client.contract}
                </span>
              </div>
              <p className="text-xs text-[#45464d]">{client.branch} • {client.type}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#45464d] hover:bg-[#eff4ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#eff4ff] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-[#45464d]">Total Entregadas</span>
              <div className="text-lg font-bold font-mono text-[#0b1c30]">{client.totalDelivered.toLocaleString()}</div>
              <span className="text-[10px] text-[#45464d]">piezas históricas</span>
            </div>

            <div className="bg-[#ecfdf5] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-[#065f46]">Ventas Conciliadas</span>
              <div className="text-lg font-bold font-mono text-[#069669]">{client.salesReconciled.toLocaleString()}</div>
              <span className="text-[10px] text-[#047857]">liquidadas</span>
            </div>

            <div className="bg-[#eff4ff] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-[#0051d5]">Saldo en Custodia</span>
              <div className="text-lg font-bold font-mono text-[#0051d5]">{client.remainingBalance.toLocaleString()}</div>
              <span className="text-[10px] text-[#0051d5]">piezas activas</span>
            </div>

            <div className="bg-[#eff4ff] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-[#45464d]">Valor en Custodia</span>
              <div className="text-lg font-bold font-mono text-[#0b1c30]">${totalValue.toLocaleString()}</div>
              <span className="text-[10px] text-[#45464d]">MXN en anaquel</span>
            </div>
          </div>

          {/* Contact & Agreement Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-[#e5eeff] bg-[#f8f9ff] text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#0b1c30] font-semibold">
                <User className="w-4 h-4 text-[#0051d5]" />
                <span>Contacto Responsable: {client.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-[#45464d]">
                <Phone className="w-4 h-4 text-[#76777d]" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#45464d]">
                <Mail className="w-4 h-4 text-[#76777d]" />
                <span>{client.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#0b1c30] font-semibold">
                <CreditCard className="w-4 h-4 text-[#0051d5]" />
                <span>Límite de Consignación: ${client.creditLimit.toLocaleString()} MXN</span>
              </div>
              <div className="flex items-center gap-2 text-[#45464d]">
                <Calendar className="w-4 h-4 text-[#76777d]" />
                <span>Último Movimiento: {client.lastMovementDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#45464d]">Estatus de Auditoría:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  client.auditStatus === 'corte_requerido'
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : client.auditStatus === 'pendiente_revision'
                    ? 'bg-[#dce9ff] text-[#0b1c30]'
                    : 'bg-[#ecfdf5] text-[#047857]'
                }`}>
                  {client.auditStatus === 'corte_requerido' ? 'Corte Requerido' : client.auditStatus === 'pendiente_revision' ? 'Pendiente Revisión' : 'Al día'}
                </span>
              </div>
            </div>
          </div>

          {/* Consigned Products in Custody */}
          <div>
            <h3 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-2">
              Inventario Activo en Custodia
            </h3>
            <div className="rounded-xl border border-[#e5eeff] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase">
                    <th className="py-2.5 px-3">SKU / Prenda</th>
                    <th className="py-2.5 px-3 text-right">Precio Un.</th>
                    <th className="py-2.5 px-3 text-right">Entregadas</th>
                    <th className="py-2.5 px-3 text-right">Ventas</th>
                    <th className="py-2.5 px-3 text-right">Saldo en Tienda</th>
                    <th className="py-2.5 px-3 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {client.items.map((item) => (
                    <tr key={item.sku} className="hover:bg-[#f8f9ff]">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#0b1c30]">{item.productName}</div>
                        <div className="font-mono text-[10px] text-[#0051d5]">{item.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#45464d]">
                        ${item.unitPrice}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {item.delivered}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#069669]">
                        {item.sold}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0051d5]">
                        {item.remaining}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0b1c30]">
                        ${(item.remaining * item.unitPrice).toLocaleString()} MXN
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#f8f9ff] border-t border-[#e5eeff] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] rounded-lg cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDelivery(client);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#dce9ff] text-xs font-semibold text-[#0051d5] hover:bg-[#eff4ff] cursor-pointer transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Despachar Stock</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSale(client);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#a7f3d0] text-xs font-semibold text-[#069669] hover:bg-[#ecfdf5] cursor-pointer transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Reportar Venta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReconcile(client);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] cursor-pointer transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Conciliar Ahora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
