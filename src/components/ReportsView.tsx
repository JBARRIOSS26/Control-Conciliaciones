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
  ShieldCheck
} from 'lucide-react';
import { ReconciliationCut, Client } from '../types';

interface ReportsViewProps {
  cuts: ReconciliationCut[];
  clients: Client[];
  onOpenReconcile: (client?: Client) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  cuts,
  clients,
  onOpenReconcile,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCut, setSelectedCut] = useState<ReconciliationCut | null>(null);

  const filteredCuts = useMemo(() => {
    return cuts.filter((c) => {
      return (
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.clientName.toLowerCase().includes(search.toLowerCase()) ||
        c.period.toLowerCase().includes(search.toLowerCase()) ||
        c.auditor.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [cuts, search]);

  const totalCobrado = useMemo(() => {
    return cuts.reduce((sum, c) => sum + c.amountToPay, 0);
  }, [cuts]);

  const totalDiscrepancies = useMemo(() => {
    return cuts.reduce((sum, c) => sum + Math.abs(c.discrepancy), 0);
  }, [cuts]);

  const balancedRatio = useMemo(() => {
    const balanced = cuts.filter(c => c.status === 'balanceado' || c.status === 'liquidado').length;
    return Math.round((balanced / cuts.length) * 100) || 100;
  }, [cuts]);

  const handlePrintCut = (cut: ReconciliationCut) => {
    setSelectedCut(cut);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] uppercase tracking-wider">
            <span>Control de Liquidaciones y Balances</span>
            <span className="text-[#c6c6cd]">•</span>
            <span className="text-[#45464d] font-normal">Cortes Auditados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Reportes y Cortes de Consignación
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onOpenReconcile()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#003ea8] transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Generar Nuevo Corte de Auditoría</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Total Liquidado en Cortes</span>
            <div className="text-2xl font-bold text-[#0b1c30] font-mono mt-1">
              ${totalCobrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </div>
            <span className="text-[11px] text-[#069669] font-medium">Recaudado según acuerdos</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Precisión de Conteo Físico</span>
            <div className="text-2xl font-bold text-[#069669] font-mono mt-1">
              {balancedRatio}%
            </div>
            <span className="text-[11px] text-[#45464d]">Sin diferencias en auditoría</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] text-[#069669] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#45464d] font-medium">Varianza de Inventario</span>
            <div className="text-2xl font-bold text-[#ba1a1a] font-mono mt-1">
              {totalDiscrepancies} uds.
            </div>
            <span className="text-[11px] text-[#45464d]">Pendientes de aclaración</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#ffdad6]/60 text-[#ba1a1a] flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#45464d]" />
          <input
            type="text"
            placeholder="Buscar por código de corte, consignatario, periodo o auditor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#eff4ff] text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#76777d] border border-transparent focus:border-[#0051d5] focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Cuts Table */}
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
                <th className="py-3 px-4 text-right">Imprimir / Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredCuts.map((cut) => {
                const isBalanced = cut.status === 'balanceado' || cut.status === 'liquidado';
                return (
                  <tr key={cut.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#0b1c30]">{cut.code}</div>
                      <div className="text-[11px] text-[#45464d]">{cut.date}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#0b1c30]">
                      {cut.clientName}
                    </td>

                    <td className="py-3 px-4 text-[#45464d] font-mono">
                      {cut.period}
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      {cut.expectedRemaining.toLocaleString()} pzas
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#0051d5]">
                      {cut.physicalCounted.toLocaleString()} pzas
                    </td>

                    <td className="py-3 px-4 text-center">
                      {cut.discrepancy === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] text-[11px] font-mono font-semibold">
                          0 exacto
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-mono font-bold">
                          {cut.discrepancy} pzas
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#069669]">
                      ${cut.amountToPay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isBalanced ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}>
                        {cut.status === 'liquidado' ? 'Liquidado SPEI' : cut.status === 'balanceado' ? 'Balanceado' : 'Con Diferencia'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handlePrintCut(cut)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#eff4ff] text-[#0051d5] hover:bg-[#0051d5] hover:text-white font-medium transition-colors cursor-pointer"
                        title="Imprimir Acta de Conciliación"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Acta</span>
                      </button>
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
