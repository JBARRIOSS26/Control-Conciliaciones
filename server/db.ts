import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { 
  DEFAULT_USERS, 
  INITIAL_CLIENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_MOVEMENTS, 
  INITIAL_CUTS, 
  BRAND_LOGO_URL 
} from '../src/data/mockData';
import { CompanySettings, Product, Client, Movement, ReconciliationCut, User } from '../src/types';

// Ensure data directory exists (configurable for cloud volumes)
const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'consignacion.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT NOT NULL,
      rfc TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      logo_url TEXT,
      legal_terms_delivery TEXT,
      legal_terms_return TEXT,
      legal_terms_remission TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT 'admin123',
      role TEXT NOT NULL,
      role_label TEXT NOT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      sku TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      unit_cost REAL NOT NULL,
      consign_price REAL NOT NULL,
      central_stock INTEGER NOT NULL,
      consigned_stock INTEGER NOT NULL,
      in_transit_stock INTEGER NOT NULL,
      min_alert INTEGER NOT NULL,
      entry_date TEXT,
      central_age_days INTEGER,
      properties TEXT
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      initials TEXT NOT NULL,
      name TEXT NOT NULL,
      branch TEXT NOT NULL,
      contract TEXT NOT NULL,
      virtual_warehouse_code TEXT NOT NULL,
      virtual_warehouse_name TEXT NOT NULL,
      type TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      contact_person TEXT,
      credit_limit REAL NOT NULL,
      last_movement_date TEXT,
      total_delivered INTEGER NOT NULL,
      sales_reconciled INTEGER NOT NULL,
      total_returned INTEGER NOT NULL,
      remaining_balance INTEGER NOT NULL,
      days_without_cut INTEGER NOT NULL,
      audit_status TEXT NOT NULL,
      avg_consignment_days INTEGER,
      items TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      client_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      product_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      amount REAL,
      date TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      notes TEXT,
      reference_doc TEXT,
      source_warehouse TEXT,
      target_warehouse TEXT,
      billing_status TEXT,
      reason TEXT
    );

    CREATE TABLE IF NOT EXISTS cuts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      client_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      period TEXT NOT NULL,
      date TEXT NOT NULL,
      total_delivered INTEGER NOT NULL,
      total_reported_sales INTEGER NOT NULL,
      expected_remaining INTEGER NOT NULL,
      physical_counted INTEGER NOT NULL,
      discrepancy INTEGER NOT NULL,
      amount_to_pay REAL NOT NULL,
      status TEXT NOT NULL,
      auditor TEXT NOT NULL,
      notes TEXT
    );
  `);

  // Ensure password column exists if table was created previously
  try {
    db.exec("ALTER TABLE users ADD COLUMN password TEXT;");
  } catch {}
  
  // Set default passwords for seeded accounts if missing
  try {
    db.exec("UPDATE users SET password = 'admin123' WHERE email = 'admin@consignledger.com' AND (password IS NULL OR password = '');");
    db.exec("UPDATE users SET password = 'almacen123' WHERE email = 'almacen@consignledger.com' AND (password IS NULL OR password = '');");
    db.exec("UPDATE users SET password = 'facturacion123' WHERE email = 'facturacion@consignledger.com' AND (password IS NULL OR password = '');");
  } catch {}

  // Seed default settings if empty
  const settingsRow = db.prepare('SELECT * FROM company_settings WHERE id = 1').get() as any;
  if (!settingsRow) {
    db.prepare(`
      INSERT INTO company_settings (
        id, company_name, rfc, address, phone, email, logo_url, 
        legal_terms_delivery, legal_terms_return, legal_terms_remission, updated_at
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      'CONSIGNLEDGER S.A. DE C.V.',
      'CLG210405-TX8',
      'Almacén Central Origen • Parque Industrial CEDI Bodega 4-B',
      '+52 55 4192 8800',
      'contacto@consignledger.com',
      BRAND_LOGO_URL,
      'La mercancía detallada se entrega en calidad de consignación mercantil con destino al sub-almacén virtual del cliente. El consignatario asume la custodia, conservación e integridad física de las prendas hasta su venta definitiva o retorno documentado al Almacén Central.',
      'El Almacén Central certifica el reingreso físico de las piezas devueltas y su reintegración inmediata al stock disponible. La firma avala la inspección de calidad y libera de custodia al consignatario por dichas unidades.',
      'La emisión de la presente Nota de Remisión legaliza la venta efectuada por el consignatario y ejecuta la baja definitiva del inventario. El documento se canaliza formalmente al área de facturación fiscal.',
      new Date().toISOString()
    );
  }

  // Seed products if empty
  const prodCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
  if (prodCount === 0) {
    seedDemoData();
  }
}

// Seed Demo Data
export function seedDemoData() {
  // Users with passwords
  const userInsert = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password, role, role_label, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  DEFAULT_USERS.forEach(u => {
    const defaultPass = u.role === 'admin' ? 'admin123' : u.role === 'almacen' ? 'almacen123' : 'facturacion123';
    userInsert.run(u.id, u.name, u.email, defaultPass, u.role, u.roleLabel, u.avatar || null);
  });

  // Products
  const prodInsert = db.prepare(`
    INSERT OR REPLACE INTO products (
      sku, name, description, category, unit_cost, consign_price, central_stock, 
      consigned_stock, in_transit_stock, min_alert, entry_date, central_age_days, properties
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_PRODUCTS.forEach(p => {
    prodInsert.run(
      p.sku, p.name, p.description || null, p.category, p.unitCost, p.consignPrice,
      p.centralStock, p.consignedStock, p.inTransitStock, p.minAlert,
      p.entryDate || '2024-08-01', p.centralAgeDays || 30, JSON.stringify(p.properties || {})
    );
  });

  // Clients
  const clientInsert = db.prepare(`
    INSERT OR REPLACE INTO clients (
      id, initials, name, branch, contract, virtual_warehouse_code, virtual_warehouse_name,
      type, phone, email, contact_person, credit_limit, last_movement_date,
      total_delivered, sales_reconciled, total_returned, remaining_balance, days_without_cut,
      audit_status, avg_consignment_days, items
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_CLIENTS.forEach(c => {
    clientInsert.run(
      c.id, c.initials, c.name, c.branch, c.contract, c.virtualWarehouseCode, c.virtualWarehouseName,
      c.type, c.phone, c.email, c.contactPerson, c.creditLimit, c.lastMovementDate,
      c.totalDelivered, c.salesReconciled, c.totalReturned || 0, c.remainingBalance, c.daysWithoutCut,
      c.auditStatus, c.avgConsignmentDays || 25, JSON.stringify(c.items || [])
    );
  });

  // Movements
  const movInsert = db.prepare(`
    INSERT OR REPLACE INTO movements (
      id, code, type, client_id, client_name, product_name, sku, quantity, amount,
      date, timestamp, notes, reference_doc, source_warehouse, target_warehouse, billing_status, reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_MOVEMENTS.forEach(m => {
    movInsert.run(
      m.id, m.code, m.type, m.clientId, m.clientName, m.productName, m.sku, m.quantity, m.amount || null,
      m.date, m.timestamp, m.notes || null, m.referenceDoc || null,
      m.sourceWarehouse || null, m.targetWarehouse || null, m.billingStatus || null, m.reason || null
    );
  });

  // Cuts
  const cutInsert = db.prepare(`
    INSERT OR REPLACE INTO cuts (
      id, code, client_id, client_name, period, date, total_delivered, total_reported_sales,
      expected_remaining, physical_counted, discrepancy, amount_to_pay, status, auditor, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  INITIAL_CUTS.forEach(k => {
    cutInsert.run(
      k.id, k.code, k.clientId, k.clientName, k.period, k.date, k.totalDelivered, k.totalReportedSales,
      k.expectedRemaining, k.physicalCounted, k.discrepancy, k.amountToPay, k.status, k.auditor, k.notes || null
    );
  });
}

// Reset Database to Empty (Production Clean Mode)
export function resetToProductionEmpty() {
  db.exec(`
    DELETE FROM cuts;
    DELETE FROM movements;
    DELETE FROM clients;
    DELETE FROM products;
  `);
}

// Database Helpers
export function getCompanySettings(): CompanySettings {
  const row = db.prepare('SELECT * FROM company_settings WHERE id = 1').get() as any;
  if (!row) {
    return {
      companyName: 'CONSIGNLEDGER S.A. DE C.V.',
      rfc: 'CLG210405-TX8',
      address: 'Almacén Central Origen • Parque Industrial CEDI Bodega 4-B',
      phone: '+52 55 4192 8800',
      email: 'contacto@consignledger.com',
      logoUrl: BRAND_LOGO_URL,
      legalTermsDelivery: 'La mercancía se entrega en calidad de consignación mercantil...',
      legalTermsReturn: 'El Almacén Central certifica el reingreso físico de las piezas...',
      legalTermsRemission: 'La emisión de esta Nota de Remisión legaliza la venta...',
    };
  }

  return {
    companyName: row.company_name,
    rfc: row.rfc,
    address: row.address,
    phone: row.phone || '',
    email: row.email || '',
    logoUrl: row.logo_url || BRAND_LOGO_URL,
    legalTermsDelivery: row.legal_terms_delivery || '',
    legalTermsReturn: row.legal_terms_return || '',
    legalTermsRemission: row.legal_terms_remission || '',
    updatedAt: row.updated_at,
  };
}

export function updateCompanySettings(settings: CompanySettings): CompanySettings {
  db.prepare(`
    UPDATE company_settings SET
      company_name = ?,
      rfc = ?,
      address = ?,
      phone = ?,
      email = ?,
      logo_url = ?,
      legal_terms_delivery = ?,
      legal_terms_return = ?,
      legal_terms_remission = ?,
      updated_at = ?
    WHERE id = 1
  `).run(
    settings.companyName,
    settings.rfc,
    settings.address,
    settings.phone,
    settings.email,
    settings.logoUrl,
    settings.legalTermsDelivery,
    settings.legalTermsReturn,
    settings.legalTermsRemission,
    new Date().toISOString()
  );

  return getCompanySettings();
}

export function getAllProducts(): Product[] {
  const rows = db.prepare('SELECT * FROM products ORDER BY sku ASC').all() as any[];
  return rows.map(r => ({
    sku: r.sku,
    name: r.name,
    description: r.description || undefined,
    category: r.category,
    unitCost: r.unit_cost,
    consignPrice: r.consign_price,
    centralStock: r.central_stock,
    consignedStock: r.consigned_stock,
    inTransitStock: r.in_transit_stock,
    minAlert: r.min_alert,
    entryDate: r.entry_date || undefined,
    centralAgeDays: r.central_age_days || 0,
    properties: r.properties ? JSON.parse(r.properties) : undefined,
  }));
}

export function saveProduct(p: Product): Product {
  db.prepare(`
    INSERT INTO products (
      sku, name, description, category, unit_cost, consign_price, central_stock,
      consigned_stock, in_transit_stock, min_alert, entry_date, central_age_days, properties
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sku) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      category = excluded.category,
      unit_cost = excluded.unit_cost,
      consign_price = excluded.consign_price,
      central_stock = excluded.central_stock,
      consigned_stock = excluded.consigned_stock,
      in_transit_stock = excluded.in_transit_stock,
      min_alert = excluded.min_alert,
      entry_date = excluded.entry_date,
      central_age_days = excluded.central_age_days,
      properties = excluded.properties
  `).run(
    p.sku, p.name, p.description || null, p.category, p.unitCost, p.consignPrice,
    p.centralStock, p.consignedStock, p.inTransitStock, p.minAlert,
    p.entryDate || new Date().toISOString().slice(0, 10), p.centralAgeDays || 0,
    JSON.stringify(p.properties || {})
  );

  return p;
}

export function saveProductsBatch(products: Product[]): Product[] {
  const insert = db.prepare(`
    INSERT INTO products (
      sku, name, description, category, unit_cost, consign_price, central_stock,
      consigned_stock, in_transit_stock, min_alert, entry_date, central_age_days, properties
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sku) DO UPDATE SET
      central_stock = products.central_stock + excluded.central_stock,
      unit_cost = COALESCE(excluded.unit_cost, products.unit_cost),
      consign_price = COALESCE(excluded.consign_price, products.consign_price)
  `);

  for (const p of products) {
    insert.run(
      p.sku, p.name, p.description || null, p.category, p.unitCost, p.consignPrice,
      p.centralStock, p.consignedStock || 0, p.inTransitStock || 0, p.minAlert || 50,
      p.entryDate || new Date().toISOString().slice(0, 10), p.centralAgeDays || 0,
      JSON.stringify(p.properties || {})
    );
  }

  return getAllProducts();
}

export function deleteProductBySku(sku: string): boolean {
  db.prepare('DELETE FROM products WHERE sku = ?').run(sku);
  return true;
}

export function getAllClients(): Client[] {
  const rows = db.prepare('SELECT * FROM clients ORDER BY name ASC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    initials: r.initials,
    name: r.name,
    branch: r.branch,
    contract: r.contract,
    virtualWarehouseCode: r.virtual_warehouse_code,
    virtualWarehouseName: r.virtual_warehouse_name,
    type: r.type,
    phone: r.phone || '',
    email: r.email || '',
    contactPerson: r.contact_person || '',
    creditLimit: r.credit_limit,
    lastMovementDate: r.last_movement_date || 'Hoy',
    totalDelivered: r.total_delivered,
    salesReconciled: r.sales_reconciled,
    totalReturned: r.total_returned,
    remainingBalance: r.remaining_balance,
    daysWithoutCut: r.days_without_cut,
    auditStatus: r.audit_status as any,
    avgConsignmentDays: r.avg_consignment_days || 0,
    items: r.items ? JSON.parse(r.items) : [],
  }));
}

export function saveClient(c: Client): Client {
  db.prepare(`
    INSERT INTO clients (
      id, initials, name, branch, contract, virtual_warehouse_code, virtual_warehouse_name,
      type, phone, email, contact_person, credit_limit, last_movement_date,
      total_delivered, sales_reconciled, total_returned, remaining_balance, days_without_cut,
      audit_status, avg_consignment_days, items
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      branch = excluded.branch,
      contract = excluded.contract,
      virtual_warehouse_code = excluded.virtual_warehouse_code,
      virtual_warehouse_name = excluded.virtual_warehouse_name,
      type = excluded.type,
      phone = excluded.phone,
      email = excluded.email,
      contact_person = excluded.contact_person,
      credit_limit = excluded.credit_limit,
      last_movement_date = excluded.last_movement_date,
      total_delivered = excluded.total_delivered,
      sales_reconciled = excluded.sales_reconciled,
      total_returned = excluded.total_returned,
      remaining_balance = excluded.remaining_balance,
      days_without_cut = excluded.days_without_cut,
      audit_status = excluded.audit_status,
      avg_consignment_days = excluded.avg_consignment_days,
      items = excluded.items
  `).run(
    c.id, c.initials, c.name, c.branch, c.contract, c.virtualWarehouseCode, c.virtualWarehouseName,
    c.type, c.phone, c.email, c.contactPerson, c.creditLimit, c.lastMovementDate,
    c.totalDelivered, c.salesReconciled, c.totalReturned || 0, c.remainingBalance, c.daysWithoutCut,
    c.auditStatus, c.avgConsignmentDays || 0, JSON.stringify(c.items || [])
  );

  return c;
}

export function getAllMovements(): Movement[] {
  const rows = db.prepare('SELECT * FROM movements ORDER BY id DESC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    code: r.code,
    type: r.type as any,
    clientId: r.client_id,
    clientName: r.client_name,
    productName: r.product_name,
    sku: r.sku,
    quantity: r.quantity,
    amount: r.amount || undefined,
    date: r.date,
    timestamp: r.timestamp,
    notes: r.notes || undefined,
    referenceDoc: r.reference_doc || undefined,
    sourceWarehouse: r.source_warehouse || undefined,
    targetWarehouse: r.target_warehouse || undefined,
    billingStatus: r.billing_status || undefined,
    reason: r.reason || undefined,
  }));
}

export function insertMovement(m: Movement): Movement {
  db.prepare(`
    INSERT INTO movements (
      id, code, type, client_id, client_name, product_name, sku, quantity, amount,
      date, timestamp, notes, reference_doc, source_warehouse, target_warehouse, billing_status, reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    m.id, m.code, m.type, m.clientId, m.clientName, m.productName, m.sku, m.quantity, m.amount || null,
    m.date, m.timestamp, m.notes || null, m.referenceDoc || null,
    m.sourceWarehouse || null, m.targetWarehouse || null, m.billingStatus || null, m.reason || null
  );

  return m;
}

export function getAllCuts(): ReconciliationCut[] {
  const rows = db.prepare('SELECT * FROM cuts ORDER BY id DESC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    code: r.code,
    clientId: r.client_id,
    clientName: r.client_name,
    period: r.period,
    date: r.date,
    totalDelivered: r.total_delivered,
    totalReportedSales: r.total_reported_sales,
    expectedRemaining: r.expected_remaining,
    physicalCounted: r.physical_counted,
    discrepancy: r.discrepancy,
    amountToPay: r.amount_to_pay,
    status: r.status as any,
    auditor: r.auditor,
    notes: r.notes || undefined,
  }));
}

export function insertCut(cut: ReconciliationCut): ReconciliationCut {
  db.prepare(`
    INSERT INTO cuts (
      id, code, client_id, client_name, period, date, total_delivered, total_reported_sales,
      expected_remaining, physical_counted, discrepancy, amount_to_pay, status, auditor, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    cut.id, cut.code, cut.clientId, cut.clientName, cut.period, cut.date, cut.totalDelivered, cut.totalReportedSales,
    cut.expectedRemaining, cut.physicalCounted, cut.discrepancy, cut.amountToPay, cut.status, cut.auditor, cut.notes || null
  );

  return cut;
}

export function getAllUsers(): User[] {
  const rows = db.prepare('SELECT id, name, email, role, role_label, avatar FROM users ORDER BY name ASC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role as any,
    roleLabel: r.role_label,
    avatar: r.avatar || undefined,
  }));
}

export function verifyUserCredentials(email: string, password: string): User | null {
  const cleanEmail = email.toLowerCase().trim();
  const cleanPass = password.trim();

  const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;
  if (!row) return null;

  if (row.password && row.password !== cleanPass) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as any,
    roleLabel: row.role_label,
    avatar: row.avatar || undefined,
  };
}

export function createUser(data: { name: string; email: string; password: string; role: string; roleLabel: string }): User {
  const id = `u-${Date.now()}`;
  db.prepare(`
    INSERT INTO users (id, name, email, password, role, role_label)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.name.trim(), data.email.toLowerCase().trim(), data.password.trim(), data.role, data.roleLabel);

  return {
    id,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    role: data.role as any,
    roleLabel: data.roleLabel,
  };
}

export function deleteUser(id: string): void {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

export function updateUserPassword(id: string, newPassword: string): void {
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword.trim(), id);
}

// Run schema setup
initSchema();
