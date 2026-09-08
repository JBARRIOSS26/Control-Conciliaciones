import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Download, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  CheckCircle2,
  FileSpreadsheet,
  Edit3,
  Clock,
  Warehouse,
  Truck,
  Filter
} from 'lucide-react';
import { Product } from '../types';
import { UserPermissions } from '../utils/permissions';

interface CatalogViewProps {
  products: Product[];
  permissions: UserPermissions;
  onOpenDelivery: () => void;
  onOpenNewProduct: () => void;
  onOpenImportExcel: () => void;
  onOpenEditProduct: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  permissions,
  onOpenDelivery,
  onOpenNewProduct,
  onOpenImportExcel,
  onOpenEditProduct,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'alert' | 'ok'>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
      
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const isLow = p.centralStock < p.minAlert;
      const matchStock = stockStatusFilter === 'all' || (stockStatusFilter === 'alert' ? isLow : !isLow);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockStatusFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const totalCentralStock = useMemo(() => {
    return products.reduce((acc, p) => acc + p.centralStock, 0);
  }, [products]);

  const totalConsignedStock = useMemo(() => {
    return products.reduce((acc, p) => acc + p.consignedStock, 0);
  }, [products]);

  const totalCentralValueCost = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.centralStock * p.unitCost), 0);
  }, [products]);

  const totalCustodyValuePVP = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.consignedStock * p.consignPrice), 0);
  }, [products]);

  const avgCentralAge = useMemo(() => {
    if (products.length === 0) return 0;
    const sum = products.reduce((acc, p) => acc + (p.centralAgeDays || 30), 0);
    return Math.round(sum / products.length);
  }, [products]);

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] uppercase tracking-wider">
            <span>Gestión del Almacén Central (Origen)</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">{products.length} SKUs Registrados en Catálogo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Almacén Central y Catálogo de Artículos
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {permissions.canImportExcel && (
            <button
              type="button"
              onClick={onOpenImportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#dce9ff] text-xs font-semibold text-[#0051d5] hover:bg-[#eff4ff] transition-colors cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#069669]" />
              <span>Importación Masiva (Excel/CSV)</span>
            </button>
          )}

          {permissions.canCreateProduct && (
            <button
              type="button"
              onClick={onOpenNewProduct}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0b1c30] text-white text-xs font-semibold hover:bg-[#1e293b] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ingreso Manual 1 a 1</span>
            </button>
          )}

          {permissions.canDispatchConsignment && (
            <button
              type="button"
              onClick={onOpenDelivery}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] transition-colors cursor-pointer shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>Despachar a Clientes</span>
            </button>
          )}
        </div>
      </div>

      {/* Read-Only Notice for Billing / Accounting Role */}
      {!permissions.canCreateProduct && (
        <div className="p-3.5 rounded-xl bg-[#fff8e1] border border-[#fde68a] text-[#b45309] text-xs flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Modo Consulta Contable ({permissions.roleBadgeText}):</strong> Este catálogo se presenta en modo solo lectura para consulta de existencias, PVP y SKUs. La creación, edición y carga de inventario físico corresponde a Almacén Central.
          </span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Stock en Bodega Central (Origen)</span>
            <div className="text-2xl font-bold text-[#0b1c30] font-mono mt-1">
              {totalCentralStock.toLocaleString()} uds.
            </div>
            <span className="text-[11px] text-[#0051d5] font-medium">
              Valuado a Costo: ${totalCentralValueCost.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#131b2e] text-white flex items-center justify-center">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Stock en Custodia (Clientes)</span>
            <div className="text-2xl font-bold text-[#0051d5] font-mono mt-1">
              {totalConsignedStock.toLocaleString()} uds.
            </div>
            <span className="text-[11px] text-[#45464d]">
              En sub-almacenes virtuales activos
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Valor en Consignación (PVP)</span>
            <div className="text-2xl font-bold text-[#069669] font-mono mt-1">
              ${totalCustodyValuePVP.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-[#069669] font-medium">Importe total a liquidar</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] text-[#069669] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Edad Inventario Central (Regla 3.6)</span>
            <div className="text-2xl font-bold text-[#0b1c30] font-mono mt-1">
              {avgCentralAge} días
            </div>
            <span className="text-[11px] text-[#45464d]">
              Permanencia promedio antes de rotar
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f8f9ff] text-[#0b1c30] border border-[#dce9ff] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#45464d]" />
          <input
            type="text"
            placeholder="Buscar por SKU, nombre, descripción o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#eff4ff] text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#76777d] border border-transparent focus:border-[#0051d5] focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-[#eff4ff] text-xs font-medium text-[#0b1c30] border border-transparent focus:border-[#0051d5] focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">Estado de Stock (Todos)</option>
            <option value="alert">En Alerta de Stock Matriz</option>
            <option value="ok">Stock Central Óptimo</option>
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
                <th className="py-3 px-4">Categoría / Propiedades</th>
                <th className="py-3 px-4 text-right">Costo Matriz</th>
                <th className="py-3 px-4 text-right">Precio Consig.</th>
                <th className="py-3 px-4 text-right">Margen</th>
                <th className="py-3 px-4 text-right">Stock Central</th>
                <th className="py-3 px-4 text-right">Consignado</th>
                <th className="py-3 px-4 text-center">Edad Central (Regla 3.6)</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredProducts.map((prod) => {
                const margin = Math.round(((prod.consignPrice - prod.unitCost) / prod.consignPrice) * 100);
                const isLowStock = prod.centralStock < prod.minAlert;
                const ageDays = prod.centralAgeDays || 30;

                return (
                  <tr key={prod.sku} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0b1c30] text-sm">{prod.name}</div>
                      <div className="font-mono text-[11px] text-[#0051d5] font-bold">{prod.sku}</div>
                      {prod.description && (
                        <div className="text-[11px] text-[#76777d] truncate max-w-xs">{prod.description}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#45464d]">
                      <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[10px] font-medium text-[#0b1c30]">
                        {prod.category}
                      </span>
                      {prod.properties?.color && (
                        <div className="text-[10px] text-[#76777d] mt-0.5">
                          {prod.properties.color} {prod.properties.size ? `• ${prod.properties.size}` : ''}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[#45464d]">
                      ${prod.unitCost.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0b1c30]">
                      ${prod.consignPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[#069669] font-semibold">
                      {margin}%
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      <span className={`font-bold ${isLowStock ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}`}>
                        {prod.centralStock.toLocaleString()} uds
                      </span>
                      {isLowStock && (
                        <div className="text-[10px] text-[#ba1a1a] font-sans flex items-center justify-end gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Alerta (&lt;{prod.minAlert})</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0051d5]">
                      {prod.consignedStock.toLocaleString()} uds
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        ageDays > 60 ? 'bg-[#ffdad6] text-[#ba1a1a]' :
                        ageDays > 30 ? 'bg-[#fff8e1] text-[#b45309]' :
                        'bg-[#ecfdf5] text-[#047857]'
                      }`}>
                        {ageDays} días
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {permissions.canEditProduct ? (
                        <button
                          type="button"
                          onClick={() => onOpenEditProduct(prod)}
                          className="p-1.5 rounded-lg text-[#0051d5] hover:bg-[#eff4ff] transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#76777d] italic">Solo lectura</span>
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
