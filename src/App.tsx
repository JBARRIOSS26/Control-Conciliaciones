/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { MovementsView } from './components/MovementsView';
import { ReportsView } from './components/ReportsView';
import { CatalogView } from './components/CatalogView';
import { LoginView } from './components/LoginView';

// Modals
import { ReconcileModal } from './components/modals/ReconcileModal';
import { SaleReportModal } from './components/modals/SaleReportModal';
import { DeliveryModal, DeliveryItemEntry } from './components/modals/DeliveryModal';
import { ReturnModal } from './components/modals/ReturnModal';
import { NewMovementModal } from './components/modals/NewMovementModal';
import { ClientDetailModal } from './components/modals/ClientDetailModal';
import { PrintVoucherModal } from './components/modals/PrintVoucherModal';
import { NewProductModal } from './components/modals/NewProductModal';
import { ImportExcelModal } from './components/modals/ImportExcelModal';
import { EditProductModal } from './components/modals/EditProductModal';
import { NewClientModal } from './components/modals/NewClientModal';
import { CompanySettingsModal } from './components/modals/CompanySettingsModal';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { getRolePermissions } from './utils/permissions';

// Database API Client & Types
import { api } from './services/api';
import { 
  DEFAULT_USERS, 
  INITIAL_CLIENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_MOVEMENTS, 
  INITIAL_CUTS,
  BRAND_LOGO_URL
} from './data/mockData';
import { 
  ActiveTab, 
  Client, 
  Movement, 
  Product, 
  ReconciliationCut, 
  MovementType,
  User,
  PhysicalVoucherData,
  CompanySettings
} from './types';
import { CheckCircle2, CloudCheck } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('consignledger_auth_user');
      return saved ? JSON.parse(saved) : DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('consignledger_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    showToast(`Bienvenido al sistema, ${user.name} (${user.roleLabel}).`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('consignledger_auth_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Application Data States (Synced with Database)
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'CONSIGNLEDGER S.A. DE C.V.',
    rfc: 'CLG210405-TX8',
    address: 'Almacén Central Origen • Parque Industrial CEDI Bodega 4-B',
    phone: '+52 55 4192 8800',
    email: 'contacto@consignledger.com',
    logoUrl: BRAND_LOGO_URL,
    legalTermsDelivery: 'La mercancía detallada se entrega en calidad de consignación mercantil con destino al sub-almacén virtual del cliente. El consignatario asume la custodia, conservación e integridad física de las prendas hasta su venta definitiva o retorno documentado al Almacén Central.',
    legalTermsReturn: 'El Almacén Central certifica el reingreso físico de las piezas devueltas y su reintegración inmediata al stock disponible. La firma avala la inspección de calidad y libera de custodia al consignatario por dichas unidades.',
    legalTermsRemission: 'La emisión de la presente Nota de Remisión legaliza la venta efectuada por el consignatario y ejecuta la baja definitiva del inventario. El documento se canaliza formalmente al área de facturación fiscal.',
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard-general');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<Movement[]>(INITIAL_MOVEMENTS);
  const [cuts, setCuts] = useState<ReconciliationCut[]>(INITIAL_CUTS);
  
  const [selectedPeriod, setSelectedPeriod] = useState('Corte Operativo: Octubre 2024');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [clientsViewFilter, setClientsViewFilter] = useState<string | undefined>(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load all data from database on mount
  const loadDatabaseData = useCallback(async () => {
    try {
      const [settingsData, prodsData, clientsData, movsData, cutsData] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getProducts().catch(() => null),
        api.getClients().catch(() => null),
        api.getMovements().catch(() => null),
        api.getCuts().catch(() => null),
      ]);

      if (settingsData) setCompanySettings(settingsData);
      if (prodsData && prodsData.length > 0) setProducts(prodsData);
      if (clientsData && clientsData.length > 0) setClients(clientsData);
      if (movsData && movsData.length > 0) setMovements(movsData);
      if (cutsData && cutsData.length > 0) setCuts(cutsData);
    } catch (err) {
      console.warn('API backend not reachable, using local database fallback:', err);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Modal Visibility States
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [reconcileClient, setReconcileClient] = useState<Client | undefined>(undefined);

  const [isSaleReportOpen, setIsSaleReportOpen] = useState(false);
  const [saleClient, setSaleClient] = useState<Client | undefined>(undefined);

  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [deliveryClient, setDeliveryClient] = useState<Client | undefined>(undefined);

  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnClient, setReturnClient] = useState<Client | undefined>(undefined);

  const [isNewMovementOpen, setIsNewMovementOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  // Modals: Catalog, Clients & Company Settings
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  // Dynamic Role Permissions Matrix
  const permissions = getRolePermissions(currentUser?.role);

  // Physical Printable Voucher State
  const [activeVoucher, setActiveVoucher] = useState<PhysicalVoucherData | null>(null);
  const [isPrintVoucherOpen, setIsPrintVoucherOpen] = useState(false);

  const openPrintVoucher = (voucher: PhysicalVoucherData) => {
    setActiveVoucher({
      ...voucher,
      companySettings,
    });
    setIsPrintVoucherOpen(true);
  };

  // -------------------------------------------------------------
  // HANDLERS: REGLA 2.B - ENVÍO DE MERCANCÍA A CONSIGNACIÓN (DESPACHO)
  // -------------------------------------------------------------
  const handleConfirmDelivery = async (data: {
    clientId: string;
    items: DeliveryItemEntry[];
    referenceDoc: string;
    notes: string;
  }) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) return;

    let totalQuantity = 0;
    const voucherItems: Array<{
      sku: string;
      productName: string;
      quantity: number;
      unitPrice?: number;
      totalAmount?: number;
    }> = [];

    // 1. Update client inventory in their Virtual Warehouse
    let updatedTargetClient: Client | null = null;
    const updatedClients = clients.map(c => {
      if (c.id !== data.clientId) return c;

      const updatedItems = [...c.items];

      data.items.forEach(delivItem => {
        totalQuantity += delivItem.quantity;
        const prod = products.find(p => p.sku === delivItem.sku);
        const existingIdx = updatedItems.findIndex(it => it.sku === delivItem.sku);

        voucherItems.push({
          sku: delivItem.sku,
          productName: prod?.name || delivItem.sku,
          quantity: delivItem.quantity,
          unitPrice: prod?.consignPrice || 0,
          totalAmount: (prod?.consignPrice || 0) * delivItem.quantity,
        });

        if (existingIdx >= 0) {
          updatedItems[existingIdx] = {
            ...updatedItems[existingIdx],
            delivered: updatedItems[existingIdx].delivered + delivItem.quantity,
            remaining: updatedItems[existingIdx].remaining + delivItem.quantity,
          };
        } else if (prod) {
          updatedItems.push({
            sku: prod.sku,
            productName: prod.name,
            delivered: delivItem.quantity,
            sold: 0,
            remaining: delivItem.quantity,
            unitPrice: prod.consignPrice,
            consignmentDays: 0,
          });
        }
      });

      const modified: Client = {
        ...c,
        items: updatedItems,
        totalDelivered: c.totalDelivered + totalQuantity,
        remainingBalance: c.remainingBalance + totalQuantity,
        lastMovementDate: 'Hoy',
      };
      updatedTargetClient = modified;
      return modified;
    });

    setClients(updatedClients);
    if (updatedTargetClient) {
      api.saveClient(updatedTargetClient).catch(console.error);
    }

    // 2. Decrement Central Stock & Increment Consigned Stock
    const updatedProducts = products.map(p => {
      const deliveredItem = data.items.find(it => it.sku === p.sku);
      if (deliveredItem) {
        const modified: Product = {
          ...p,
          centralStock: Math.max(0, p.centralStock - deliveredItem.quantity),
          consignedStock: p.consignedStock + deliveredItem.quantity,
        };
        api.saveProduct(modified).catch(console.error);
        return modified;
      }
      return p;
    });
    setProducts(updatedProducts);

    // 3. Register movement in Kardex
    const newMovement: Movement = {
      id: `mov-${Date.now()}`,
      code: data.referenceDoc || `VALE-ENT-${Math.floor(8000 + Math.random() * 1000)}`,
      type: 'entrega',
      clientId: client.id,
      clientName: client.name,
      productName: data.items.length === 1 
        ? `${data.items[0].quantity} uds ${voucherItems[0]?.productName || data.items[0].sku}`
        : `${totalQuantity} uds en ${data.items.length} SKUs trasladados`,
      sku: data.items.length === 1 ? data.items[0].sku : 'VARIOS',
      quantity: totalQuantity,
      date: 'Hoy',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      notes: data.notes,
      referenceDoc: data.referenceDoc,
      sourceWarehouse: 'Almacén Central Matriz',
      targetWarehouse: `${client.virtualWarehouseCode} (${client.name})`,
    };

    setMovements(prev => [newMovement, ...prev]);
    api.addMovement(newMovement).catch(console.error);

    // 4. RESTRICTION: Emit and Open Physical Delivery Voucher
    const totalVoucherAmount = voucherItems.reduce((acc, it) => acc + (it.totalAmount || 0), 0);
    openPrintVoucher({
      voucherType: 'entrega',
      title: 'Vale de Entrega a Consignación (Despacho Oficial)',
      folio: data.referenceDoc,
      date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
      clientName: client.name,
      clientId: client.id,
      branch: client.branch,
      virtualWarehouseCode: client.virtualWarehouseCode,
      virtualWarehouseName: client.virtualWarehouseName,
      items: voucherItems,
      totalUnits: totalQuantity,
      totalAmount: totalVoucherAmount,
      notes: data.notes,
      deliveredBy: currentUser?.name || 'Encargado de Bodega Central',
      receivedBy: `${client.contactPerson} (Punto de Venta)`,
      companySettings,
    });

    showToast(`Despacho guardado en BD: +${totalQuantity} unidades trasladadas a ${client.name}.`);
  };

  // -------------------------------------------------------------
  // HANDLERS: REGLA 2.C - PROCESO DE DEVOLUCIÓN DE MERCANCÍA
  // -------------------------------------------------------------
  const handleConfirmReturn = async (data: {
    clientId: string;
    sku: string;
    quantity: number;
    reason: string;
    referenceDoc: string;
    notes: string;
  }) => {
    const client = clients.find(c => c.id === data.clientId);
    const product = products.find(p => p.sku === data.sku);
    if (!client) return;

    // 1. Deduct from client inventory & record returned count
    let modifiedClient: Client | null = null;
    setClients(prevClients => prevClients.map(c => {
      if (c.id !== data.clientId) return c;
      const updatedItems = c.items.map(item => {
        if (item.sku === data.sku) {
          return {
            ...item,
            returned: (item.returned || 0) + data.quantity,
            remaining: Math.max(0, item.remaining - data.quantity),
          };
        }
        return item;
      });

      const mod: Client = {
        ...c,
        items: updatedItems,
        totalReturned: (c.totalReturned || 0) + data.quantity,
        remainingBalance: Math.max(0, c.remainingBalance - data.quantity),
        lastMovementDate: 'Hoy',
      };
      modifiedClient = mod;
      return mod;
    }));

    if (modifiedClient) {
      api.saveClient(modifiedClient).catch(console.error);
    }

    // 2. Reintegrate stock back to Central Warehouse
    if (product) {
      const updatedProd: Product = {
        ...product,
        centralStock: product.centralStock + data.quantity,
        consignedStock: Math.max(0, product.consignedStock - data.quantity),
      };
      setProducts(prev => prev.map(p => p.sku === data.sku ? updatedProd : p));
      api.saveProduct(updatedProd).catch(console.error);
    }

    // 3. Register movement in Kardex
    const newMovement: Movement = {
      id: `mov-${Date.now()}`,
      code: data.referenceDoc || `VALE-DEV-${Math.floor(100 + Math.random() * 900)}`,
      type: 'devolucion',
      clientId: client.id,
      clientName: client.name,
      productName: product ? `${product.name} (Reingreso a Matriz)` : data.sku,
      sku: data.sku,
      quantity: -data.quantity,
      date: 'Hoy',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      notes: data.notes,
      referenceDoc: data.referenceDoc,
      reason: data.reason,
      sourceWarehouse: `${client.virtualWarehouseCode} (${client.name})`,
      targetWarehouse: 'Almacén Central Matriz',
    };

    setMovements(prev => [newMovement, ...prev]);
    api.addMovement(newMovement).catch(console.error);

    // 4. RESTRICTION: Emit and Open Physical Return Voucher
    openPrintVoucher({
      voucherType: 'devolucion',
      title: 'Soporte de Devolución Física de Mercancía a Almacén Central',
      folio: data.referenceDoc,
      date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
      clientName: client.name,
      clientId: client.id,
      branch: client.branch,
      virtualWarehouseCode: client.virtualWarehouseCode,
      virtualWarehouseName: client.virtualWarehouseName,
      items: [
        {
          sku: data.sku,
          productName: product?.name || data.sku,
          quantity: data.quantity,
          unitPrice: product?.consignPrice,
          totalAmount: (product?.consignPrice || 0) * data.quantity,
          notes: data.reason,
        }
      ],
      totalUnits: data.quantity,
      totalAmount: (product?.consignPrice || 0) * data.quantity,
      notes: `Motivo: ${data.reason}. ${data.notes}`,
      deliveredBy: `${client.contactPerson} (Consignatario)`,
      receivedBy: currentUser?.name || 'Receptor Almacén Central',
      companySettings,
    });

    showToast(`Devolución guardada en BD: +${data.quantity} piezas reingresadas a Bodega Central.`);
  };

  // -------------------------------------------------------------
  // HANDLERS: REGLA 2.D - LEGALIZACIÓN DE VENTAS Y BAJAS (NOTA DE REMISIÓN)
  // -------------------------------------------------------------
  const handleConfirmSale = async (data: {
    clientId: string;
    sku: string;
    quantity: number;
    amount: number;
    referenceDoc: string;
    notes: string;
  }) => {
    const client = clients.find(c => c.id === data.clientId);
    const product = products.find(p => p.sku === data.sku);

    if (client) {
      let modifiedClient: Client | null = null;
      setClients(prevClients => prevClients.map(c => {
        if (c.id !== data.clientId) return c;
        const updatedItems = c.items.map(item => {
          if (item.sku === data.sku) {
            return {
              ...item,
              sold: item.sold + data.quantity,
              remaining: Math.max(0, item.remaining - data.quantity),
            };
          }
          return item;
        });

        const mod: Client = {
          ...c,
          items: updatedItems,
          salesReconciled: c.salesReconciled + data.quantity,
          remainingBalance: Math.max(0, c.remainingBalance - data.quantity),
          lastMovementDate: 'Hoy',
        };
        modifiedClient = mod;
        return mod;
      }));

      if (modifiedClient) {
        api.saveClient(modifiedClient).catch(console.error);
      }
    }

    if (product) {
      const updatedProd: Product = {
        ...product,
        consignedStock: Math.max(0, product.consignedStock - data.quantity),
      };
      setProducts(prev => prev.map(p => p.sku === data.sku ? updatedProd : p));
      api.saveProduct(updatedProd).catch(console.error);
    }

    // Register movement with status 'canalizada_facturacion'
    const newMovement: Movement = {
      id: `mov-${Date.now()}`,
      code: data.referenceDoc || `REM-VTA-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'venta_remision',
      clientId: data.clientId,
      clientName: client ? client.name : 'Cliente',
      productName: product ? product.name : data.sku,
      sku: data.sku,
      quantity: -data.quantity,
      amount: data.amount,
      date: 'Hoy',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      notes: data.notes,
      referenceDoc: data.referenceDoc,
      billingStatus: 'canalizada_facturacion',
      sourceWarehouse: client ? `${client.virtualWarehouseCode} (${client.name})` : 'Cliente',
      targetWarehouse: 'Baja Definitiva por Venta Legalizada',
    };

    setMovements(prev => [newMovement, ...prev]);
    api.addMovement(newMovement).catch(console.error);

    // Emit Printable Remission Note for Billing Department
    if (client) {
      openPrintVoucher({
        voucherType: 'remision',
        title: 'Nota de Remisión y Legalización de Venta (Canalizada a Facturación)',
        folio: data.referenceDoc,
        date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
        clientName: client.name,
        clientId: client.id,
        branch: client.branch,
        virtualWarehouseCode: client.virtualWarehouseCode,
        virtualWarehouseName: client.virtualWarehouseName,
        items: [
          {
            sku: data.sku,
            productName: product?.name || data.sku,
            quantity: data.quantity,
            unitPrice: product?.consignPrice,
            totalAmount: data.amount,
            notes: 'Baja definitiva de inventario por venta',
          }
        ],
        totalUnits: data.quantity,
        totalAmount: data.amount,
        notes: data.notes,
        deliveredBy: `${client.contactPerson} (Punto de Venta)`,
        receivedBy: currentUser?.name || 'Departamento de Facturación',
        billingChannelInfo: 'Trámite: Canalizada de inmediato al área de facturación para timbrado fiscal.',
        companySettings,
      });
    }

    showToast(`Nota de Remisión ${data.referenceDoc} registrada en BD y canalizada a Facturación.`);
  };

  // -------------------------------------------------------------
  // HANDLERS: REGLA 2.A - ALMACÉN CENTRAL (ALTA MANUAL Y EXCEL)
  // -------------------------------------------------------------
  const handleAddProduct = async (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
    await api.saveProduct(newProd).catch(console.error);
    showToast(`SKU ${newProd.sku} persistido en BD con +${newProd.centralStock} uds en Bodega Central.`);
  };

  const handleImportProducts = async (imported: Product[]) => {
    try {
      const updatedList = await api.importProductsBatch(imported);
      setProducts(updatedList);
    } catch {
      // Fallback merge
      setProducts(prev => {
        const merged = [...prev];
        imported.forEach(imp => {
          const existIdx = merged.findIndex(p => p.sku === imp.sku);
          if (existIdx >= 0) {
            merged[existIdx] = {
              ...merged[existIdx],
              centralStock: merged[existIdx].centralStock + imp.centralStock,
            };
          } else {
            merged.push(imp);
          }
        });
        return merged;
      });
    }

    const totalAddedUnits = imported.reduce((acc, p) => acc + p.centralStock, 0);
    showToast(`Importación a BD completada: ${imported.length} productos (+${totalAddedUnits.toLocaleString()} uds a Central).`);
  };

  const handleSaveProduct = async (updated: Product) => {
    setProducts(prev => prev.map(p => p.sku === updated.sku ? updated : p));
    await api.saveProduct(updated).catch(console.error);
    showToast(`Producto ${updated.sku} actualizado en BD.`);
  };

  // -------------------------------------------------------------
  // HANDLERS: CLIENTES Y ALMACENES VIRTUALES
  // -------------------------------------------------------------
  const handleAddClient = async (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
    await api.saveClient(newClient).catch(console.error);
    showToast(`Consignatario ${newClient.name} guardado en BD con sub-almacén ${newClient.virtualWarehouseCode}.`);
  };

  // -------------------------------------------------------------
  // HANDLERS: AJUSTES DE EMPRESA & RESET A PRODUCCIÓN LIMPIA
  // -------------------------------------------------------------
  const handleSaveCompanySettings = async (newSettings: CompanySettings) => {
    setCompanySettings(newSettings);
    await api.updateSettings(newSettings);
    showToast(`Datos de empresa y logotipo actualizados en la base de datos.`);
  };

  const handleResetDatabase = async (mode: 'empty' | 'demo') => {
    try {
      await api.resetDatabase(mode);
      await loadDatabaseData();
      if (mode === 'empty') {
        showToast('Base de datos inicializada en modo Producción Limpia (Catálogo y Clientes en ceros).');
      } else {
        showToast('Datos de demostración restaurados correctamente en la base de datos.');
      }
    } catch (err: any) {
      alert(`Error al resetear base de datos: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: CONCILIACIÓN / CORTES (EXISTENTE)
  // -------------------------------------------------------------
  const handleConfirmReconciliation = (
    clientId: string,
    data: {
      physicalCounts: Record<string, number>;
      totalDiscrepancy: number;
      totalDiscrepancyAmount: number;
      notes: string;
    }
  ) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    let updatedTarget: Client | null = null;
    const updatedClients = clients.map(c => {
      if (c.id !== clientId) return c;

      const updatedItems = c.items.map(item => {
        const counted = data.physicalCounts[item.sku] ?? item.remaining;
        return {
          ...item,
          remaining: counted,
          physicalCount: counted,
        };
      });

      const newRemaining = updatedItems.reduce((acc, it) => acc + it.remaining, 0);

      const mod: Client = {
        ...c,
        items: updatedItems,
        remainingBalance: newRemaining,
        daysWithoutCut: 0,
        auditStatus: 'al_dia' as const,
        lastMovementDate: 'Hoy',
      };
      updatedTarget = mod;
      return mod;
    });

    setClients(updatedClients);
    if (updatedTarget) api.saveClient(updatedTarget).catch(console.error);

    const newCut: ReconciliationCut = {
      id: `cut-${Date.now()}`,
      code: `CORTE-${new Date().getFullYear()}-W${Math.floor(Date.now() % 52)}`,
      clientId: client.id,
      clientName: client.name,
      period: selectedPeriod,
      date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalDelivered: client.totalDelivered,
      totalReportedSales: client.salesReconciled,
      expectedRemaining: client.remainingBalance,
      physicalCounted: client.remainingBalance + data.totalDiscrepancy,
      discrepancy: data.totalDiscrepancy,
      amountToPay: Math.abs(data.totalDiscrepancyAmount),
      status: data.totalDiscrepancy === 0 ? 'balanceado' : 'con_diferencia',
      auditor: currentUser?.name || 'Auditor',
      notes: data.notes,
    };

    setCuts(prev => [newCut, ...prev]);
    api.addCut(newCut).catch(console.error);
    showToast(`Corte emitido para ${client.name} y guardado en BD.`);
  };

  // General New Movement Handler (from MovementsView button)
  const handleConfirmNewMovement = (data: {
    type: MovementType;
    clientId: string;
    sku: string;
    quantity: number;
    amount?: number;
    referenceDoc: string;
    notes: string;
  }) => {
    if (data.type === 'entrega') {
      handleConfirmDelivery({
        clientId: data.clientId,
        items: [{ sku: data.sku, quantity: data.quantity }],
        referenceDoc: data.referenceDoc,
        notes: data.notes,
      });
    } else if (data.type === 'venta_remision' || data.type === 'venta_cierre') {
      handleConfirmSale({
        clientId: data.clientId,
        sku: data.sku,
        quantity: data.quantity,
        amount: data.amount || 0,
        referenceDoc: data.referenceDoc,
        notes: data.notes,
      });
    } else {
      handleConfirmReturn({
        clientId: data.clientId,
        sku: data.sku,
        quantity: data.quantity,
        reason: 'Retorno manual desde kardex',
        referenceDoc: data.referenceDoc,
        notes: data.notes,
      });
    }
  };

  // If user is not authenticated, display LoginView
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const pendingAuditsCount = clients.filter(c => c.auditStatus === 'corte_requerido').length;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="global-toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#316bf3]/30 animate-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-[#85f8c4] shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setClientsViewFilter(undefined);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        pendingAuditsCount={pendingAuditsCount}
        currentUser={currentUser}
        companySettings={companySettings}
        onOpenSettings={() => setIsCompanySettingsOpen(true)}
        onOpenUsers={() => setIsUsersModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Layout */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header Bar */}
        <Header
          currentUser={currentUser}
          companySettings={companySettings}
          onOpenSettings={() => setIsCompanySettingsOpen(true)}
          onOpenUsers={() => setIsUsersModalOpen(true)}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenNewMovement={() => setIsNewMovementOpen(true)}
          onOpenDelivery={() => setIsDeliveryOpen(true)}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
        />

        {/* Dynamic Screen Body */}
        <main className="w-full pt-20 px-4 sm:px-6 lg:px-8 flex-1 max-w-[1600px] mx-auto">
          {activeTab === 'dashboard-general' && (
            <DashboardView
              clients={clients}
              movements={movements}
              permissions={permissions}
              onOpenReconcile={(c) => { setReconcileClient(c); setIsReconcileOpen(true); }}
              onOpenSaleReport={(c) => { setSaleClient(c); setIsSaleReportOpen(true); }}
              onOpenDelivery={(c) => { setDeliveryClient(c); setIsDeliveryOpen(true); }}
              onOpenReturn={(c) => { setReturnClient(c); setIsReturnOpen(true); }}
              onOpenClientDetail={(c) => setDetailClient(c)}
              onNavigateToMovements={() => setActiveTab('registro-de-movimientos')}
              onNavigateToClients={(filter) => {
                setClientsViewFilter(filter);
                setActiveTab('clientes-y-consignaciones');
              }}
            />
          )}

          {(activeTab === 'almacen-central-y-catalogo' || activeTab === 'catalogo-de-productos') && (
            <CatalogView
              products={products}
              permissions={permissions}
              onOpenDelivery={() => setIsDeliveryOpen(true)}
              onOpenNewProduct={() => setIsNewProductOpen(true)}
              onOpenImportExcel={() => setIsImportExcelOpen(true)}
              onOpenEditProduct={(prod) => setEditingProduct(prod)}
            />
          )}

          {activeTab === 'clientes-y-consignaciones' && (
            <ClientsView
              clients={clients}
              permissions={permissions}
              onOpenReconcile={(c) => { setReconcileClient(c); setIsReconcileOpen(true); }}
              onOpenDelivery={(c) => { setDeliveryClient(c); setIsDeliveryOpen(true); }}
              onOpenReturn={(c) => { setReturnClient(c); setIsReturnOpen(true); }}
              onOpenSaleReport={(c) => { setSaleClient(c); setIsSaleReportOpen(true); }}
              onOpenClientDetail={(c) => setDetailClient(c)}
              onOpenNewClient={() => setIsNewClientOpen(true)}
              initialFilter={clientsViewFilter}
            />
          )}

          {activeTab === 'registro-de-movimientos' && (
            <MovementsView
              movements={movements}
              onOpenNewMovement={() => setIsNewMovementOpen(true)}
              onReprintVoucher={openPrintVoucher}
            />
          )}

          {(activeTab === 'reportes-estadisticos' || activeTab === 'reportes-y-cortes') && (
            <ReportsView
              cuts={cuts}
              clients={clients}
              products={products}
              movements={movements}
              onOpenReconcile={(c) => { setReconcileClient(c); setIsReconcileOpen(true); }}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <DeliveryModal
        isOpen={isDeliveryOpen}
        onClose={() => {
          setIsDeliveryOpen(false);
          setDeliveryClient(undefined);
        }}
        clients={clients}
        products={products}
        initialClient={deliveryClient}
        onConfirmDelivery={handleConfirmDelivery}
      />

      <ReturnModal
        isOpen={isReturnOpen}
        onClose={() => {
          setIsReturnOpen(false);
          setReturnClient(undefined);
        }}
        clients={clients}
        products={products}
        initialClient={returnClient}
        onConfirmReturn={handleConfirmReturn}
      />

      <SaleReportModal
        isOpen={isSaleReportOpen}
        onClose={() => {
          setIsSaleReportOpen(false);
          setSaleClient(undefined);
        }}
        clients={clients}
        products={products}
        initialClient={saleClient}
        onConfirmSale={handleConfirmSale}
      />

      <ReconcileModal
        isOpen={isReconcileOpen}
        onClose={() => {
          setIsReconcileOpen(false);
          setReconcileClient(undefined);
        }}
        clients={clients}
        initialClient={reconcileClient}
        onConfirmReconciliation={handleConfirmReconciliation}
      />

      <NewMovementModal
        isOpen={isNewMovementOpen}
        onClose={() => setIsNewMovementOpen(false)}
        clients={clients}
        products={products}
        permissions={permissions}
        onConfirmNewMovement={handleConfirmNewMovement}
      />

      <ClientDetailModal
        client={detailClient}
        onClose={() => setDetailClient(null)}
        onOpenReconcile={(c) => { setReconcileClient(c); setIsReconcileOpen(true); }}
        onOpenSale={(c) => { setSaleClient(c); setIsSaleReportOpen(true); }}
        onOpenDelivery={(c) => { setDeliveryClient(c); setIsDeliveryOpen(true); }}
      />

      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <ImportExcelModal
        isOpen={isImportExcelOpen}
        onClose={() => setIsImportExcelOpen(false)}
        onImportProducts={handleImportProducts}
        existingProducts={products}
      />

      <EditProductModal
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSaveProduct={handleSaveProduct}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onAddClient={handleAddClient}
      />

      <CompanySettingsModal
        isOpen={isCompanySettingsOpen}
        onClose={() => setIsCompanySettingsOpen(false)}
        settings={companySettings}
        onSaveSettings={handleSaveCompanySettings}
        onResetDatabase={handleResetDatabase}
      />

      <UserManagementModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        currentUser={currentUser}
      />

      <PrintVoucherModal
        isOpen={isPrintVoucherOpen}
        onClose={() => {
          setIsPrintVoucherOpen(false);
          setActiveVoucher(null);
        }}
        voucherData={activeVoucher}
      />
    </div>
  );
}
