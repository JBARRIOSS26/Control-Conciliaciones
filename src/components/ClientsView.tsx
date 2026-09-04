import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  FileSpreadsheet, 
  Truck, 
  Receipt, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Filter,
  CreditCard
} from 'lucide-react';
import { Client } from '../types';

interface ClientsViewProps {
  clients: Client[];
  onOpenReconcile: (client: Client) => void;
  onOpenDelivery: (client: Client) => void;
  onOpenSaleReport: (client: Client) => void;
  onOpenClientDetail: (client: Client) => void;
  initialFilter?: string;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onOpenReconcile,
  onOpenDelivery,
  onOpenSaleReport,
  onOpenClientDetail,
  initialFilter,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter || 'all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchText = 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.branch.toLowerCase().includes(search.toLowerCase()) ||
        c.contract.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = selectedStatus === 'all' || c.auditStatus === selectedStatus;
      return matchText && matchStatus;
    });
  }, [clients, search, selectedStatus]);

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] uppercase tracking-wider">
            <span>Directorio de Consignatarios</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">{clients.length} Puntos de Venta Registrados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Clientes y Consignaciones
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex p-1 bg-[#eff4ff] rounded-lg border border-[#dce9ff]">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-[#0051d5] shadow-xs' : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#0051d5] shadow-xs' : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              Tabla Detallada
            </button>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#45464d]" />
          <input
            type="text"
            placeholder="Buscar por cliente, sucursal, contrato o contacto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#eff4ff] text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#76777d] border border-transparent focus:border-[#0051d5] focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-[#45464d] mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtro:</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-[#0051d5] text-white font-semibold'
                : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#e5eeff]'
            }`}
          >
            Todos ({clients.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('al_dia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedStatus === 'al_dia'
                ? 'bg-[#069669] text-white font-semibold'
                : 'bg-[#ecfdf5] text-[#047857] hover:bg-[#d1fae5]'
            }`}
          >
            Al día
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('corte_requerido')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedStatus === 'corte_requerido'
                ? 'bg-[#ba1a1a] text-white font-semibold'
                : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffc9c4]'
            }`}
          >
            Corte Requerido (&gt; 15 días)
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus('pendiente_revision')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedStatus === 'pendiente_revision'
                ? 'bg-[#45464d] text-white font-semibold'
                : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#e5eeff]'
            }`}
          >
            Pendiente Revisión
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const isAlert = client.auditStatus === 'corte_requerido';
            const isPending = client.auditStatus === 'pendiente_revision';

            return (
              <div
                key={client.id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isAlert 
                    ? 'border-[#ffdad6] hover:border-[#ba1a1a]' 
                    : 'border-[#e5eeff] hover:border-[#0051d5]/40'
                }`}
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#00174b] font-bold text-sm">
                        {client.initials}
                      </div>
                      <div>
                        <h3 
                          onClick={() => onOpenClientDetail(client)}
                          className="font-bold text-[#0b1c30] text-sm sm:text-base hover:text-[#0051d5] cursor-pointer transition-colors"
                        >
                          {client.name}
                        </h3>
                        <p className="text-xs text-[#45464d]">{client.branch}</p>
                      </div>
                    </div>

                    {isAlert ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Corte Requerido
                      </span>
                    ) : isPending ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#dce9ff] text-[#0b1c30] text-[11px] font-semibold flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-[#76777d]" />
                        Revisión
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#047857] text-[11px] font-semibold flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-3 h-3 text-[#069669]" />
                        Al día
                      </span>
                    )}
                  </div>

                  {/* Contract & contact pills */}
                  <div className="flex flex-wrap items-center gap-2 py-2 border-y border-[#f1f5f9] text-xs text-[#45464d] mb-4">
                    <span className="bg-[#eff4ff] px-2 py-0.5 rounded font-mono text-[11px] text-[#0051d5] font-semibold">
                      {client.contract}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#76777d]" />
                      {client.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#76777d]" />
                      {client.contactPerson}
                    </span>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#eff4ff] rounded-lg mb-4 text-center">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#45464d]">Entregadas</span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-[#0b1c30]">
                        {client.totalDelivered.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#45464d]">Ventas Conc.</span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-[#069669]">
                        {client.salesReconciled.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#45464d]">Saldo en Calle</span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-[#0051d5]">
                        {client.remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Audit Timing indicator */}
                  <div className="flex items-center justify-between text-xs text-[#45464d] mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0051d5]" />
                      Último movimiento: <span className="font-mono text-[#0b1c30]">{client.lastMovementDate}</span>
                    </span>
                    <span className={`font-mono font-semibold ${isAlert ? 'text-[#ba1a1a]' : 'text-[#45464d]'}`}>
                      {client.daysWithoutCut} días sin corte
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
                  <button
                    type="button"
                    onClick={() => onOpenReconcile(client)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Conciliar Lote</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenSaleReport(client)}
                    className="p-2 rounded-lg bg-[#eff4ff] text-[#069669] hover:bg-[#ecfdf5] transition-colors cursor-pointer border border-[#dce9ff]"
                    title="Registrar Venta / Cierre"
                  >
                    <Receipt className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDelivery(client)}
                    className="p-2 rounded-lg bg-[#eff4ff] text-[#0051d5] hover:bg-[#e5eeff] transition-colors cursor-pointer border border-[#dce9ff]"
                    title="Registrar Entrega de Stock"
                  >
                    <Truck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                  <th className="py-3 px-4">Consignatario</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4 text-right">Límite Crédito</th>
                  <th className="py-3 px-4 text-right">Entregadas</th>
                  <th className="py-3 px-4 text-right">Conciliadas</th>
                  <th className="py-3 px-4 text-right">Saldo Actual</th>
                  <th className="py-3 px-4 text-center">Auditoría</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-[#dbe1ff] text-[#00174b] font-bold text-xs flex items-center justify-center">
                          {client.initials}
                        </div>
                        <div>
                          <button
                            onClick={() => onOpenClientDetail(client)}
                            className="font-bold text-[#0b1c30] hover:text-[#0051d5] text-left cursor-pointer"
                          >
                            {client.name}
                          </button>
                          <div className="text-[11px] text-[#45464d]">{client.branch}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#45464d]">
                      <div>{client.contactPerson}</div>
                      <div className="font-mono text-[11px]">{client.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      ${client.creditLimit.toLocaleString()} MXN
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {client.totalDelivered.toLocaleString()} pzas
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#069669] font-medium">
                      {client.salesReconciled.toLocaleString()} pzas
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0051d5]">
                      {client.remainingBalance.toLocaleString()} pzas
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        client.auditStatus === 'corte_requerido' 
                          ? 'bg-[#ffdad6] text-[#ba1a1a]' 
                          : client.auditStatus === 'pendiente_revision'
                          ? 'bg-[#dce9ff] text-[#0b1c30]'
                          : 'bg-[#ecfdf5] text-[#047857]'
                      }`}>
                        {client.auditStatus === 'corte_requerido' ? 'Corte Requerido' : client.auditStatus === 'pendiente_revision' ? 'Revisión' : 'Al día'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenReconcile(client)}
                        className="px-2.5 py-1 rounded bg-[#eff4ff] text-[#0051d5] hover:bg-[#0051d5] hover:text-white font-semibold transition-colors cursor-pointer"
                      >
                        Conciliar
                      </button>
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
