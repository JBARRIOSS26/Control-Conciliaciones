import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Download, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { Product } from '../types';

interface CatalogViewProps {
  products: Product[];
  onOpenDelivery: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onOpenDelivery,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const totalCentralStock = useMemo(() => {
    return products.reduce((acc, p) => acc + p.centralStock, 0);
  }, [products]);

  const totalConsignedStock = useMemo(() => {
    return products.reduce((acc, p) => acc + p.consignedStock, 0);
  }, [products]);

  const totalCatalogValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.consignedStock * p.consignPrice), 0);
  }, [products]);

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] uppercase tracking-wider">
            <span>Gestión de SKUs y Existencias</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">{products.length} Productos en Consignación</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Catálogo de Productos
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenDelivery}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Despachar Stock a Consignación</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Stock en Bodega Central</span>
            <div className="text-2xl font-bold text-[#0b1c30] font-mono mt-1">
              {totalCentralStock.toLocaleString()} uds.
            </div>
            <span className="text-[11px] text-[#45464d]">Disponible para despacho</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#131b2e] text-white flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Stock Colocado en Calle</span>
            <div className="text-2xl font-bold text-[#0051d5] font-mono mt-1">
              {totalConsignedStock.toLocaleString()} uds.
            </div>
            <span className="text-[11px] text-[#0051d5] font-medium">En custodia de clientes</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Valor de Custodia (PVP)</span>
            <div className="text-2xl font-bold text-[#069669] font-mono mt-1">
              ${totalCatalogValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[#069669] font-medium">Valor total a liquidar</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] text-[#069669] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#45464d]" />
          <input
            type="text"
            placeholder="Buscar por SKU, nombre de prenda o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#eff4ff] text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#76777d] border border-transparent focus:border-[#0051d5] focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#eff4ff] text-xs font-medium text-[#0b1c30] border border-transparent focus:border-[#0051d5] focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-3 px-4">SKU / Prenda</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Costo Unit.</th>
                <th className="py-3 px-4 text-right">Precio Consignación</th>
                <th className="py-3 px-4 text-right">Margen Bruto</th>
                <th className="py-3 px-4 text-right">Bodega Matriz</th>
                <th className="py-3 px-4 text-right">Consignado</th>
                <th className="py-3 px-4 text-center">En Tránsito</th>
                <th className="py-3 px-4 text-center">Estado Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredProducts.map((prod) => {
                const margin = Math.round(((prod.consignPrice - prod.unitCost) / prod.consignPrice) * 100);
                const isLowStock = prod.centralStock < prod.minAlert;

                return (
                  <tr key={prod.sku} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0b1c30]">{prod.name}</div>
                      <div className="font-mono text-[11px] text-[#0051d5]">{prod.sku}</div>
                    </td>

                    <td className="py-3 px-4 text-[#45464d]">
                      <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[10px] font-medium text-[#0b1c30]">
                        {prod.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[#45464d]">
                      ${prod.unitCost.toFixed(2)} MXN
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0b1c30]">
                      ${prod.consignPrice.toFixed(2)} MXN
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[#069669] font-semibold">
                      {margin}%
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {prod.centralStock.toLocaleString()} uds
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0051d5]">
                      {prod.consignedStock.toLocaleString()} uds
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-[#45464d]">
                      {prod.inTransitStock} uds
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          Alerta Resurtido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Óptimo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
