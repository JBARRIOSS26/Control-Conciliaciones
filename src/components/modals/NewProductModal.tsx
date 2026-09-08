import React, { useState } from 'react';
import { X, PackagePlus, Check, Warehouse, Tag, DollarSign, Layers } from 'lucide-react';
import { Product } from '../../types';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Textil Dama');
  const [unitCost, setUnitCost] = useState<number>(200);
  const [consignPrice, setConsignPrice] = useState<number>(450);
  const [centralStock, setCentralStock] = useState<number>(500);
  const [minAlert, setMinAlert] = useState<number>(100);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [material, setMaterial] = useState('');
  const [barcode, setBarcode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;

    const newProd: Product = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      unitCost: Math.max(0, unitCost),
      consignPrice: Math.max(0, consignPrice),
      centralStock: Math.max(0, centralStock),
      consignedStock: 0,
      inTransitStock: 0,
      minAlert: Math.max(0, minAlert),
      entryDate: new Date().toISOString().slice(0, 10),
      centralAgeDays: 0,
      properties: {
        color: color.trim() || undefined,
        size: size.trim() || undefined,
        material: material.trim() || undefined,
        barcode: barcode.trim() || undefined,
      },
    };

    onAddProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0051d5] flex items-center justify-center text-white">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Ingreso Manual al Almacén Central
              </h2>
              <p className="text-xs text-white/70">
                Alta individual de SKU y alimentación de inventario matriz
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
          {/* SKU & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Código SKU *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. VEST-ROJ-05"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#0051d5] outline-none uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Nombre de la Prenda / Producto *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Vestido Coctel Seda Rojo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Descripción Corta
            </label>
            <input
              type="text"
              placeholder="Ej. Vestido elegante de noche con forro interno y cierre lateral."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
            />
          </div>

          {/* Category & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
              >
                <option value="Textil Dama">Textil Dama</option>
                <option value="Textil Caballero">Textil Caballero</option>
                <option value="Tejidos">Tejidos</option>
                <option value="Calzado">Calzado</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Costo Unitario (MXN)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono text-[#0b1c30] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Precio Consignación (PVP)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={consignPrice}
                onChange={(e) => setConsignPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#069669] outline-none"
              />
            </div>
          </div>

          {/* Stocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#eff4ff]/60 rounded-xl border border-[#dce9ff]">
            <div>
              <label className="block text-xs font-semibold text-[#00174b] uppercase mb-1">
                Stock Ingresado a Almacén Central
              </label>
              <input
                type="number"
                min="0"
                value={centralStock}
                onChange={(e) => setCentralStock(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#316bf3] text-sm font-mono font-bold text-[#0051d5] outline-none"
              />
              <span className="text-[10px] text-[#45464d] mt-0.5 block">
                Piezas físicas disponibles para entrega a clientes.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#00174b] uppercase mb-1">
                Alerta de Stock Mínimo Matriz
              </label>
              <input
                type="number"
                min="0"
                value={minAlert}
                onChange={(e) => setMinAlert(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#dce9ff] text-sm font-mono text-[#45464d] outline-none"
              />
              <span className="text-[10px] text-[#45464d] mt-0.5 block">
                Umbral para notificar reposición de fábrica.
              </span>
            </div>
          </div>

          {/* Extended Properties */}
          <div>
            <span className="block text-[11px] font-semibold text-[#45464d] uppercase tracking-wider mb-2">
              Propiedades del Catálogo (Opcionales)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-[#45464d] mb-1">Color(es)</label>
                <input
                  type="text"
                  placeholder="Ej. Rojo / Negro"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#45464d] mb-1">Tallas</label>
                <input
                  type="text"
                  placeholder="Ej. S, M, L"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#45464d] mb-1">Material</label>
                <input
                  type="text"
                  placeholder="Ej. Seda / Spandex"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#45464d] mb-1">Cód. Barras</label>
                <input
                  type="text"
                  placeholder="Ej. 750100..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono text-[#0b1c30] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
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
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0051d5] text-white text-xs font-semibold rounded-lg hover:bg-[#003ea8] transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Almacén Central</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
