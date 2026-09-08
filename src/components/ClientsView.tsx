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
  CreditCard,
  Warehouse,
  Undo2
} from 'lucide-react';
import { Client } from '../types';
import { UserPermissions } from '../utils/permissions';

interface ClientsViewProps {
  clients: Client[];
  permissions: UserPermissions;
  onOpenReconcile: (client: Client) => void;
  onOpenDelivery: (client: Client) => void;
  onOpenReturn?: (client: Client) => void;
  onOpenSaleReport: (client: Client) => void;
  onOpenClientDetail: (client: Client) => void;
  onOpenNewClient?: () => void;
  initialFilter?: string;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  permissions,
  onOpenReconcile,
  onOpenDelivery,
  onOpenReturn,
  onOpenSaleReport,
  onOpenClientDetail,
  onOpenNewClient,
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
        c.virtualWarehouseCode.toLowerCase().includes(search.toLowerCase()) ||
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
            <span>Directorio de Consignatarios & Sub-almacenes Virtuales</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">{clients.length} Puntos de Venta Activos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Mantenimiento de Clientes y Consignaciones
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {permissions.canCreateClient && onOpenNewClient && (
            <button
              type="button"
              onClick={onOpenNewClient}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Consignatario</span>
            </button>
          )}

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
            placeholder="Buscar por cliente, sucursal, sub-almacén (ALM-VIR), contrato o contacto..."
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
        </div>
      </div>

      {/* View Modes */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const isAlert = client.auditStatus === 'corte_requerido';
            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#eff4ff] text-[#0051d5] font-bold text-sm flex items-center justify-center border border-[#dce9ff]">
                        {client.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">
                          {client.name}
                        </h3>
                        <span className="text-[11px] text-[#45464d] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {client.branch}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      client.auditStatus === 'al_dia' ? 'bg-[#ecfdf5] text-[#047857]' :
                      client.auditStatus === 'corte_requerido' ? 'bg-[#ffdad6] text-[#ba1a1a]' :
                      'bg-[#fff8e1] text-[#b45309]'
                    }`}>
                      {client.auditStatus === 'al_dia' ? 'Al día' :
                       client.auditStatus === 'corte_requerido' ? 'Corte Urgente' : 'Revisión'}
                    </span>
                  </div>

                  {/* Virtual Warehouse Pill */}
                  <div className="mb-4 px-2.5 py-1.5 rounded-lg bg-[#f8f9ff] border border-[#dce9ff] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#0051d5] font-mono font-bold">
                      <Warehouse className="w-3.5 h-3.5" />
                      <span>{client.virtualWarehouseCode}</span>
                    </div>
                    <span className="text-[10px] text-[#45464d] truncate max-w-[150px]">
                      {client.type}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#eff4ff]/40 rounded-xl mb-4 text-center">
                    <div>
                      <span className="text-[10px] text-[#45464d] block font-medium">Entregadas</span>
                      <span className="font-mono font-bold text-xs text-[#0b1c30]">
                        {client.totalDelivered.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#069669] block font-medium">Vendidas</span>
                      <span className="font-mono font-bold text-xs text-[#069669]">
                        {client.salesReconciled.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#0051d5] block font-medium">En Custodia</span>
                      <span className="font-mono font-bold text-xs text-[#0051d5]">
                        {client.remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1 text-xs text-[#45464d] mb-4">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#76777d]" />
                      <span className="truncate">{client.phone} • {client.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#76777d]" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (Envíos, Devoluciones, Remisiones) */}
                <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center gap-1.5">
                  {permissions.canDispatchConsignment && (
                    <button
                      type="button"
                      onClick={() => onOpenDelivery(client)}
                      className="flex-1 py-1.5 px-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Despachar mercancía con Vale de Entrega"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Despacho</span>
                    </button>
                  )}

                  {permissions.canReturnToCentral && (
                    <button
                      type="button"
                      onClick={() => onOpenReturn ? onOpenReturn(client) : onOpenClientDetail(client)}
                      className="flex-1 py-1.5 px-2 bg-[#fff1f0] hover:bg-[#ffdcd9] text-[#ba1a1a] font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Retornar mercancía a Almacén Central"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Devolver</span>
                    </button>
                  )}

                  {permissions.canEmitRemissionSale && (
                    <button
                      type="button"
                      onClick={() => onOpenSaleReport(client)}
                      className="flex-1 py-1.5 px-2 bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#047857] font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Legalizar venta con Nota de Remisión a Facturación"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Remisión</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenClientDetail(client)}
                    className="py-1.5 px-2 bg-white hover:bg-[#f8f9ff] text-[#45464d] font-semibold text-[11px] rounded-lg border border-[#e5eeff] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="Ver detalle del cliente"
                  >
                    <span>Detalle</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table */
        <div className="bg-white rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                  <th className="py-3 px-4">Consignatario</th>
                  <th className="py-3 px-4">Sub-almacén Virtual</th>
                  <th className="py-3 px-4 text-right">Total Despachado</th>
                  <th className="py-3 px-4 text-right">Venta Legalizada</th>
                  <th className="py-3 px-4 text-right">Devuelto a Central</th>
                  <th className="py-3 px-4 text-right">Saldo en Custodia</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0b1c30]">{client.name}</div>
                      <div className="text-[11px] text-[#45464d]">{client.branch} • {client.contract}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#0051d5] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                        {client.virtualWarehouseCode}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {client.totalDelivered.toLocaleString()} uds
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#069669]">
                      {client.salesReconciled.toLocaleString()} uds
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[#ba1a1a]">
                      {(client.totalReturned || 0).toLocaleString()} uds
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0051d5]">
                      {client.remainingBalance.toLocaleString()} uds
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        client.auditStatus === 'al_dia' ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}>
                        {client.auditStatus === 'al_dia' ? 'Al día' : 'Corte req.'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      {permissions.canDispatchConsignment && (
                        <button
                          onClick={() => onOpenDelivery(client)}
                          className="px-2 py-1 bg-[#eff4ff] text-[#0051d5] rounded hover:bg-[#dce9ff] text-[11px] font-semibold cursor-pointer"
                        >
                          Despachar
                        </button>
                      )}
                      {permissions.canReturnToCentral && (
                        <button
                          onClick={() => onOpenReturn ? onOpenReturn(client) : onOpenClientDetail(client)}
                          className="px-2 py-1 bg-[#fff1f0] text-[#ba1a1a] rounded hover:bg-[#ffdcd9] text-[11px] font-semibold cursor-pointer"
                        >
                          Devolver
                        </button>
                      )}
                      {permissions.canEmitRemissionSale && (
                        <button
                          onClick={() => onOpenSaleReport(client)}
                          className="px-2 py-1 bg-[#ecfdf5] text-[#047857] rounded hover:bg-[#d1fae5] text-[11px] font-semibold cursor-pointer"
                        >
                          Remisión
                        </button>
                      )}
                      <button
                        onClick={() => onOpenClientDetail(client)}
                        className="px-2 py-1 bg-white border border-[#e5eeff] text-[#45464d] rounded hover:bg-[#f8f9ff] text-[11px] font-semibold cursor-pointer"
                      >
                        Detalle
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
