/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { MovementsView } from './components/MovementsView';
import { ReportsView } from './components/ReportsView';
import { CatalogView } from './components/CatalogView';

// Modals
import { ReconcileModal } from './components/modals/ReconcileModal';
import { SaleReportModal } from './components/modals/SaleReportModal';
import { DeliveryModal } from './components/modals/DeliveryModal';
import { NewMovementModal } from './components/modals/NewMovementModal';
import { ClientDetailModal } from './components/modals/ClientDetailModal';

// Mock Data & Types
import { 
  INITIAL_CLIENTS, 
  INITIAL_MOVEMENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_CUTS 
} from './data/mockData';
import { 
  ActiveTab, 
  Client, 
  Movement, 
  Product, 
  ReconciliationCut, 
  MovementType 
} from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard-general');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<Movement[]>(INITIAL_MOVEMENTS);
  const [cuts, setCuts] = useState<ReconciliationCut[]>(INITIAL_CUTS);
  
  const [selectedPeriod, setSelectedPeriod] = useState('Corte Semanal: 14 - 20 Oct, 2024');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [clientsViewFilter, setClientsViewFilter] = useState<string | undefined>(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Modal Visibility States
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [reconcileClient, setReconcileClient] = useState<Client | undefined>(undefined);

  const [isSaleReportOpen, setIsSaleReportOpen] = useState(false);
  const [saleClient, setSaleClient] = useState<Client | undefined>(undefined);

  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [deliveryClient, setDeliveryClient] = useState<Client | undefined>(undefined);

  const [isNewMovementOpen, setIsNewMovementOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  // Reconcile open helper
  const handleOpenReconcile = (client?: Client) => {
    setReconcileClient(client);
    setIsReconcileOpen(true);
  };

  // Sale open helper
  const handleOpenSale = (client?: Client) => {
    setSaleClient(client);
    setIsSaleReportOpen(true);
  };

  // Delivery open helper
  const handleOpenDelivery = (client?: Client) => {
    setDeliveryClient(client);
    setIsDeliveryOpen(true);
  };

  // Client detail open helper
  const handleOpenClientDetail = (client: Client) => {
    setDetailClient(client);
  };

  // Reconcile submit handler
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

    // Update client items with new physical counts
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

      return {
        ...c,
        items: updatedItems,
        remainingBalance: newRemaining,
        daysWithoutCut: 0,
        auditStatus: 'al_dia' as const,
        lastMovementDate: 'Hoy',
      };
    });

    setClients(updatedClients);

    // Create a new Cut record
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
      auditor: 'Carlos Mendoza',
      notes: data.notes,
    };

    setCuts(prev => [newCut, ...prev]);

    // Create adjustment movement if discrepancy exists
    if (data.totalDiscrepancy !== 0) {
      const newMovement: Movement = {
        id: `mov-${Date.now()}`,
        code: `AJU-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'ajuste_auditoria',
        clientId: client.id,
        clientName: client.name,
        productName: `Ajuste auditoría física (${data.totalDiscrepancy > 0 ? '+' : ''}${data.totalDiscrepancy} uds)`,
        sku: 'AUDITORIA',
        quantity: data.totalDiscrepancy,
        amount: Math.abs(data.totalDiscrepancyAmount),
        date: 'Hoy',
        timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        notes: data.notes,
        referenceDoc: newCut.code,
      };
      setMovements(prev => [newMovement, ...prev]);
    }

    showToast(`Corte emitido para ${client.name}. Estado actualizado a "Al día".`);
  };

  // Sale Report submit handler
  const handleConfirmSale = (data: {
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
      const updatedClients = clients.map(c => {
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

        return {
          ...c,
          items: updatedItems,
          salesReconciled: c.salesReconciled + data.quantity,
          remainingBalance: Math.max(0, c.remainingBalance - data.quantity),
          lastMovementDate: 'Hoy',
        };
      });
      setClients(updatedClients);
    }

    // Decrement consigned stock in catalog
    if (product) {
      setProducts(prev => prev.map(p => {
        if (p.sku === data.sku) {
          return {
            ...p,
            consignedStock: Math.max(0, p.consignedStock - data.quantity),
          };
        }
        return p;
      }));
    }

    // Add movement
    const newMovement: Movement = {
      id: `mov-${Date.now()}`,
      code: data.referenceDoc || `LIQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'venta_cierre',
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
    };

    setMovements(prev => [newMovement, ...prev]);
    showToast(`Venta por $${data.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN registrada con éxito.`);
  };

  // Delivery submit handler
  const handleConfirmDelivery = (data: {
    clientId: string;
    sku: string;
    quantity: number;
    referenceDoc: string;
    notes: string;
  }) => {
    const client = clients.find(c => c.id === data.clientId);
    const product = products.find(p => p.sku === data.sku);

    if (client) {
      const updatedClients = clients.map(c => {
        if (c.id !== data.clientId) return c;

        let itemFound = false;
        const updatedItems = c.items.map(item => {
          if (item.sku === data.sku) {
            itemFound = true;
            return {
              ...item,
              delivered: item.delivered + data.quantity,
              remaining: item.remaining + data.quantity,
            };
          }
          return item;
        });

        if (!itemFound && product) {
          updatedItems.push({
            sku: product.sku,
            productName: product.name,
            delivered: data.quantity,
            sold: 0,
            remaining: data.quantity,
            unitPrice: product.consignPrice,
          });
        }

        return {
          ...c,
          items: updatedItems,
          totalDelivered: c.totalDelivered + data.quantity,
          remainingBalance: c.remainingBalance + data.quantity,
          lastMovementDate: 'Hoy',
        };
      });
      setClients(updatedClients);
    }

    // Decrement central stock & increment consigned stock in products catalog
    if (product) {
      setProducts(prev => prev.map(p => {
        if (p.sku === data.sku) {
          return {
            ...p,
            centralStock: Math.max(0, p.centralStock - data.quantity),
            consignedStock: p.consignedStock + data.quantity,
          };
        }
        return p;
      }));
    }

    // Add movement
    const newMovement: Movement = {
      id: `mov-${Date.now()}`,
      code: data.referenceDoc || `REM-${Math.floor(8000 + Math.random() * 1000)}`,
      type: 'entrega',
      clientId: data.clientId,
      clientName: client ? client.name : 'Cliente',
      productName: product ? `${data.quantity} uds ${product.name}` : data.sku,
      sku: data.sku,
      quantity: data.quantity,
      date: 'Hoy',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      notes: data.notes,
      referenceDoc: data.referenceDoc,
    };

    setMovements(prev => [newMovement, ...prev]);
    showToast(`Remisión emitida: +${data.quantity} piezas despachadas a ${client?.name}.`);
  };

  // General new movement handler
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
        sku: data.sku,
        quantity: data.quantity,
        referenceDoc: data.referenceDoc,
        notes: data.notes,
      });
    } else if (data.type === 'venta_cierre') {
      handleConfirmSale({
        clientId: data.clientId,
        sku: data.sku,
        quantity: data.quantity,
        amount: data.amount || 0,
        referenceDoc: data.referenceDoc,
        notes: data.notes,
      });
    } else {
      // Merma or return
      const client = clients.find(c => c.id === data.clientId);
      const product = products.find(p => p.sku === data.sku);

      if (client) {
        setClients(prev => prev.map(c => {
          if (c.id !== data.clientId) return c;
          const updatedItems = c.items.map(item => {
            if (item.sku === data.sku) {
              return {
                ...item,
                remaining: Math.max(0, item.remaining - data.quantity),
              };
            }
            return item;
          });
          return {
            ...c,
            items: updatedItems,
            remainingBalance: Math.max(0, c.remainingBalance - data.quantity),
            lastMovementDate: 'Hoy',
          };
        }));
      }

      const newMov: Movement = {
        id: `mov-${Date.now()}`,
        code: data.referenceDoc || `MER-${Math.floor(100 + Math.random() * 500)}`,
        type: data.type,
        clientId: data.clientId,
        clientName: client ? client.name : 'Cliente',
        productName: product ? `${product.name} (Devolución)` : data.sku,
        sku: data.sku,
        quantity: -data.quantity,
        date: 'Hoy',
        timestamp: 'Hoy, ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        notes: data.notes,
        referenceDoc: data.referenceDoc,
      };

      setMovements(prev => [newMov, ...prev]);
      showToast(`Movimiento ${data.referenceDoc} registrado con éxito en Kardex.`);
    }
  };

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
      />

      {/* Main Content Layout */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header Bar */}
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenNewMovement={() => setIsNewMovementOpen(true)}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
        />

        {/* Dynamic Screen Body */}
        <main className="w-full pt-20 px-4 sm:px-6 lg:px-8 flex-1 max-w-[1600px] mx-auto">
          {activeTab === 'dashboard-general' && (
            <DashboardView
              clients={clients}
              movements={movements}
              onOpenReconcile={handleOpenReconcile}
              onOpenSaleReport={handleOpenSale}
              onOpenDelivery={handleOpenDelivery}
              onOpenClientDetail={handleOpenClientDetail}
              onNavigateToMovements={() => setActiveTab('registro-de-movimientos')}
              onNavigateToClients={(filter) => {
                setClientsViewFilter(filter);
                setActiveTab('clientes-y-consignaciones');
              }}
            />
          )}

          {activeTab === 'clientes-y-consignaciones' && (
            <ClientsView
              clients={clients}
              onOpenReconcile={handleOpenReconcile}
              onOpenDelivery={handleOpenDelivery}
              onOpenSaleReport={handleOpenSale}
              onOpenClientDetail={handleOpenClientDetail}
              initialFilter={clientsViewFilter}
            />
          )}

          {activeTab === 'registro-de-movimientos' && (
            <MovementsView
              movements={movements}
              onOpenNewMovement={() => setIsNewMovementOpen(true)}
            />
          )}

          {activeTab === 'reportes-y-cortes' && (
            <ReportsView
              cuts={cuts}
              clients={clients}
              onOpenReconcile={handleOpenReconcile}
            />
          )}

          {activeTab === 'catalogo-de-productos' && (
            <CatalogView
              products={products}
              onOpenDelivery={() => setIsDeliveryOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
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

      <NewMovementModal
        isOpen={isNewMovementOpen}
        onClose={() => setIsNewMovementOpen(false)}
        clients={clients}
        products={products}
        onConfirmNewMovement={handleConfirmNewMovement}
      />

      <ClientDetailModal
        client={detailClient}
        onClose={() => setDetailClient(null)}
        onOpenReconcile={handleOpenReconcile}
        onOpenSale={handleOpenSale}
        onOpenDelivery={handleOpenDelivery}
      />
    </div>
  );
}
