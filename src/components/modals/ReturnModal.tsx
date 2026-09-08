import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, Check, AlertCircle, Warehouse, Undo2 } from 'lucide-react';
import { Client, Product } from '../../types';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products: Product[];
  initialClient?: Client;
  onConfirmReturn: (data: {
    clientId: string;
    sku: string;
    quantity: number;
    reason: string;
    referenceDoc: string;
    notes: string;
  }) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  clients,
  products,
  initialClient,
  onConfirmReturn,
}) => {
  const [clientId, setClientId] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState('Mercancía no vendida / fin de temporada');
  const [referenceDoc, setReferenceDoc] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialClient) {
      setClientId(initialClient.id);
    } else if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [initialClient, clients]);

  const currentClient = clients.find(c => c.id === clientId) || clients[0];
  const clientItems = currentClient ? currentClient.items : [];

  useEffect(() => {
    if (clientItems.length > 0) {
      setSku(clientItems[0].sku);
    } else if (products.length > 0) {
      setSku(products[0].sku);
    }
  }, [clientId, clientItems, products]);

  if (!isOpen) return null;

  const currentClientItem = clientItems.find(it => it.sku === sku);
  const maxAvailableInClient = currentClientItem ? currentClientItem.remaining : 0;
  const currentProduct = products.find(p => p.sku === sku);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !sku || quantity <= 0) return;
    if (quantity > maxAvailableInClient && maxAvailableInClient > 0) {
      alert(`La cantidad a devolver (${quantity}) no puede superar las unidades en custodia del cliente (${maxAvailableInClient}).`);
      return;
    }

    onConfirmReturn({
      clientId,
      sku,
      quantity,
      reason,
      referenceDoc: referenceDoc || `VALE-DEV-${Math.floor(800 + Math.random() * 200)}`,
      notes: notes || `Retorno formal de mercancía hacia Almacén Central: ${reason}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#ba1a1a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Undo2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Devolución de Mercancía a Almacén Central
              </h2>
              <p className="text-xs text-white/80">
                Reingreso de prendas en custodia con Soporte Físico Firmado
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Consignatario Origen (Cliente)
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.virtualWarehouseCode} ({c.branch})
                </option>
              ))}
            </select>
            {currentClient && (
              <span className="text-[10px] text-[#0051d5] font-mono mt-1 block">
                Sub-almacén Virtual: {currentClient.virtualWarehouseCode} • {currentClient.virtualWarehouseName}
              </span>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Artículo a Retornar al Almacén Central
            </label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
            >
              {clientItems.length > 0 ? (
                clientItems.map(it => (
                  <option key={it.sku} value={it.sku}>
                    {it.productName} ({it.sku}) — Custodia: {it.remaining} uds
                  </option>
                ))
              ) : (
                products.map(p => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#fff1f0] rounded-xl border border-[#ffdad6]">
            <div>
              <label className="block text-xs font-semibold text-[#ba1a1a] uppercase mb-1">
                Piezas a Retornar
              </label>
              <input
                type="number"
                min="1"
                max={maxAvailableInClient > 0 ? maxAvailableInClient : 9999}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#ba1a1a] text-sm font-mono font-bold text-[#ba1a1a] outline-none"
              />
              <span className="text-[10px] text-[#76777d] mt-0.5 block">
                Reingresan al stock de Bodega Matriz.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#45464d] uppercase mb-1">
                Saldo Actual en Cliente
              </label>
              <div className="px-3 py-2 bg-white rounded-lg border border-[#ffdad6] text-xs font-mono font-bold text-[#0b1c30]">
                {maxAvailableInClient} uds en custodia
              </div>
              <span className="text-[10px] text-[#45464d] mt-0.5 block">
                Quedarán: {Math.max(0, maxAvailableInClient - quantity)} uds.
              </span>
            </div>
          </div>

          {/* Return Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Motivo Oficial de la Devolución
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
            >
              <option value="Mercancía no vendida / fin de temporada">Mercancía no vendida / fin de temporada</option>
              <option value="Rotación estratégica de inventario hacia Central">Rotación estratégica de inventario hacia Central</option>
              <option value="Baja rotación en punto de venta">Baja rotación en punto de venta</option>
              <option value="Cierre o reubicación de sucursal">Cierre o reubicación de sucursal</option>
              <option value="Solicitud formal de retiro de mercancía">Solicitud formal de retiro de mercancía</option>
            </select>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Folio / Vale de Devolución
              </label>
              <input
                type="text"
                placeholder="Autogenerado ej. VALE-DEV-882"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono text-[#0b1c30] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Observación Física
              </label>
              <input
                type="text"
                placeholder="Prendas en empaque sellado original..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
          </div>

          {/* Notice */}
          <div className="p-2.5 bg-[#eff4ff] rounded-lg border border-[#dce9ff] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#0051d5] shrink-0 mt-0.5" />
            <span className="text-[11px] text-[#00174b] leading-tight">
              <strong>Restricción Obligatoria:</strong> Al confirmar, el sistema emitirá el Soporte de Devolución Físico para su firma y archivo de auditoría física.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-[#e5eeff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#991515] transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar y Emitir Soporte Físico</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
