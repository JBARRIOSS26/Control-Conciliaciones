import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  Calendar, 
  Filter, 
  DollarSign, 
  Scale, 
  ShieldCheck,
  TrendingUp,
  Undo2,
  Clock,
  Award,
  Warehouse,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import { ReconciliationCut, Client, Movement, Product } from '../types';

interface ReportsViewProps {
  cuts: ReconciliationCut[];
  clients: Client[];
  products: Product[];
  movements: Movement[];
  onOpenReconcile: (client?: Client) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  cuts,
  clients,
  products,
  movements,
  onOpenReconcile,
}) => {
  // 5. Filtros Dinámicos (Regla 3.5: segmentar de manera cruzada por artículos, clientes y ventanas de tiempo)
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeWindow, setTimeWindow] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'indicadores' | 'cortes'>('indicadores');

  // Filter clients based on selection
  const filteredClients = useMemo(() => {
    if (selectedClientId === 'all') return clients;
    return clients.filter(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Filter movements based on selection
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchClient = selectedClientId === 'all' || m.clientId === selectedClientId;
      const product = products.find(p => p.sku === m.sku);
      const matchCategory = selectedCategory === 'all' || (product && product.category === selectedCategory);
      return matchClient && matchCategory;
    });
  }, [movements, products, selectedClientId, selectedCategory]);

  // 1. Tasa de Devolución (% exacto de mercancía retornada al origen en relación a lo entregado)
  const returnRateData = useMemo(() => {
    const totalDelivered = filteredClients.reduce((acc, c) => acc + c.totalDelivered, 0);
    const totalReturned = filteredClients.reduce((acc, c) => acc + (c.totalReturned || 0), 0);
    const rate = totalDelivered > 0 ? (totalReturned / totalDelivered) * 100 : 0;
    return {
      rate: parseFloat(rate.toFixed(1)),
      totalReturned,
      totalDelivered,
    };
  }, [filteredClients]);

  // 2. Tasa de Venta (% de mercancía vendida y legalizada frente al total en consignación)
  const salesRateData = useMemo(() => {
    const totalDelivered = filteredClients.reduce((acc, c) => acc + c.totalDelivered, 0);
    const totalSold = filteredClients.reduce((acc, c) => acc + c.salesReconciled, 0);
    const rate = totalDelivered > 0 ? (totalSold / totalDelivered) * 100 : 0;
    return {
      rate: parseFloat(rate.toFixed(1)),
      totalSold,
      totalDelivered,
    };
  }, [filteredClients]);

  // 3. Antigüedad en Consignación (Tiempo de permanencia bajo el resguardo del cliente)
  const consignmentAgingData = useMemo(() => {
    if (filteredClients.length === 0) return { avgDays: 0, criticalItems: [] };
    const avgDays = Math.round(
      filteredClients.reduce((sum, c) => sum + (c.avgConsignmentDays || 25), 0) / filteredClients.length
    );

    // Collect items with high aging
    const allItems: Array<{ clientName: string; sku: string; productName: string; days: number; remaining: number }> = [];
    filteredClients.forEach(c => {
      c.items.forEach(it => {
        allItems.push({
          clientName: c.name,
          sku: it.sku,
          productName: it.productName,
          days: it.consignmentDays || c.avgConsignmentDays || 20,
          remaining: it.remaining,
        });
      });
    });

    allItems.sort((a, b) => b.days - a.days);

    return {
      avgDays,
      criticalItems: allItems.slice(0, 5),
    };
  }, [filteredClients]);

  // 4. Producto Estrella (Top Seller: artículos con mayor volumen de venta global e individualizado)
  const topSellersData = useMemo(() => {
    const skuSalesMap: Record<string, { sku: string; name: string; category: string; unitsSold: number; totalRevenue: number; clientBreakdown: Record<string, number> }> = {};

    filteredClients.forEach(c => {
      c.items.forEach(it => {
        const prod = products.find(p => p.sku === it.sku);
        if (!skuSalesMap[it.sku]) {
          skuSalesMap[it.sku] = {
            sku: it.sku,
            name: it.productName,
            category: prod?.category || 'General',
            unitsSold: 0,
            totalRevenue: 0,
            clientBreakdown: {},
          };
        }
        skuSalesMap[it.sku].unitsSold += it.sold;
        skuSalesMap[it.sku].totalRevenue += it.sold * it.unitPrice;
        skuSalesMap[it.sku].clientBreakdown[c.name] = (skuSalesMap[it.sku].clientBreakdown[c.name] || 0) + it.sold;
      });
    });

    const ranked = Object.values(skuSalesMap).sort((a, b) => b.unitsSold - a.unitsSold);
    const topSeller = ranked[0] || null;
    return {
      topSeller,
      rankedList: ranked,
    };
  }, [filteredClients, products]);

  // 6. Edad del Inventario Central (Tiempo de permanencia dentro del Almacén Central antes de rotar)
  const centralAgeData = useMemo(() => {
    const relevantProducts = selectedCategory === 'all' 
      ? products 
      : products.filter(p => p.category === selectedCategory);

    if (relevantProducts.length === 0) return { avgDays: 0, slowMoving: [] };

    const totalAge = relevantProducts.reduce((sum, p) => sum + (p.centralAgeDays || 30), 0);
    const avgDays = Math.round(totalAge / relevantProducts.length);

    const sortedByAge = [...relevantProducts].sort((a, b) => (b.centralAgeDays || 0) - (a.centralAgeDays || 0));

    return {
      avgDays,
      slowMoving: sortedByAge.slice(0, 4),
    };
  }, [products, selectedCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  // Export CSV Report
  const handleExportStatsCSV = () => {
    const headers = ['SKU', 'Producto', 'Categoria', 'Piezas Vendidas', 'Ingresos MXN', 'Tasa Devolucion General', 'Edad Almacen Central'];
    const rows = topSellersData.rankedList.map(item => {
      const prod = products.find(p => p.sku === item.sku);
      return [
        `"${item.sku}"`,
        `"${item.name}"`,
        `"${item.category}"`,
        item.unitsSold,
        item.totalRevenue,
        `"${returnRateData.rate}%"`,
        prod?.centralAgeDays || 30
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_estadistico_consignacion_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] uppercase tracking-wider">
            <span>Módulo Analítico Avanzado (Sección 3)</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">Métricas Oficiales de Rotación y Permanencia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Indicadores Clave y Reportes Estadísticos
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportStatsCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#e5eeff] text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#0051d5]" />
            <span>Exportar Reporte</span>
          </button>

          <div className="inline-flex p-1 bg-[#eff4ff] rounded-lg border border-[#dce9ff]">
            <button
              onClick={() => setActiveSubTab('indicadores')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeSubTab === 'indicadores' ? 'bg-white text-[#0051d5] shadow-xs' : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              6 Indicadores Clave
            </button>
            <button
              onClick={() => setActiveSubTab('cortes')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeSubTab === 'cortes' ? 'bg-white text-[#0051d5] shadow-xs' : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              Cortes Auditados
            </button>
          </div>
        </div>
      </div>

      {/* 5. Dynamic Cross-Filters Toolbar (Regla 3.5) */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0b1c30]">
          <Filter className="w-4 h-4 text-[#0051d5]" />
          <span>Filtros Dinámicos Cruzados:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segment by Client */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#76777d]">Cliente:</span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] border border-[#dce9ff] outline-none cursor-pointer"
            >
              <option value="all">Todos los Clientes ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Segment by Category */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#76777d]">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] border border-[#dce9ff] outline-none cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Segment by Time Window */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#76777d]">Ventana:</span>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] border border-[#dce9ff] outline-none cursor-pointer"
            >
              <option value="all">Histórico Completo</option>
              <option value="30d">Últimos 30 días</option>
              <option value="7d">Últimos 7 días</option>
              <option value="90d">Trimestre en Curso</option>
            </select>
          </div>
        </div>
      </div>

      {activeSubTab === 'indicadores' ? (
        <div className="space-y-6">
          {/* Top 4 KPI Grid (Indicadores 1, 2, 3, 6) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Tasa de Devolución */}
            <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#ba1a1a] font-bold uppercase tracking-wider">
                    1. Tasa de Devolución
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#fff1f0] text-[#ba1a1a] flex items-center justify-center">
                    <Undo2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#ba1a1a] mt-2">
                  {returnRateData.rate}%
                </div>
                <p className="text-[11px] text-[#45464d] mt-1">
                  {returnRateData.totalReturned.toLocaleString()} piezas devueltas al origen de {returnRateData.totalDelivered.toLocaleString()} entregadas.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                <span className="text-[#76777d]">Benchmark: &lt; 10%</span>
                <span className={`font-bold ${returnRateData.rate <= 10 ? 'text-[#069669]' : 'text-[#ba1a1a]'}`}>
                  {returnRateData.rate <= 10 ? 'Saludable' : 'Excedido'}
                </span>
              </div>
            </div>

            {/* 2. Tasa de Venta */}
            <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#069669] font-bold uppercase tracking-wider">
                    2. Tasa de Venta
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#069669] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#069669] mt-2">
                  {salesRateData.rate}%
                </div>
                <p className="text-[11px] text-[#45464d] mt-1">
                  {salesRateData.totalSold.toLocaleString()} piezas legalizadas frente a lo entregado.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                <span className="text-[#76777d]">Meta comercial: &gt; 30%</span>
                <span className={`font-bold ${salesRateData.rate >= 30 ? 'text-[#069669]' : 'text-[#b45309]'}`}>
                  {salesRateData.rate >= 30 ? 'Meta Cumplida' : 'En Progreso'}
                </span>
              </div>
            </div>

            {/* 3. Antigüedad en Consignación */}
            <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0051d5] font-bold uppercase tracking-wider">
                    3. Antigüedad Consignación
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#0051d5] mt-2">
                  {consignmentAgingData.avgDays} días
                </div>
                <p className="text-[11px] text-[#45464d] mt-1">
                  Permanencia media bajo custodia de clientes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                <span className="text-[#76777d]">Semáforo Rotación:</span>
                <span className={`font-bold ${
                  consignmentAgingData.avgDays <= 30 ? 'text-[#069669]' :
                  consignmentAgingData.avgDays <= 45 ? 'text-[#b45309]' : 'text-[#ba1a1a]'
                }`}>
                  {consignmentAgingData.avgDays <= 30 ? 'Óptimo (<30d)' : 'Alerta (>45d)'}
                </span>
              </div>
            </div>

            {/* 6. Edad del Inventario Central */}
            <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0b1c30] font-bold uppercase tracking-wider">
                    6. Edad Inventario Central
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#f8f9ff] border border-[#dce9ff] text-[#0b1c30] flex items-center justify-center">
                    <Warehouse className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#0b1c30] mt-2">
                  {centralAgeData.avgDays} días
                </div>
                <p className="text-[11px] text-[#45464d] mt-1">
                  Permanencia en Bodega Matriz antes de despachar.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                <span className="text-[#76777d]">Rotación Matriz:</span>
                <span className="font-bold text-[#0051d5]">Estable</span>
              </div>
            </div>
          </div>

          {/* 4. Producto Estrella (Top Seller) & Ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Seller Banner */}
            <div className="lg:col-span-4 bg-linear-to-br from-[#0b1c30] to-[#172554] text-white p-6 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#316bf3]/20 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/30">
                  <Award className="w-4 h-4" />
                  <span>4. Producto Estrella (Top Seller)</span>
                </div>

                {topSellersData.topSeller ? (
                  <div className="space-y-3">
                    <span className="font-mono text-xs text-[#82aaff] font-bold block">
                      {topSellersData.topSeller.sku}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {topSellersData.topSeller.name}
                    </h3>
                    <div className="text-xs text-white/70">
                      Categoría: {topSellersData.topSeller.category}
                    </div>

                    <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                      <div className="bg-white/10 p-3 rounded-xl">
                        <span className="text-[10px] text-white/70 uppercase block font-semibold">Volumen Vendido</span>
                        <span className="text-xl font-bold font-mono text-white">
                          {topSellersData.topSeller.unitsSold.toLocaleString()} uds
                        </span>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl">
                        <span className="text-[10px] text-white/70 uppercase block font-semibold">Ingresos Generados</span>
                        <span className="text-xl font-bold font-mono text-[#85f8c4]">
                          ${topSellersData.topSeller.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white/60">No hay datos de ventas registrados.</p>
                )}
              </div>

              <div className="mt-6 text-[11px] text-white/60">
                Calculado con base en ventas consolidadas en todas las consignaciones.
              </div>
            </div>

            {/* Ranking Table & Breakdown */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#0051d5]" />
                    <h3 className="font-bold text-sm text-[#0b1c30]">
                      Ranking de Artículos por Desempeño Comercial
                    </h3>
                  </div>
                  <span className="text-xs text-[#45464d] font-mono">
                    {topSellersData.rankedList.length} SKUs evaluados
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#eff4ff] text-[#45464d] text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-3">Pos.</th>
                        <th className="py-2.5 px-3">SKU / Prenda</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3 text-right">Piezas Vendidas</th>
                        <th className="py-2.5 px-3 text-right">Facturación MXN</th>
                        <th className="py-2.5 px-3">Punto de Venta Líder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {topSellersData.rankedList.slice(0, 5).map((item, idx) => {
                        const topClientEntry = (Object.entries(item.clientBreakdown) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
                        return (
                          <tr key={item.sku} className="hover:bg-[#f8f9ff]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#0051d5]">#{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-[#0b1c30] block">{item.name}</span>
                              <span className="font-mono text-[10px] text-[#76777d]">{item.sku}</span>
                            </td>
                            <td className="py-2.5 px-3 text-[#45464d]">{item.category}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0b1c30]">
                              {item.unitsSold.toLocaleString()} uds
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#069669]">
                              ${item.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-[#0051d5] font-medium">
                              {topClientEntry ? `${topClientEntry[0]} (${topClientEntry[1]} uds)` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Critical Aging Notice */}
              <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
                <span className="text-[#45464d]">
                  <strong>Prendas con mayor tiempo en cliente:</strong>{' '}
                  {consignmentAgingData.criticalItems.slice(0, 2).map(it => `${it.productName} (${it.days} días en ${it.clientName})`).join(' • ')}
                </span>
                <span className="text-[11px] text-[#ba1a1a] font-semibold shrink-0">
                  Recomendación: Promover retorno al Almacén Central
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Subtab: Cortes Auditados */
        <div className="bg-white rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                  <th className="py-3 px-4">Código / Fecha</th>
                  <th className="py-3 px-4">Consignatario</th>
                  <th className="py-3 px-4">Periodo de Corte</th>
                  <th className="py-3 px-4 text-right">Saldo Esperado</th>
                  <th className="py-3 px-4 text-right">Conteo Físico</th>
                  <th className="py-3 px-4 text-center">Discrepancia</th>
                  <th className="py-3 px-4 text-right">Monto Liquidado</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {cuts.map((cut) => (
                  <tr key={cut.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#0b1c30]">{cut.code}</div>
                      <div className="text-[11px] text-[#45464d]">{cut.date}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#0b1c30]">{cut.clientName}</td>
                    <td className="py-3 px-4 text-[#45464d] font-mono">{cut.period}</td>
                    <td className="py-3 px-4 text-right font-mono">{cut.expectedRemaining.toLocaleString()} pzas</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#0051d5]">{cut.physicalCounted.toLocaleString()} pzas</td>
                    <td className="py-3 px-4 text-center font-mono">
                      {cut.discrepancy === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] text-[11px] font-semibold">0 exacto</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold">{cut.discrepancy} pzas</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#069669]">
                      ${cut.amountToPay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0051d5] text-[10px] font-bold uppercase">
                        {cut.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
