import React, { useState } from 'react';
import { X, Plus, ArrowLeftRight, Truck, CheckCircle, PackageMinus, Scale, Check } from 'lucide-react';
import { Client, Product, MovementType } from '../../types';

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products: Product[];
  onConfirmNewMovement: (data: {
    type: MovementType;
    clientId: string;
    sku: string;
    quantity: number;
    amount?: number;
    referenceDoc: string;
    notes: string;
  }) => void;
}

export const NewMovementModal: React.FC<NewMovementModalProps> = ({
  isOpen,
  onClose,
  clients,
  products,
  onConfirmNewMovement,
}) => {
  const [type, setType] = useState<MovementType>('entrega');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [sku, setSku] = useState(products[0]?.sku || '');
  const [quantity, setQuantity] = useState<number>(20);
  const [referenceDoc, setReferenceDoc] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.sku === sku);
  const calculatedAmount = currentProduct ? currentProduct.consignPrice * quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !sku || quantity <= 0) return;

    onConfirmNewMovement({
      type,
      clientId,
      sku,
      quantity,
      amount: type === 'venta_cierre' ? calculatedAmount : undefined,
      referenceDoc: referenceDoc || (
        type === 'entrega' ? `REM-${Math.floor(8500 + Math.random() * 500)}` :
        type === 'venta_cierre' ? `LIQ-${Math.floor(1050 + Math.random() * 500)}` :
        `MER-${Math.floor(100 + Math.random() * 500)}`
      ),
      notes: notes || 'Movimiento manual registrado por auditor.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Nuevo Movimiento de Inventario
              </h2>
              <p className="text-xs text-white/70">
                Registra entregas, ventas, mermas o ajustes de custodia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Movement Type Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1.5">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('entrega')}
                className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  type === 'entrega'
                    ? 'bg-[#eff4ff] border-[#0051d5] text-[#0051d5]'
                    : 'bg-white border-[#e5eeff] text-[#45464d] hover:bg-[#f8f9ff]'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Entrega (REM)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('venta_cierre')}
                className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  type === 'venta_cierre'
                    ? 'bg-[#ecfdf5] border-[#069669] text-[#069669]'
                    : 'bg-white border-[#e5eeff] text-[#45464d] hover:bg-[#f8f9ff]'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Venta (LIQ)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('devolucion_merma')}
                className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  type === 'devolucion_merma'
                    ? 'bg-[#ffdad6]/60 border-[#ba1a1a] text-[#ba1a1a]'
                    : 'bg-white border-[#e5eeff] text-[#45464d] hover:bg-[#f8f9ff]'
                }`}
              >
                <PackageMinus className="w-4 h-4" />
                <span>Merma (MER)</span>
              </button>
            </div>
          </div>

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
              Producto / SKU
            </label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none"
            >
              {products.map(p => (
                <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Cantidad (Piezas)
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
                Folio / Guía / Factura
              </label>
              <input
                type="text"
                placeholder="Ej. REM-8495 / FAC-21"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Notas y Justificación
            </label>
            <input
              type="text"
              placeholder="Detalles sobre el motivo o estado de la mercancía..."
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
              className="px-5 py-2 bg-[#0b1c30] text-white text-xs font-semibold rounded-lg hover:bg-[#1f2937] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Kardex</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
