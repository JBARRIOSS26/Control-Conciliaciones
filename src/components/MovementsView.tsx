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
  Filter
} from 'lucide-react';
import { Movement, MovementType } from '../types';

interface MovementsViewProps {
  movements: Movement[];
  onOpenNewMovement: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  onOpenNewMovement,
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
        (m.referenceDoc && m.referenceDoc.toLowerCase().includes(search.toLowerCase()));

      const matchType = typeFilter === 'all' || m.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [movements, search, typeFilter]);

  const handleExportKardexCSV = () => {
    const headers = ['Folio', 'Tipo', 'Fecha y Hora', 'Cliente', 'SKU/Producto', 'Cantidad', 'Importe MXN', 'Documento Ref', 'Notas'];
    const rows = filteredMovements.map(m => [
      `"${m.code}"`,
      `"${m.type}"`,
      `"${m.timestamp}"`,
      `"${m.clientName}"`,
      `"${m.productName}"`,
      m.quantity,
      m.amount || 0,
      `"${m.referenceDoc || ''}"`,
      `"${m.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kardex_movimientos_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span>Bitácora de Kardex</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">Sincronizado con Almacén Matriz</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Registro de Movimientos
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportKardexCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#e5eeff] text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors cursor-pointer"
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
            placeholder="Buscar por folio (REM, LIQ, MER), cliente, SKU o notas..."
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
            Entregas (REM)
          </button>

          <button
            onClick={() => setTypeFilter('venta_cierre')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              typeFilter === 'venta_cierre'
                ? 'bg-[#069669] text-white font-semibold'
                : 'bg-[#ecfdf5] text-[#047857] hover:bg-[#d1fae5]'
            }`}
          >
            Ventas / Cierres (LIQ)
          </button>

          <button
            onClick={() => setTypeFilter('devolucion_merma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              typeFilter === 'devolucion_merma'
                ? 'bg-[#ba1a1a] text-white font-semibold'
                : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffc9c4]'
            }`}
          >
            Devolución / Merma (MER)
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff4ff] text-[#45464d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-3 px-4">Folio / Tipo</th>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Consignatario</th>
                <th className="py-3 px-4">Detalle / Producto</th>
                <th className="py-3 px-4 text-right">Cantidad</th>
                <th className="py-3 px-4 text-right">Monto (MXN)</th>
                <th className="py-3 px-4">Referencia / Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#45464d]">
                    No se encontraron movimientos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isEntrega = m.type === 'entrega';
                  const isVenta = m.type === 'venta_cierre';
                  const isMerma = m.type === 'devolucion_merma';

                  return (
                    <tr key={m.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                      {/* Folio & Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0 ${
                              isEntrega 
                                ? 'bg-[#dbe1ff] text-[#00174b]' 
                                : isVenta 
                                ? 'bg-[#85f8c4] text-[#002114]' 
                                : 'bg-[#ffdad6] text-[#ba1a1a]'
                            }`}
                          >
                            {isEntrega && <Truck className="w-3.5 h-3.5" />}
                            {isVenta && <CheckCircle className="w-3.5 h-3.5" />}
                            {isMerma && <PackageMinus className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-[#0b1c30]">{m.code}</span>
                            <div className="text-[10px] text-[#45464d]">
                              {isEntrega ? 'Entrega Consignación' : isVenta ? 'Venta Reportada' : 'Devolución Merma'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-[#45464d] font-mono text-xs whitespace-nowrap">
                        {m.timestamp}
                      </td>

                      {/* Consignatario */}
                      <td className="py-3 px-4 font-semibold text-[#0b1c30]">
                        {m.clientName}
                      </td>

                      {/* Detalle Producto */}
                      <td className="py-3 px-4 text-[#0b1c30]">
                        <div>{m.productName}</div>
                        {m.sku && <div className="text-[10px] font-mono text-[#45464d]">{m.sku}</div>}
                      </td>

                      {/* Cantidad */}
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isEntrega ? 'text-[#0b1c30]' : isVenta ? 'text-[#069669]' : 'text-[#ba1a1a]'}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity} uds
                        </span>
                      </td>

                      {/* Monto */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#069669] whitespace-nowrap">
                        {m.amount ? `$${m.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                      </td>

                      {/* Referencia / Notas */}
                      <td className="py-3 px-4 text-[#45464d] max-w-[220px]">
                        <div className="truncate text-xs text-[#0b1c30] font-medium">{m.referenceDoc || 'Sin doc'}</div>
                        <div className="truncate text-[11px] text-[#76777d]">{m.notes}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
