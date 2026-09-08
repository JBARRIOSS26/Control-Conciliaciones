import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ArrowRight,
  Database
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product } from '../../types';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (products: Product[]) => void;
  existingProducts: Product[];
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportProducts,
  existingProducts,
}) => {
  const [parsedRows, setParsedRows] = useState<Product[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const downloadSampleTemplate = (format: 'xlsx' | 'csv') => {
    const headers = [
      'SKU',
      'Nombre',
      'Categoria',
      'CostoUnitario',
      'PrecioConsignacion',
      'StockAlmacenCentral',
      'AlertaMinima',
      'Descripcion',
      'Color',
      'Talla',
      'Material',
    ];

    const sampleRows = [
      [
        'VES-SAT-06',
        'Vestido Satín Gala Noche',
        'Textil Dama',
        350,
        780,
        1200,
        150,
        'Vestido de satín corte sirena',
        'Verde Esmeralda',
        'S, M, L',
        'Satín Seda',
      ],
      [
        'CHA-MEZ-07',
        'Chaqueta Mezclilla Vintage',
        'Textil Caballero',
        280,
        620,
        950,
        200,
        'Chaqueta denim lavado medio con bolsillos',
        'Azul Deslavado',
        'M, G, XG',
        '100% Algodón',
      ],
      [
        'BUF-LNA-08',
        'Bufanda Lana Alpaca Artesanal',
        'Accesorios',
        140,
        310,
        1500,
        250,
        'Bufanda tejida suave terminación flecos',
        'Gris Perla',
        'Unitalla',
        'Lana Alpaca',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PlantillaAlmacen');

    if (format === 'xlsx') {
      XLSX.writeFile(wb, 'plantilla_ingreso_almacen_central.xlsx');
    } else {
      XLSX.writeFile(wb, 'plantilla_ingreso_almacen_central.csv');
    }
  };

  const handleFileChange = (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (rawJson.length === 0) {
          setValidationErrors(['El archivo no contiene filas con datos o está vacío.']);
          setParsedRows([]);
          setIsProcessing(false);
          return;
        }

        const errors: string[] = [];
        const validProducts: Product[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2;
          const sku = (row['SKU'] || row['sku'] || row['Codigo'] || row['codigo'] || '').toString().trim();
          const name = (row['Nombre'] || row['nombre'] || row['Descripcion'] || '').toString().trim();
          const category = (row['Categoria'] || row['categoria'] || 'General').toString().trim();
          const unitCost = parseFloat(row['CostoUnitario'] || row['Costo'] || row['costo'] || 0);
          const consignPrice = parseFloat(row['PrecioConsignacion'] || row['Precio'] || row['precio'] || 0);
          const centralStock = parseInt(row['StockAlmacenCentral'] || row['StockCentral'] || row['Stock'] || row['stock'] || 0, 10);
          const minAlert = parseInt(row['AlertaMinima'] || row['Alerta'] || 100, 10);

          if (!sku) {
            errors.push(`Fila ${rowNum}: Falta el código SKU.`);
            return;
          }
          if (!name) {
            errors.push(`Fila ${rowNum}: Falta el nombre del producto.`);
            return;
          }

          validProducts.push({
            sku: sku.toUpperCase(),
            name,
            description: row['Descripcion'] || undefined,
            category: category || 'Textil Dama',
            unitCost: isNaN(unitCost) ? 0 : Math.max(0, unitCost),
            consignPrice: isNaN(consignPrice) ? 0 : Math.max(0, consignPrice),
            centralStock: isNaN(centralStock) ? 0 : Math.max(0, centralStock),
            consignedStock: 0,
            inTransitStock: 0,
            minAlert: isNaN(minAlert) ? 50 : Math.max(0, minAlert),
            entryDate: new Date().toISOString().slice(0, 10),
            centralAgeDays: 0,
            properties: {
              color: row['Color'] || undefined,
              size: row['Talla'] || undefined,
              material: row['Material'] || undefined,
            },
          });
        });

        setValidationErrors(errors);
        setParsedRows(validProducts);
      } catch (err: any) {
        setValidationErrors([`Error al procesar el archivo: ${err?.message || 'Formato no soportado.'}`]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportProducts(parsedRows);
    onClose();
  };

  const totalCentralUnits = parsedRows.reduce((sum, p) => sum + p.centralStock, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#069669] flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Importación Masiva de Catálogo (Excel / CSV)
              </h2>
              <p className="text-xs text-white/70">
                Alimentación rápida de inventario en el Almacén Central
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Download Templates Actions */}
          <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-xs text-[#0b1c30] block">
                ¿No tienes el formato de carga?
              </span>
              <span className="text-[11px] text-[#45464d]">
                Descarga la plantilla con las columnas exactas requeridas para Almacén Central.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadSampleTemplate('xlsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#dce9ff] text-xs font-semibold text-[#0051d5] hover:bg-[#eff4ff] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Plantilla .xlsx</span>
              </button>
              <button
                type="button"
                onClick={() => downloadSampleTemplate('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#dce9ff] text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Plantilla .csv</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#316bf3]/40 hover:border-[#0051d5] bg-[#eff4ff]/40 hover:bg-[#eff4ff]/70 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-[#0051d5] mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <span className="font-semibold text-sm text-[#0b1c30]">
              {fileName ? `Archivo seleccionado: ${fileName}` : 'Haz clic o arrastra aquí tu archivo Excel o CSV'}
            </span>
            <span className="text-[11px] text-[#45464d] mt-1">
              Soporta archivos .xlsx, .xls y .csv con encabezados estándar
            </span>
          </div>

          {/* Validation Warnings */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-[#ffdad6]/40 border border-[#ffdad6] rounded-xl text-[#ba1a1a] text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Advertencias detectadas al procesar:</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                {validationErrors.slice(0, 4).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
                {validationErrors.length > 4 && (
                  <li>... y {validationErrors.length - 4} advertencias más.</li>
                )}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0b1c30] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#069669]" />
                  <span>Previsualización de Carga ({parsedRows.length} productos listos)</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#0051d5]">
                  Total a ingresar: {totalCentralUnits.toLocaleString()} uds en Matriz
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-[#e5eeff] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#eff4ff] text-[#45464d] text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Nombre</th>
                      <th className="py-2 px-3">Categoría</th>
                      <th className="py-2 px-3 text-right">Costo</th>
                      <th className="py-2 px-3 text-right">PVP Consig.</th>
                      <th className="py-2 px-3 text-right">Stock Central</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f9ff]">
                        <td className="py-1.5 px-3 font-mono font-bold text-[#0051d5]">{row.sku}</td>
                        <td className="py-1.5 px-3 font-medium text-[#0b1c30] truncate max-w-[200px]">{row.name}</td>
                        <td className="py-1.5 px-3 text-[#45464d]">{row.category}</td>
                        <td className="py-1.5 px-3 text-right font-mono">${row.unitCost.toFixed(2)}</td>
                        <td className="py-1.5 px-3 text-right font-mono font-bold text-[#069669]">${row.consignPrice.toFixed(2)}</td>
                        <td className="py-1.5 px-3 text-right font-mono font-bold text-[#0051d5]">+{row.centralStock.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <span className="text-[10px] text-[#76777d] block text-center">
                  Mostrando los primeros 10 de {parsedRows.length} registros analizados.
                </span>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-[#e5eeff]">
            {parsedRows.length > 0 ? (
              <button
                type="button"
                onClick={() => { setParsedRows([]); setFileName(null); }}
                className="text-xs text-[#ba1a1a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar archivo</span>
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
                type="button"
                disabled={parsedRows.length === 0}
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#069669] hover:bg-[#057a55] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Importación a Almacén Central</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
