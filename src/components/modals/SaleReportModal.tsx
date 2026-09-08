import React, { useState, useEffect } from 'react';
import { X, Receipt, Check, DollarSign, Building, AlertCircle } from 'lucide-react';
import { Client, Product } from '../../types';

interface SaleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products: Product[];
  initialClient?: Client;
  onConfirmSale: (data: {
    clientId: string;
    sku: string;
    quantity: number;
    amount: number;
    referenceDoc: string;
    notes: string;
  }) => void;
}

export const SaleReportModal: React.FC<SaleReportModalProps> = ({
  isOpen,
  onClose,
  clients,
  products,
  initialClient,
  onConfirmSale,
}) => {
  const [clientId, setClientId] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
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

  const currentProduct = products.find(p => p.sku === sku);
  const currentClientItem = clientItems.find(i => i.sku === sku);
  const maxAvailable = currentClientItem ? currentClientItem.remaining : 0;
  const unitPrice = currentProduct ? currentProduct.consignPrice : (currentClientItem ? currentClientItem.unitPrice : 0);
  const totalAmount = unitPrice * (quantity || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !sku || quantity <= 0) return;
    if (quantity > maxAvailable && maxAvailable > 0) {
      alert(`La cantidad vendida (${quantity}) no puede superar las unidades en custodia (${maxAvailable}).`);
      return;
    }

    onConfirmSale({
      clientId,
      sku,
      quantity,
      amount: totalAmount,
      referenceDoc: referenceDoc || `REM-VTA-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes || 'Venta notificada por cliente y canalizada de inmediato a Facturación Fiscal.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#069669] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Legalización de Venta (Nota de Remisión)
              </h2>
              <p className="text-xs text-white/80">
                Canalización inmediata al Área de Facturación y Baja Definitiva
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
          {/* Client */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Consignatario Vendedor
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.branch}) — {c.virtualWarehouseCode}
                </option>
              ))}
            </select>
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Prenda / SKU Vendido
            </label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
            >
              {clientItems.length > 0 ? (
                clientItems.map(p => (
                  <option key={p.sku} value={p.sku}>
                    {p.productName} — ${p.unitPrice} MXN (Custodia: {p.remaining} uds)
                  </option>
                ))
              ) : (
                products.map(p => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} — ${p.consignPrice} MXN ({p.sku})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quantities & Pricing */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#ecfdf5] rounded-xl border border-[#a7f3d0]">
            <div>
              <label className="block text-xs font-semibold text-[#065f46] uppercase mb-1">
                Piezas Vendidas a Descontar
              </label>
              <input
                type="number"
                min="1"
                max={maxAvailable > 0 ? maxAvailable : 9999}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#069669] text-sm font-mono font-bold text-[#069669] outline-none"
              />
              <span className="text-[10px] text-[#065f46] mt-0.5 block">
                Custodia actual: {maxAvailable} uds.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#065f46] uppercase mb-1">
                Importe Total a Facturar
              </label>
              <div className="px-3 py-2 bg-white rounded-lg border border-[#a7f3d0] text-sm font-mono font-bold text-[#069669] flex items-center justify-between">
                <span>${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-[#45464d] font-normal">MXN</span>
              </div>
              <span className="text-[10px] text-[#45464d] mt-0.5 block">
                Precio unitario: ${unitPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Reference Document */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Folio de Nota de Remisión
            </label>
            <input
              type="text"
              placeholder="Autogenerado ej. REM-VTA-1052"
              value={referenceDoc}
              onChange={(e) => setReferenceDoc(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#0b1c30] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Observaciones / Referencia del Cliente
            </label>
            <input
              type="text"
              placeholder="Corte de ventas quincenal reportado por encargado de tienda..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
            />
          </div>

          {/* Rule 2.D Info Notice */}
          <div className="p-2.5 bg-[#eff4ff] rounded-lg border border-[#dce9ff] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#0051d5] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#00174b] leading-tight space-y-0.5">
              <strong className="block">Flujo Oficial de Negocio (Regla 2.D):</strong>
              <span>
                1. Esta Nota de Remisión se canalizará de inmediato a Facturación.<br />
                2. Ejecutará automáticamente la baja definitiva de las unidades del cliente.
              </span>
            </div>
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
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#069669] text-white text-xs font-semibold rounded-lg hover:bg-[#057a55] transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Emitir Nota de Remisión y Dar Baja</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
