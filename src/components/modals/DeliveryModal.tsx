import React, { useState, useEffect } from 'react';
import { X, Truck, Check } from 'lucide-react';
import { Client, Product } from '../../types';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products: Product[];
  initialClient?: Client;
  onConfirmDelivery: (data: {
    clientId: string;
    sku: string;
    quantity: number;
    referenceDoc: string;
    notes: string;
  }) => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  clients,
  products,
  initialClient,
  onConfirmDelivery,
}) => {
  const [clientId, setClientId] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
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

  const currentProduct = products.find(p => p.sku === sku) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !sku || quantity <= 0) return;

    onConfirmDelivery({
      clientId,
      sku,
      quantity,
      referenceDoc: referenceDoc || `REM-${Math.floor(8000 + Math.random() * 1000)}`,
      notes: notes || 'Despacho para resurtido de exhibición.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0051d5] text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b1c30]">
                Registrar Entrega a Cliente (Remisión)
              </h2>
              <p className="text-xs text-[#45464d]">
                Despacho de existencias desde Bodega Matriz hacia consignatario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#45464d] hover:bg-[#dce9ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Consignatario Destino
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.branch}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Producto / SKU a Consignar
            </label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none"
            >
              {products.map(p => (
                <option key={p.sku} value={p.sku}>
                  {p.name} (Disp. Bodega: {p.centralStock} uds)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Piezas a Despachar
              </label>
              <input
                type="number"
                min="1"
                max={currentProduct ? currentProduct.centralStock : 9999}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#0b1c30] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Disponibilidad Matriz
              </label>
              <div className="px-3 py-2 bg-[#f1f5f9] rounded-lg text-xs font-mono text-[#0b1c30]">
                {currentProduct ? `${currentProduct.centralStock} uds disponibles` : '—'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Folio de Remisión / Guía de Transporte
            </label>
            <input
              type="text"
              placeholder="Ej. REM-8501 o Guía Estafeta 77192"
              value={referenceDoc}
              onChange={(e) => setReferenceDoc(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Observaciones de Entrega
            </label>
            <input
              type="text"
              placeholder="Ej. Entregado con empaque sellado al encargado de tienda..."
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
              className="px-5 py-2 bg-[#0051d5] text-white text-xs font-semibold rounded-lg hover:bg-[#003ea8] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Emitir Remisión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
