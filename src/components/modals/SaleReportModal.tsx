import React, { useState, useEffect } from 'react';
import { X, Receipt, Check, DollarSign } from 'lucide-react';
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

  useEffect(() => {
    if (products.length > 0 && !sku) {
      setSku(products[0].sku);
    }
  }, [products]);

  if (!isOpen) return null;

  const currentClient = clients.find(c => c.id === clientId);
  const currentProduct = products.find(p => p.sku === sku) || products[0];
  const unitPrice = currentProduct ? currentProduct.consignPrice : 0;
  const totalAmount = unitPrice * (quantity || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !sku || quantity <= 0) return;

    onConfirmSale({
      clientId,
      sku,
      quantity,
      amount: totalAmount,
      referenceDoc: referenceDoc || `LIQ-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes || 'Venta liquidada y reportada en corte semanal.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-[#ecfdf5] border-b border-[#a7f3d0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#069669] text-white flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#002114]">
                Registrar Venta / Cierre Parcial
              </h2>
              <p className="text-xs text-[#065f46]">
                Reporte de prendas vendidas y liquidación de efectivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#065f46] hover:bg-[#d1fae5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Consignatario
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.branch})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Producto / SKU Vendido
            </label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none"
            >
              {products.map(p => (
                <option key={p.sku} value={p.sku}>
                  {p.name} — ${p.consignPrice} MXN ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Piezas Vendidas
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#0b1c30] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Monto a Liquidar
              </label>
              <div className="px-3 py-2 bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg text-xs font-mono font-bold text-[#069669]">
                ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Comprobante / Folio Fiscal o SPEI
            </label>
            <input
              type="text"
              placeholder="Ej. SPEI-89210 o Factura F-102"
              value={referenceDoc}
              onChange={(e) => setReferenceDoc(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Notas del Cierre
            </label>
            <input
              type="text"
              placeholder="Ej. Corte semanal correspondiente al fin de semana..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#069669] text-white text-xs font-semibold rounded-lg hover:bg-[#057a55] transition-colors shadow-xs cursor-pointer"
            >
              Registrar Liquidación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
