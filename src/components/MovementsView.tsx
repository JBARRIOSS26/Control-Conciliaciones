import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  Download, 
  Truck, 
  CheckCircle, 
  PackageMinus, 
  SlidersHorizontal, 
  Calendar, 
  FileText,
  Filter,
  Printer,
  Undo2,
  Receipt,
  Warehouse
} from 'lucide-react';
import { Movement, MovementType, PhysicalVoucherData } from '../types';

interface MovementsViewProps {
  movements: Movement[];
  onOpenNewMovement: () => void;
  onReprintVoucher?: (voucher: PhysicalVoucherData) => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  onOpenNewMovement,
  onReprintVoucher,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchSearch =
        m.code.toLowerCase().includes(search.toLowerCase()) ||
        m.clientName.toLowerCase().includes(search.toLowerCase()) ||
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(search.toLowerCase())) ||
        (m.referenceDoc && m.referenceDoc.toLowerCase().includes(search.toLowerCase())) ||
        (m.sourceWarehouse && m.sourceWarehouse.toLowerCase().includes(search.toLowerCase())) ||
        (m.targetWarehouse && m.targetWarehouse.toLowerCase().includes(search.toLowerCase()));

      const matchType = typeFilter === 'all' || m.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [movements, search, typeFilter]);

  const handleExportKardexCSV = () => {
    const headers = ['Folio', 'Tipo', 'Fecha y Hora', 'Consignatario', 'SKU/Producto', 'Cantidad', 'Importe MXN', 'Origen', 'Destino', 'Estatus Facturacion', 'Notas'];
    const rows = filteredMovements.map(m => [
      `"${m.code}"`,
      `"${m.type}"`,
      `"${m.timestamp}"`,
      `"${m.clientName}"`,
      `"${m.productName}"`,
      m.quantity,
      m.amount || 0,
      `"${m.sourceWarehouse || 'Almacén Central'}"`,
      `"${m.targetWarehouse || m.clientName}"`,
      `"${m.billingStatus || 'N/A'}"`,
      `"${m.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kardex_movimientos_consignacion_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerReprint = (m: Movement) => {
    if (!onReprintVoucher) return;

    const isDelivery = m.type === 'entrega';
    const isReturn = m.type === 'devolucion' || m.type === 'devolucion_merma';
    const isRemision = m.type === 'venta_remision' || m.type === 'venta_cierre';

    const voucher: PhysicalVoucherData = {
      voucherType: isDelivery ? 'entrega' : isReturn ? 'devolucion' : 'remision',
      title: isDelivery ? 'Vale de Entrega a Consignación (Despacho Matriz)' :
             isReturn ? 'Soporte de Devolución Física a Almacén Central' :
             'Nota de Remisión y Baja por Venta Legalizada',
      folio: m.referenceDoc || m.code,
      date: m.date === 'Hoy' ? new Date().toLocaleDateString('es-MX') : m.date,
      clientName: m.clientName,
      clientId: m.clientId,
      branch: 'Sucursal Registrada',
      virtualWarehouseCode: m.targetWarehouse?.split(' ')[0] || 'ALM-VIR-001',
      virtualWarehouseName: m.targetWarehouse || `Sub-almacén ${m.clientName}`,
      items: [
        {
          sku: m.sku,
          productName: m.productName,
          quantity: Math.abs(m.quantity),
          unitPrice: m.amount ? m.amount / Math.abs(m.quantity || 1) : undefined,
          totalAmount: m.amount,
          notes: m.notes,
        }
      ],
      totalUnits: Math.abs(m.quantity),
      totalAmount: m.amount,
      notes: m.notes,
      deliveredBy: isReturn ? m.clientName : 'Almacén Central Matriz',
      receivedBy: isReturn ? 'Almacén Central (Custodia)' : m.clientName,
      billingChannelInfo: isRemision ? 'Canalizada de inmediato al Departamento de Facturación Fiscal' : undefined,
    };

    onReprintVoucher(voucher);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] uppercase tracking-wider">
            <span>Bitácora de Kardex y Vales Físicos</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">Trazabilidad Total de Movimientos Físicos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Registro de Movimientos y Vales
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportKardexCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#e5eeff] text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#0051d5]" />
            <span>Exportar Kardex</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewMovement}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0b1c30] text-white text-xs font-semibold hover:bg-[#1f2937] transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#45464d]" />
          <input
            type="text"
            placeholder="Buscar por folio (VALE-ENT, VALE-DEV, REM-VTA), cliente, SKU o almacén..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#eff4ff] text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#76777d] border border-transparent focus:border-[#0051d5] focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-[#45464d] mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Tipo:</span>
          </div>

          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#0051d5] text-white font-semibold'
                : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#e5eeff]'
            }`}
          >
            Todos ({movements.length})
          </button>

          <button
            onClick={() => setTypeFilter('entrega')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              typeFilter === 'entrega'
                ? 'bg-[#0051d5] text-white font-semibold'
                : 'bg-[#eff4ff] text-[#00174b] hover:bg-[#dbe1ff]'
            }`}
          >
            Entregas (VALE-ENT)
          </button>

          <button
            onClick={() => setTypeFilter('devolucion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              typeFilter === 'devolucion'
                ? 'bg-[#ba1a1a] text-white font-semibold'
                : 'bg-[#fff1f0] text-[#ba1a1a] hover:bg-[#ffdcd9]'
            }`}
          >
            Devoluciones (VALE-DEV)
          </button>

          <button
            onClick={() => setTypeFilter('venta_remision')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              typeFilter === 'venta_remision'
                ? 'bg-[#069669] text-white font-semibold'
                : 'bg-[#ecfdf5] text-[#047857] hover:bg-[#d1fae5]'
            }`}
          >
            Notas Remisión (Facturación)
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-3 px-4">Folio / Documento</th>
                <th className="py-3 px-4">Tipo Movimiento</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Consignatario</th>
                <th className="py-3 px-4">Artículo / SKU</th>
                <th className="py-3 px-4 text-right">Cantidad</th>
                <th className="py-3 px-4 text-right">Importe MXN</th>
                <th className="py-3 px-4">Trazabilidad / Estatus</th>
                <th className="py-3 px-4 text-right">Soporte Físico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredMovements.map((m) => {
                const isDelivery = m.type === 'entrega';
                const isReturn = m.type === 'devolucion' || m.type === 'devolucion_merma';
                const isRemision = m.type === 'venta_remision' || m.type === 'venta_cierre';

                return (
                  <tr key={m.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#0b1c30]">{m.code}</div>
                      {m.referenceDoc && (
                        <div className="text-[10px] font-mono text-[#0051d5]">{m.referenceDoc}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isDelivery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0051d5] text-[10px] font-bold">
                          <Truck className="w-3 h-3" />
                          <span>Entrega Consignación</span>
                        </span>
                      )}
                      {isReturn && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff1f0] text-[#ba1a1a] text-[10px] font-bold">
                          <Undo2 className="w-3 h-3" />
                          <span>Devolución a Central</span>
                        </span>
                      )}
                      {isRemision && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] text-[10px] font-bold">
                          <Receipt className="w-3 h-3" />
                          <span>Nota de Remisión</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#45464d] font-mono">
                      {m.timestamp}
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#0b1c30]">
                      {m.clientName}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#0b1c30]">{m.productName}</div>
                      <div className="font-mono text-[10px] text-[#76777d]">{m.sku}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={m.quantity > 0 ? 'text-[#0051d5]' : isReturn ? 'text-[#ba1a1a]' : 'text-[#069669]'}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} uds
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#069669]">
                      {m.amount ? `$${m.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                    </td>

                    <td className="py-3 px-4 text-[11px]">
                      {m.billingStatus === 'canalizada_facturacion' && (
                        <span className="px-2 py-0.5 rounded bg-[#ecfdf5] text-[#069669] font-bold text-[10px] block w-fit">
                          Canalizada a Facturación
                        </span>
                      )}
                      {m.billingStatus === 'facturada' && (
                        <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0051d5] font-bold text-[10px] block w-fit">
                          Facturada
                        </span>
                      )}
                      {m.sourceWarehouse && (
                        <span className="text-[10px] text-[#45464d] block mt-0.5">
                          {m.sourceWarehouse} &rarr; {m.targetWarehouse || 'Destino'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {onReprintVoucher && (
                        <button
                          type="button"
                          onClick={() => handleTriggerReprint(m)}
                          className="p-1.5 rounded-lg text-[#0051d5] hover:bg-[#eff4ff] transition-colors inline-flex items-center gap-1 font-semibold text-xs cursor-pointer"
                          title="Imprimir soporte oficial firmado"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Vale Físico</span>
                        </button>
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
