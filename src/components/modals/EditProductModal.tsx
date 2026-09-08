import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, Trash2, Package } from 'lucide-react';
import { Product } from '../../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSaveProduct: (updated: Product) => void;
  onDeleteProduct?: (sku: string) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [consignPrice, setConsignPrice] = useState<number>(0);
  const [centralStock, setCentralStock] = useState<number>(0);
  const [minAlert, setMinAlert] = useState<number>(0);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [material, setMaterial] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setCategory(product.category);
      setUnitCost(product.unitCost);
      setConsignPrice(product.consignPrice);
      setCentralStock(product.centralStock);
      setMinAlert(product.minAlert);
      setColor(product.properties?.color || '');
      setSize(product.properties?.size || '');
      setMaterial(product.properties?.material || '');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Product = {
      ...product,
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      unitCost: Math.max(0, unitCost),
      consignPrice: Math.max(0, consignPrice),
      centralStock: Math.max(0, centralStock),
      minAlert: Math.max(0, minAlert),
      properties: {
        ...product.properties,
        color: color.trim() || undefined,
        size: size.trim() || undefined,
        material: material.trim() || undefined,
      },
    };

    onSaveProduct(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0051d5] flex items-center justify-center text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b1c30]">
                Editar Artículo: {product.sku}
              </h2>
              <p className="text-xs text-[#45464d]">
                Modificación de propiedades y existencias en Almacén Central
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#45464d] hover:bg-[#dce9ff] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Nombre de la Prenda
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Descripción Corta
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
            />
          </div>

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
                Costo (MXN)
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
                PVP Consignación
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

          <div className="grid grid-cols-2 gap-3 p-3 bg-[#eff4ff]/60 rounded-xl border border-[#dce9ff]">
            <div>
              <label className="block text-xs font-semibold text-[#00174b] uppercase mb-1">
                Stock Físico Almacén Central
              </label>
              <input
                type="number"
                min="0"
                value={centralStock}
                onChange={(e) => setCentralStock(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#316bf3] text-sm font-mono font-bold text-[#0051d5] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#00174b] uppercase mb-1">
                Stock en Custodia (Clientes)
              </label>
              <div className="px-3 py-2 bg-[#e5eeff] rounded-lg text-sm font-mono font-bold text-[#45464d]">
                {product.consignedStock.toLocaleString()} uds
              </div>
            </div>
          </div>

          {/* Properties */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-[#45464d] mb-1">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#45464d] mb-1">Tallas</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#45464d] mb-1">Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-[#e5eeff]">
            {onDeleteProduct ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Seguro que deseas eliminar el SKU ${product.sku}?`)) {
                    onDeleteProduct(product.sku);
                    onClose();
                  }
                }}
                className="text-xs text-[#ba1a1a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar SKU</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
