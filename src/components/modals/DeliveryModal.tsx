import React, { useState, useEffect } from 'react';
import { X, Truck, Check, Plus, Trash2, Warehouse, AlertCircle } from 'lucide-react';
import { Client, Product } from '../../types';

export interface DeliveryItemEntry {
  sku: string;
  quantity: number;
}

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products: Product[];
  initialClient?: Client;
  onConfirmDelivery: (data: {
    clientId: string;
    items: DeliveryItemEntry[];
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
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItemEntry[]>([]);
  const [currentSku, setCurrentSku] = useState('');
  const [currentQty, setCurrentQty] = useState<number>(50);
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
    if (products.length > 0 && !currentSku) {
      setCurrentSku(products[0].sku);
    }
  }, [products]);

  // Initialize with at least 1 item when opening
  useEffect(() => {
    if (isOpen && deliveryItems.length === 0 && products.length > 0) {
      setDeliveryItems([{ sku: products[0].sku, quantity: 50 }]);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const currentClient = clients.find(c => c.id === clientId) || clients[0];
  const selectedProduct = products.find(p => p.sku === currentSku);

  const handleAddItem = () => {
    if (!currentSku || currentQty <= 0) return;
    const existingIndex = deliveryItems.findIndex(it => it.sku === currentSku);
    if (existingIndex >= 0) {
      setDeliveryItems(prev => prev.map((it, idx) => 
        idx === existingIndex ? { ...it, quantity: it.quantity + currentQty } : it
      ));
    } else {
      setDeliveryItems(prev => [...prev, { sku: currentSku, quantity: currentQty }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setDeliveryItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const totalDeliveryPieces = deliveryItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || deliveryItems.length === 0) {
      alert('Debes agregar al menos un artículo para despachar.');
      return;
    }

    onConfirmDelivery({
      clientId,
      items: deliveryItems,
      referenceDoc: referenceDoc || `VALE-ENT-${Math.floor(8000 + Math.random() * 1000)}`,
      notes: notes || 'Despacho de resurtido conforme a contrato de consignación mercantil.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0051d5] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Envío de Mercancía a Consignación (Despacho)
              </h2>
              <p className="text-xs text-white/80">
                Traslado desde Almacén Central hacia Sub-almacén Virtual del Cliente
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
          {/* Target Client & Virtual Warehouse */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Consignatario Destino
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.branch} ({c.virtualWarehouseCode})
                </option>
              ))}
            </select>
            {currentClient && (
              <div className="mt-1.5 p-2 bg-[#eff4ff] rounded-lg border border-[#dce9ff] flex items-center justify-between">
                <span className="text-[11px] text-[#0051d5] font-mono font-medium">
                  Sub-almacén Virtual Destino: <strong>{currentClient.virtualWarehouseCode}</strong> • {currentClient.virtualWarehouseName}
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#dce9ff] text-[#45464d]">
                  Saldo previo: {currentClient.remainingBalance.toLocaleString()} uds
                </span>
              </div>
            )}
          </div>

          {/* Add Item Row */}
          <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] space-y-2">
            <span className="font-semibold text-xs text-[#0b1c30] block">
              Agregar Artículos al Vale de Entrega
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[10px] text-[#45464d] mb-1 font-semibold uppercase">
                  Producto / SKU
                </label>
                <select
                  value={currentSku}
                  onChange={(e) => setCurrentSku(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} (Disp. Central: {p.centralStock} uds)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] text-[#45464d] mb-1 font-semibold uppercase">
                  Piezas
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.centralStock : 9999}
                  value={currentQty}
                  onChange={(e) => setCurrentQty(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#0051d5] outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-1.5 px-3 bg-[#0051d5] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar SKU</span>
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Batch Table */}
          <div className="border border-[#e5eeff] rounded-xl overflow-hidden">
            <div className="bg-[#eff4ff] px-3 py-2 text-[11px] font-bold text-[#45464d] uppercase tracking-wider flex items-center justify-between border-b border-[#e5eeff]">
              <span>Artículos en este Despacho ({deliveryItems.length})</span>
              <span className="font-mono text-[#0051d5]">Total: {totalDeliveryPieces.toLocaleString()} piezas</span>
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-[#f1f5f9]">
              {deliveryItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#76777d]">
                  No has agregado productos a la remisión de entrega.
                </div>
              ) : (
                deliveryItems.map((item, idx) => {
                  const prod = products.find(p => p.sku === item.sku);
                  return (
                    <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-[#f8f9ff]">
                      <div>
                        <span className="font-semibold text-xs text-[#0b1c30]">{prod?.name || item.sku}</span>
                        <span className="text-[11px] text-[#0051d5] font-mono block">{item.sku} • PVP: ${prod?.consignPrice || 0}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-[#0b1c30]">{item.quantity.toLocaleString()} uds</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Folio Vale de Entrega / Guía
              </label>
              <input
                type="text"
                placeholder="Autogenerado ej. VALE-ENT-8501"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono text-[#0b1c30] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Observaciones de Despacho
              </label>
              <input
                type="text"
                placeholder="Entregado en empaque sellado para exhibición..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
          </div>

          {/* Mandatory Rule Notice */}
          <div className="p-2.5 bg-[#ecfdf5] rounded-lg border border-[#a7f3d0] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#069669] shrink-0 mt-0.5" />
            <span className="text-[11px] text-[#065f46] leading-tight">
              <strong>Restricción Obligatoria (Regla 2.B):</strong> Para liberar físicamente la mercancía, el sistema generará de inmediato el Vale de Entrega Físico para su firma por el transportista y el consignatario.
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
              disabled={deliveryItems.length === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0051d5] disabled:opacity-40 text-white text-xs font-semibold rounded-lg hover:bg-[#003ea8] transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Despachar y Emitir Vale Físico</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
