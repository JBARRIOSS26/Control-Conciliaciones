import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Receipt, 
  Truck, 
  TableProperties, 
  Search, 
  Download, 
  SlidersHorizontal, 
  PieChart, 
  History, 
  ArrowRight,
  PackageMinus,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Client, Movement } from '../types';

interface DashboardViewProps {
  clients: Client[];
  movements: Movement[];
  onOpenReconcile: (client?: Client) => void;
  onOpenSaleReport: (client?: Client) => void;
  onOpenDelivery: (client?: Client) => void;
  onOpenClientDetail: (client: Client) => void;
  onNavigateToMovements: () => void;
  onNavigateToClients: (filterStatus?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  movements,
  onOpenReconcile,
  onOpenSaleReport,
  onOpenDelivery,
  onOpenClientDetail,
  onNavigateToMovements,
  onNavigateToClients,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'al_dia' | 'corte_requerido' | 'pendiente_revision'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtered clients for the table
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.items.some(item => item.sku.toLowerCase().includes(searchTerm.toLowerCase()) || item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || c.auditStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  // Paginated clients
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  // Computed totals for current view
  const totalStreetPieces = useMemo(() => {
    return clients.reduce((sum, c) => sum + c.remainingBalance, 0);
  }, [clients]);

  const totalDeliveredPieces = useMemo(() => {
    return clients.reduce((sum, c) => sum + c.totalDelivered, 0);
  }, [clients]);

  const totalReconciledSales = useMemo(() => {
    return clients.reduce((sum, c) => sum + c.salesReconciled, 0);
  }, [clients]);

  const clientsWithPendingAudit = useMemo(() => {
    return clients.filter(c => c.auditStatus === 'corte_requerido' || c.daysWithoutCut > 14);
  }, [clients]);

  // CSV Export function
  const handleExportCSV = () => {
    const headers = ['Cliente', 'Sucursal', 'Contrato', 'Ultimo Movimiento', 'Total Entregadas', 'Ventas Conciliadas', 'Saldo Remanente', 'Dias Sin Corte', 'Estado Auditoria'];
    const rows = filteredClients.map(c => [
      `"${c.name}"`,
      `"${c.branch}"`,
      `"${c.contract}"`,
      `"${c.lastMovementDate}"`,
      c.totalDelivered,
      c.salesReconciled,
      c.remainingBalance,
      c.daysWithoutCut,
      `"${c.auditStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `consignacion_inventario_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Sub-header & Quick Action Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="uppercase tracking-wider text-[#0051d5]">Panel de Control Operativo</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">Actualizado hace 8 min</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Conciliación y Mercancía en Consignación
          </h1>
        </div>

        {/* Direct Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            id="btn-hoja-conciliacion"
            type="button"
            onClick={() => onOpenReconcile()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-white text-[#0b1c30] border border-[#e5eeff] shadow-xs hover:bg-[#eff4ff] hover:border-[#0051d5]/30 transition-all font-medium text-xs sm:text-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0051d5]" />
            <span>Hoja de Conciliación</span>
          </button>

          <button
            id="btn-registrar-venta-cierre"
            type="button"
            onClick={() => onOpenSaleReport()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-white text-[#0b1c30] border border-[#e5eeff] shadow-xs hover:bg-[#eff4ff] hover:border-[#069669]/30 transition-all font-medium text-xs sm:text-sm cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-[#069669]" />
            <span>Registrar Venta/Cierre</span>
          </button>

          <button
            id="btn-registrar-entrega-cliente"
            type="button"
            onClick={() => onOpenDelivery()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0051d5] text-white shadow-xs hover:bg-[#003ea8] transition-all font-semibold text-xs sm:text-sm cursor-pointer active:scale-98"
          >
            <Truck className="w-4 h-4 text-white" />
            <span>Registrar Entrega a Cliente</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Piezas en Calle */}
        <div className="bg-white rounded-xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#0051d5]/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#45464d]">Piezas en Calle / Consignación</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight font-mono">
              14,850 <span className="text-xs text-[#45464d] font-normal font-sans">uds.</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#0051d5] font-bold" />
              <span className="font-semibold text-[#0051d5]">+320</span>
              <span className="text-[#45464d]">esta sem.</span>
            </div>
            <span className="text-[11px] text-[#45464d] font-medium">18 consignatarios</span>
          </div>
        </div>

        {/* Card 2: Valor en Custodia */}
        <div className="bg-white rounded-xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between relative overflow-hidden hover:border-[#0051d5]/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#45464d]">Valor en Custodia Activa</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight font-mono">
              $184,200<span className="text-lg text-[#45464d] font-normal">.00</span>{' '}
              <span className="text-xs text-[#45464d] font-medium font-sans">MXN</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#45464d]">
              <span className="w-2 h-2 rounded-full bg-[#0051d5]"></span>
              <span>Costo prom: $12.40/ud</span>
            </div>
            <span className="text-[#0051d5] font-semibold">100% asegurado</span>
          </div>
        </div>

        {/* Card 3: Ventas Reportadas */}
        <div className="bg-white rounded-xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between relative overflow-hidden hover:border-[#069669]/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#45464d]">Ventas Reportadas (Octubre)</span>
            <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#069669]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight font-mono">
              4,120 <span className="text-xs text-[#45464d] font-normal font-sans">piezas</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#069669] font-medium">
              <span className="font-semibold">$51,088.00</span>
              <span className="text-[#047857]">recaudado</span>
            </div>
            <span className="text-[#45464d]">78% de la meta</span>
          </div>
        </div>

        {/* Card 4: Cortes y Conciliaciones */}
        <div className="bg-white rounded-xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between relative overflow-hidden hover:border-[#ba1a1a]/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#45464d]">Cortes y Conciliaciones</span>
            <div className="w-8 h-8 rounded-lg bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-[#ba1a1a] tracking-tight font-mono">
              5 <span className="text-xs text-[#0b1c30] font-normal font-sans">clientes con corte pendiente</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6]/50 text-[#ba1a1a] font-medium">
              <AlertTriangle className="w-3 h-3 text-[#ba1a1a]" />
              <span>&gt; 15 días sin conciliar</span>
            </div>
            <button 
              type="button"
              onClick={() => onNavigateToClients('corte_requerido')}
              className="text-[#0051d5] hover:underline font-semibold cursor-pointer"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </div>

      {/* 3. Operational Status Table: Estado de Clientes y Mercancía en Custodia */}
      <div className="bg-white rounded-xl shadow-xs border border-[#e5eeff] flex flex-col overflow-hidden">
        {/* Table Header Toolbar */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
              <TableProperties className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0b1c30]">
                Estado de Clientes y Mercancía en Custodia
              </h2>
              <p className="text-xs text-[#45464d]">
                Control físico de existencias versus reportes liquidados por consignatario
              </p>
            </div>
          </div>

          {/* Filters & Quick Excel-like Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#45464d]" />
              <input
                id="search-client-input"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filtrar por cliente, SKU..."
                className="w-full pl-8.5 pr-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-xs sm:text-sm placeholder:text-[#76777d] border border-transparent focus:border-[#0051d5] focus:bg-white focus:outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-xs text-[#45464d] hover:text-[#0b1c30]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status quick toggle */}
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-xs font-medium border border-transparent focus:border-[#0051d5] focus:bg-white outline-none cursor-pointer"
              title="Filtrar por estado de auditoría"
            >
              <option value="all">Todos los estados</option>
              <option value="al_dia">Al día</option>
              <option value="corte_requerido">Corte Requerido</option>
              <option value="pendiente_revision">Pendiente Revisión</option>
            </select>

            <button
              id="btn-exportar-csv"
              type="button"
              onClick={handleExportCSV}
              className="p-2 rounded-lg bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30] hover:bg-[#e5eeff] transition-colors cursor-pointer"
              title="Exportar a Hoja de Cálculo (CSV)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateToClients()}
              className="p-2 rounded-lg bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30] hover:bg-[#e5eeff] transition-colors cursor-pointer"
              title="Ver vista avanzada de clientes"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-2.5 px-4">Cliente / Consignatario</th>
                <th className="py-2.5 px-4">Último Movimiento</th>
                <th className="py-2.5 px-4 text-right">Total Entregadas</th>
                <th className="py-2.5 px-4 text-right">Ventas Conciliadas</th>
                <th className="py-2.5 px-4 text-right">Saldo Remanente</th>
                <th className="py-2.5 px-4 text-center">Días sin Corte</th>
                <th className="py-2.5 px-4 text-center">Estado de Auditoría</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-xs text-[#0b1c30] divide-y divide-[#f1f5f9]">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#45464d]">
                    No se encontraron clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const isCorteRequerido = client.auditStatus === 'corte_requerido';
                  const isPendiente = client.auditStatus === 'pendiente_revision';

                  return (
                    <tr 
                      key={client.id}
                      className="hover:bg-[#eff4ff]/60 transition-colors group"
                    >
                      {/* Cliente */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-[#dbe1ff] flex items-center justify-center text-[#00174b] font-bold text-xs shrink-0">
                            {client.initials}
                          </div>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => onOpenClientDetail(client)}
                              className="font-semibold text-[#0b1c30] hover:text-[#0051d5] text-left transition-colors cursor-pointer flex items-center gap-1"
                            >
                              {client.name}
                            </button>
                            <span className="text-[11px] text-[#45464d]">
                              {client.branch}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Último Movimiento */}
                      <td className="py-3 px-4 text-[#45464d] font-mono text-xs whitespace-nowrap">
                        {client.lastMovementDate}
                      </td>

                      {/* Total Entregadas */}
                      <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                        {client.totalDelivered.toLocaleString()} <span className="text-[#45464d] text-[11px]">pzas</span>
                      </td>

                      {/* Ventas Conciliadas */}
                      <td className="py-3 px-4 text-right font-mono text-[#069669] font-medium whitespace-nowrap">
                        {client.salesReconciled.toLocaleString()} <span className="text-[#45464d] text-[11px]">pzas</span>
                      </td>

                      {/* Saldo Remanente */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0051d5] whitespace-nowrap">
                        {client.remainingBalance.toLocaleString()} <span className="text-[#45464d] text-[11px] font-normal">pzas</span>
                      </td>

                      {/* Días sin Corte */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span 
                          className={`px-2 py-0.5 rounded-full font-mono text-xs ${
                            client.daysWithoutCut > 15
                              ? 'bg-[#ffdad6]/60 text-[#ba1a1a] font-semibold'
                              : client.daysWithoutCut > 10
                              ? 'bg-[#dce9ff] text-[#0b1c30]'
                              : 'bg-[#eff4ff] text-[#0b1c30]'
                          }`}
                        >
                          {client.daysWithoutCut} {client.daysWithoutCut === 1 ? 'día' : 'días'}
                        </span>
                      </td>

                      {/* Estado de Auditoría */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isCorteRequerido ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffdad6]/60 text-[#ba1a1a] text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                            <span>Corte Requerido</span>
                          </span>
                        ) : isPendiente ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#76777d]"></span>
                            <span>Pendiente Revisión</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#069669]"></span>
                            <span>Al día</span>
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          id={`btn-conciliar-${client.id}`}
                          type="button"
                          onClick={() => onOpenReconcile(client)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isCorteRequerido
                              ? 'bg-[#dce9ff] text-[#0b1c30] hover:bg-[#0051d5] hover:text-white'
                              : 'bg-[#eff4ff] text-[#0051d5] hover:bg-[#0051d5] hover:text-white'
                          }`}
                        >
                          <span>Conciliar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Totals & Pagination */}
        <div className="p-4 bg-[#eff4ff] border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#45464d]">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Mostrando {paginatedClients.length} de {filteredClients.length} clientes activos
            </span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="font-semibold text-[#0b1c30]">
              Totales en Calle: {totalStreetPieces.toLocaleString()} uds. en balance activo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-pagina-anterior"
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-md bg-white text-[#0b1c30] border border-[#dce9ff] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f8f9ff] text-xs font-medium cursor-pointer"
            >
              Anterior
            </button>
            <span className="px-2 py-1 font-mono font-semibold text-[#0b1c30]">
              Pág {currentPage} de {totalPages}
            </span>
            <button
              id="btn-pagina-siguiente"
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-md bg-white text-[#0b1c30] border border-[#dce9ff] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f8f9ff] text-xs font-medium cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* 4. Comparative Analytics & Real-Time Log Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Widget 1: Inventory Balance Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#0051d5]" />
                <h3 className="text-sm font-semibold text-[#0b1c30]">Distribución Global de Inventario</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-[#45464d]">Total: 28,450 uds</span>
            </div>
            <p className="text-xs text-[#45464d] mb-4">
              Proporción física entre stock resguardado en almacén central versus saldo entregado a consignatarios.
            </p>

            {/* Visual Bar Ratio */}
            <div className="w-full h-3 rounded-full bg-[#e5eeff] flex overflow-hidden mb-4">
              <div 
                className="bg-[#0051d5] h-full transition-all" 
                style={{ width: '52.2%' }} 
                title="Consignado a Clientes: 52.2%"
              ></div>
              <div 
                className="bg-[#131b2e] h-full transition-all" 
                style={{ width: '43.8%' }} 
                title="Bodega Central: 43.8%"
              ></div>
              <div 
                className="bg-[#c6c6cd] h-full transition-all" 
                style={{ width: '4.0%' }} 
                title="En Tránsito: 4.0%"
              ></div>
            </div>

            {/* Metric Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#eff4ff]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#0051d5]"></span>
                  <span className="text-xs font-medium text-[#0b1c30]">Consignado a Clientes</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#0b1c30]">14,850 uds.</span>
                  <span className="text-[11px] text-[#45464d] font-semibold">52.2%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#eff4ff]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#131b2e]"></span>
                  <span className="text-xs font-medium text-[#0b1c30]">Bodega Central (Almacén Matriz)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#0b1c30]">12,460 uds.</span>
                  <span className="text-[11px] text-[#45464d] font-semibold">43.8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#eff4ff]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#c6c6cd]"></span>
                  <span className="text-xs font-medium text-[#0b1c30]">En Tránsito / Ruta de Recolección</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#0b1c30]">1,140 uds.</span>
                  <span className="text-[11px] text-[#45464d] font-semibold">4.0%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
            <span className="text-[#45464d]">Capacidad de custodia activa</span>
            <span className="font-semibold text-[#0051d5]">Saludable (68% cupo)</span>
          </div>
        </div>

        {/* Widget 2: Recent Movements Feed (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#0051d5]" />
                <h3 className="text-sm font-semibold text-[#0b1c30]">Últimos Movimientos Registrados</h3>
              </div>
              <span className="text-xs text-[#069669] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#069669] animate-pulse"></span>
                En tiempo real
              </span>
            </div>
            <p className="text-xs text-[#45464d] mb-4">
              Bitácora de entradas, entregas a piso de venta y reportes de mermas liquidadas.
            </p>

            {/* Movement Stream */}
            <div className="flex flex-col gap-2">
              {movements.slice(0, 3).map((mov) => {
                const isEntrega = mov.type === 'entrega';
                const isVenta = mov.type === 'venta_cierre';
                const isMerma = mov.type === 'devolucion_merma';

                return (
                  <div 
                    key={mov.id}
                    className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isEntrega 
                            ? 'bg-[#dbe1ff] text-[#00174b]' 
                            : isVenta 
                            ? 'bg-[#85f8c4] text-[#002114]' 
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {isEntrega && <Truck className="w-4 h-4" />}
                        {isVenta && <CheckCircle className="w-4 h-4" />}
                        {isMerma && <PackageMinus className="w-4 h-4" />}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#0b1c30]">
                            {isEntrega ? 'Entrega a Consignación' : isVenta ? 'Cierre Parcial / Venta Reportada' : 'Devolución / Merma de Exhibición'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-white text-[10px] text-[#45464d] border border-[#dce9ff] font-mono">
                            {mov.code}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#45464d]">
                          {mov.clientName} • {mov.productName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div 
                        className={`font-mono font-bold text-xs ${
                          isEntrega ? 'text-[#0b1c30]' : isVenta ? 'text-[#069669]' : 'text-[#ba1a1a]'
                        }`}
                      >
                        {isVenta && mov.amount ? `-$${mov.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : `${mov.quantity > 0 ? '+' : ''}${mov.quantity} uds`}
                      </div>
                      <span className="text-[10px] text-[#45464d]">{mov.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
            <button
              id="btn-ver-kardex-completo"
              type="button"
              onClick={onNavigateToMovements}
              className="text-[#0051d5] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver kardex completo de movimientos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[#45464d]">Sincronizado con Almacén Matriz</span>
          </div>
        </div>
      </div>
    </div>
  );
};
