import React, { useState } from 'react';
import { X, UserPlus, Check, Building, Warehouse } from 'lucide-react';
import { Client } from '../../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Client) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [contract, setContract] = useState('');
  const [type, setType] = useState('Boutique Exclusiva');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(200000);
  const [customWarehouseCode, setCustomWarehouseCode] = useState('');

  if (!isOpen) return null;

  // Auto-generate initials & warehouse code
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'CL';

  const defaultWhCode = customWarehouseCode || `ALM-VIR-${initials}${Math.floor(10 + Math.random() * 90)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: `c-${Date.now()}`,
      initials,
      name: name.trim(),
      branch: branch.trim() || 'Sucursal Principal',
      contract: contract.trim() || `#${new Date().getFullYear()}-${initials}`,
      virtualWarehouseCode: defaultWhCode,
      virtualWarehouseName: `Sub-almacén Virtual ${name.trim()}`,
      type,
      phone: phone.trim() || '+52 55 0000 0000',
      email: email.trim() || 'contacto@cliente.com',
      contactPerson: contactPerson.trim() || 'Encargado de Tienda',
      creditLimit: Math.max(0, creditLimit),
      lastMovementDate: 'Hoy',
      totalDelivered: 0,
      salesReconciled: 0,
      totalReturned: 0,
      remainingBalance: 0,
      daysWithoutCut: 0,
      auditStatus: 'al_dia',
      avgConsignmentDays: 0,
      items: [],
    };

    onAddClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0051d5] flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Alta de Consignatario y Almacén Virtual
              </h2>
              <p className="text-xs text-white/70">
                Registro de nuevo cliente y asignación de sub-bodega virtual
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
              Razón Social / Nombre Comercial *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Tiendas Vogue Reforma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-semibold text-[#0b1c30] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Sucursal / Ubicación
              </label>
              <input
                type="text"
                placeholder="Ej. Paseo de la Reforma #220"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Tipo de Punto de Venta
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium text-[#0b1c30] outline-none cursor-pointer"
              >
                <option value="Boutique Exclusiva">Boutique Exclusiva</option>
                <option value="Mayorista Regional">Mayorista Regional</option>
                <option value="Retail Departamental">Retail Departamental</option>
                <option value="Punto de Venta">Punto de Venta</option>
                <option value="Isla Comercial">Isla Comercial</option>
              </select>
            </div>
          </div>

          {/* Virtual Warehouse Assignment Section */}
          <div className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff] space-y-2">
            <div className="flex items-center gap-2 text-[#0051d5] font-bold text-xs">
              <Warehouse className="w-4 h-4" />
              <span>Asignación de Sub-almacén Virtual (Regla 1.C)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#45464d] mb-1 font-semibold uppercase">
                  Código de Almacén Virtual
                </label>
                <input
                  type="text"
                  placeholder={defaultWhCode}
                  value={customWarehouseCode}
                  onChange={(e) => setCustomWarehouseCode(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#0051d5] outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#45464d] mb-1 font-semibold uppercase">
                  Límite de Crédito / Custodia
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#dce9ff] text-xs font-mono font-bold text-[#069669] outline-none"
                />
              </div>
            </div>
            <span className="text-[10px] text-[#45464d] block">
              Las existencias trasladadas a este cliente se registrarán en esta bodega virtual dinámicamente.
            </span>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Contacto
              </label>
              <input
                type="text"
                placeholder="Persona responsable"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="+52 55 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] uppercase mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="correo@tienda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs text-[#0b1c30] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#e5eeff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0051d5] text-white text-xs font-semibold rounded-lg hover:bg-[#003ea8] transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Registrar Consignatario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
