import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Shield, 
  Trash2, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Warehouse,
  Receipt
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { api } from '../../services/api';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New User Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('almacen');

  // Change Password State
  const [passwordTargetUserId, setPasswordTargetUserId] = useState<string | null>(null);
  const [updatedPassword, setUpdatedPassword] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al cargar usuarios' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setFeedback(null);
      setIsAddingNew(false);
      setPasswordTargetUserId(null);
    }
  }, [isOpen]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setFeedback({ type: 'error', message: 'Todos los campos son obligatorios' });
      return;
    }

    try {
      const roleLabel = 
        newRole === 'admin' ? 'Administrador General' :
        newRole === 'almacen' ? 'Jefe de Almacén Central' : 'Control y Facturación';

      await api.createUser({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
        role: newRole,
        roleLabel,
      });

      setFeedback({ type: 'success', message: `Usuario ${newName} registrado exitosamente.` });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setIsAddingNew(false);
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al crear usuario' });
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      alert('No puedes eliminar tu propio usuario activo.');
      return;
    }

    if (!confirm(`¿Está seguro de eliminar el usuario "${name}"? Perderá acceso inmediato al sistema.`)) {
      return;
    }

    try {
      await api.deleteUser(id);
      setFeedback({ type: 'success', message: `Usuario "${name}" eliminado correctamente.` });
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al eliminar usuario' });
    }
  };

  const handleUpdatePassword = async (id: string) => {
    if (!updatedPassword.trim()) {
      alert('Por favor ingrese una contraseña válida.');
      return;
    }

    try {
      await api.updateUserPassword(id, updatedPassword.trim());
      setFeedback({ type: 'success', message: 'Contraseña actualizada correctamente.' });
      setPasswordTargetUserId(null);
      setUpdatedPassword('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al cambiar contraseña' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5eeff] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                Gestión de Usuarios y Accesos
              </h2>
              <p className="text-xs text-[#45464d]">
                Control de roles, contraseñas y permisos del personal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#76777d] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {feedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857]' 
                : 'bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a]'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action button to show add form */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0b1c30] uppercase tracking-wider">
              Usuarios Registrados ({users.length})
            </span>
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="px-3 py-1.5 rounded-lg bg-[#0051d5] text-white hover:bg-[#003ea8] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nuevo Usuario</span>
              </button>
            )}
          </div>

          {/* Add User Form */}
          {isAddingNew && (
            <form onSubmit={handleCreateUser} className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#dce9ff] space-y-3">
              <div className="flex items-center justify-between border-b border-[#dce9ff]/80 pb-2">
                <span className="text-xs font-bold text-[#0051d5] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Registrar Nuevo Operador
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-[11px] text-[#45464d] hover:text-[#0b1c30] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#45464d] uppercase tracking-wider mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Sánchez"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dce9ff] text-xs text-[#0b1c30] outline-none focus:border-[#0051d5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#45464d] uppercase tracking-wider mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@empresa.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dce9ff] text-xs text-[#0b1c30] outline-none focus:border-[#0051d5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#45464d] uppercase tracking-wider mb-1">
                    Contraseña Inicial
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dce9ff] text-xs text-[#0b1c30] outline-none focus:border-[#0051d5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#45464d] uppercase tracking-wider mb-1">
                    Rol Operativo & Permisos
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dce9ff] text-xs text-[#0b1c30] outline-none focus:border-[#0051d5] cursor-pointer"
                  >
                    <option value="almacen">Almacén Central (Logística y Vales Físicos)</option>
                    <option value="facturacion">Control y Facturación (Remisiones y Reportes)</option>
                    <option value="admin">Administrador General (Control Total)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0051d5] hover:bg-[#003ea8] text-white text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  Guardar y Habilitar Acceso
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="space-y-2.5">
            {isLoading ? (
              <div className="text-center py-6 text-xs text-[#76777d]">Cargando usuarios...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#76777d]">No hay usuarios registrados</div>
            ) : (
              users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                const roleBadge = 
                  u.role === 'admin' ? { label: 'Admin Total', color: 'bg-[#eff4ff] text-[#0051d5] border-[#dce9ff]' } :
                  u.role === 'almacen' ? { label: 'Almacén Central', color: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' } :
                  { label: 'Facturación', color: 'bg-[#fff8e1] text-[#b45309] border-[#fde68a]' };

                return (
                  <div 
                    key={u.id}
                    className="p-3.5 rounded-xl border border-[#e5eeff] bg-white hover:border-[#dce9ff] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#0b1c30] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0b1c30] truncate">{u.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#eff4ff] text-[#0051d5]">
                              TÚ
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#76777d] truncate">{u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>

                      {/* Change Password button */}
                      <button
                        type="button"
                        onClick={() => setPasswordTargetUserId(passwordTargetUserId === u.id ? null : u.id)}
                        className="p-1.5 rounded-lg text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0051d5] transition-colors cursor-pointer"
                        title="Cambiar contraseña"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete user */}
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#fff1f0] transition-colors cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Change Password Inline Form */}
                    {passwordTargetUserId === u.id && (
                      <div className="w-full pt-2 border-t border-[#f1f5f9] flex items-center gap-2">
                        <input
                          type="password"
                          placeholder="Nueva contraseña..."
                          value={updatedPassword}
                          onChange={(e) => setUpdatedPassword(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#dce9ff] outline-none focus:border-[#0051d5]"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdatePassword(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#0051d5] text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Actualizar
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPasswordTargetUserId(null); setUpdatedPassword(''); }}
                          className="px-2 py-1 text-[11px] text-[#76777d] hover:text-[#0b1c30] cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#f1f5f9] bg-[#f8f9ff] flex items-center justify-between text-xs text-[#76777d]">
          <span>Los cambios surten efecto de inmediato.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-[#dce9ff] hover:bg-[#eff4ff] text-[#0b1c30] font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
