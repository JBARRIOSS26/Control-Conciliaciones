import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Calculator, 
  Check, 
  Building2 
} from 'lucide-react';
import { Client, ConsignmentItem } from '../../types';

interface ReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClient?: Client;
  onConfirmReconciliation: (
    clientId: string, 
    reconciliationData: {
      physicalCounts: Record<string, number>;
      totalDiscrepancy: number;
      totalDiscrepancyAmount: number;
      notes: string;
    }
  ) => void;
}

export const ReconcileModal: React.FC<ReconcileModalProps> = ({
  isOpen,
  onClose,
  clients,
  initialClient,
  onConfirmReconciliation,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialClient) {
      setSelectedClientId(initialClient.id);
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialClient, clients]);

  const currentClient = clients.find(c => c.id === selectedClientId);

  // Initialize physical counts with expected remaining balance
  useEffect(() => {
    if (currentClient) {
      const initialMap: Record<string, number> = {};
      currentClient.items.forEach(item => {
        initialMap[item.sku] = item.remaining;
      });
      setPhysicalCounts(initialMap);
      setNotes(`Auditoría física y corte semanal completado para ${currentClient.name}.`);
    }
  }, [selectedClientId]);

  if (!isOpen) return null;

  const handleCountChange = (sku: string, value: string) => {
    const num = parseInt(value, 10);
    setPhysicalCounts(prev => ({
      ...prev,
      [sku]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  // Calculations
  let totalTheoretical = 0;
  let totalPhysical = 0;
  let totalDiscrepancy = 0;
  let totalDiscrepancyAmount = 0;
  let totalValueInCustody = 0;

  if (currentClient) {
    currentClient.items.forEach(item => {
      totalTheoretical += item.remaining;
      const physical = physicalCounts[item.sku] ?? item.remaining;
      totalPhysical += physical;
      const diff = physical - item.remaining;
      totalDiscrepancy += diff;
      totalDiscrepancyAmount += diff * item.unitPrice;
      totalValueInCustody += item.remaining * item.unitPrice;
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;

    onConfirmReconciliation(currentClient.id, {
      physicalCounts,
      totalDiscrepancy,
      totalDiscrepancyAmount,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div 
        id="reconcile-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#e5eeff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0051d5] text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                Hoja de Conciliación y Auditoría Física
              </h2>
              <p className="text-xs text-[#45464d]">
                Comparativa de saldo teórico en sistema versus existencias reales en anaquel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#45464d] hover:bg-[#dce9ff] hover:text-[#0b1c30] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Consignee selector & metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9ff] p-4 rounded-xl border border-[#e5eeff]">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] uppercase tracking-wider mb-1.5">
                  Consignatario a Auditar
                </label>
                <select
                  id="select-consignee-reconcile"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-[#dce9ff] text-xs sm:text-sm font-medium text-[#0b1c30] focus:border-[#0051d5] outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.branch} ({c.contract})
                    </option>
                  ))}
                </select>
              </div>

              {currentClient && (
                <div className="flex flex-col justify-center text-xs text-[#45464d] space-y-1">
                  <div className="flex justify-between">
                    <span>Contacto en sucursal:</span>
                    <span className="font-semibold text-[#0b1c30]">{currentClient.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Días transcurridos sin corte:</span>
                    <span className="font-mono font-bold text-[#ba1a1a]">{currentClient.daysWithoutCut} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor estimado en custodia:</span>
                    <span className="font-mono font-bold text-[#0051d5]">${totalValueInCustody.toLocaleString()} MXN</span>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory table comparison */}
            {currentClient && (
              <div className="overflow-x-auto rounded-xl border border-[#e5eeff]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">SKU / Prenda</th>
                      <th className="py-2.5 px-3 text-right">Precio Un.</th>
                      <th className="py-2.5 px-3 text-right">Entregado</th>
                      <th className="py-2.5 px-3 text-right">Ventas Acum.</th>
                      <th className="py-2.5 px-3 text-right">Saldo Teórico</th>
                      <th className="py-2.5 px-3 text-center w-36">Conteo Físico Real</th>
                      <th className="py-2.5 px-3 text-right">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {currentClient.items.map((item) => {
                      const counted = physicalCounts[item.sku] ?? item.remaining;
                      const diff = counted - item.remaining;

                      return (
                        <tr key={item.sku} className="hover:bg-[#f8f9ff]">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#0b1c30]">{item.productName}</div>
                            <div className="font-mono text-[10px] text-[#45464d]">{item.sku}</div>
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
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={physicalCounts[item.sku] ?? ''}
                              onChange={(e) => handleCountChange(item.sku, e.target.value)}
                              className="w-24 text-center px-2 py-1 rounded-md bg-[#eff4ff] border border-[#dce9ff] text-xs font-mono font-bold text-[#0b1c30] focus:border-[#0051d5] focus:bg-white outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            {diff === 0 ? (
                              <span className="text-[#069669]">0 (Cuadrado)</span>
                            ) : diff < 0 ? (
                              <span className="text-[#ba1a1a]">{diff} (Faltante)</span>
                            ) : (
                              <span className="text-[#0051d5]">+{diff} (Sobrante)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reconciliation Balance Summary Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              totalDiscrepancy === 0
                ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#069669]'
                : totalDiscrepancy < 0
                ? 'bg-[#ffdad6]/50 border-[#ffdad6] text-[#ba1a1a]'
                : 'bg-[#eff4ff] border-[#dce9ff] text-[#0051d5]'
            }`}>
              <div className="flex items-center gap-3">
                {totalDiscrepancy === 0 ? (
                  <CheckCircle2 className="w-6 h-6 text-[#069669] shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs sm:text-sm">
                    {totalDiscrepancy === 0
                      ? 'Conciliación Perfecta: 100% de coincidencia física'
                      : totalDiscrepancy < 0
                      ? `Discrepancia detectada: Faltante de ${Math.abs(totalDiscrepancy)} piezas en piso`
                      : `Sobrante detectado: ${totalDiscrepancy} piezas no registradas`}
                  </div>
                  <div className="text-[11px] opacity-80">
                    Saldo teórico: {totalTheoretical} uds. | Conteo en tienda: {totalPhysical} uds.
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] block uppercase font-medium">Impacto en Moneda</span>
                <span className="text-base font-bold font-mono">
                  {totalDiscrepancyAmount === 0
                    ? '$0.00 MXN'
                    : totalDiscrepancyAmount < 0
                    ? `-$${Math.abs(totalDiscrepancyAmount).toLocaleString()} MXN`
                    : `+$${totalDiscrepancyAmount.toLocaleString()} MXN`}
                </span>
              </div>
            </div>

            {/* Auditor signoff notes */}
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase tracking-wider mb-1">
                Dictamen y Observaciones del Auditor
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ingresa los comentarios del acta de conciliación y acuerdos con el encargado..."
                className="w-full p-2.5 rounded-lg bg-[#eff4ff] text-xs text-[#0b1c30] border border-[#dce9ff] focus:border-[#0051d5] focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="px-6 py-4 bg-[#f8f9ff] border-t border-[#e5eeff] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#45464d] hover:bg-[#e5eeff] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Aprobar y Emitir Corte</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
