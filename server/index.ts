import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { 
  getCompanySettings, 
  updateCompanySettings, 
  getAllProducts, 
  saveProduct, 
  saveProductsBatch, 
  deleteProductBySku, 
  getAllClients, 
  saveClient, 
  getAllMovements, 
  insertMovement, 
  getAllCuts, 
  insertCut, 
  resetToProductionEmpty, 
  seedDemoData,
  getAllUsers,
  verifyUserCredentials,
  createUser,
  deleteUser,
  updateUserPassword
} from './db';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Authentication & Users
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }
    const user = verifyUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifique su correo o contraseña.' });
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error en autenticación' });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error al obtener usuarios' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { name, email, password, role, roleLabel } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Datos incompletos para crear usuario' });
    }
    const user = createUser({
      name,
      email,
      password,
      role,
      roleLabel: roleLabel || (role === 'admin' ? 'Administrador General' : role === 'almacen' ? 'Jefe de Almacén Central' : 'Control y Facturación')
    });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error al crear usuario' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    deleteUser(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error al eliminar usuario' });
  }
});

app.put('/api/users/:id/password', (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Nueva contraseña requerida' });
    updateUserPassword(req.params.id, password);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error al actualizar contraseña' });
  }
});

// Company Settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = getCompanySettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error fetching settings' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = updateCompanySettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error updating settings' });
  }
});

// Products & Central Warehouse
app.get('/api/products', (req, res) => {
  try {
    const products = getAllProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error fetching products' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const saved = saveProduct(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error saving product' });
  }
});

app.post('/api/products/batch', (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Body must be an array of products' });
    }
    const result = saveProductsBatch(products);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error importing products' });
  }
});

app.put('/api/products/:sku', (req, res) => {
  try {
    const saved = saveProduct(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error updating product' });
  }
});

app.delete('/api/products/:sku', (req, res) => {
  try {
    deleteProductBySku(req.params.sku);
    res.json({ success: true, sku: req.params.sku });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error deleting product' });
  }
});

// Clients & Virtual Warehouses
app.get('/api/clients', (req, res) => {
  try {
    const clients = getAllClients();
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error fetching clients' });
  }
});

app.post('/api/clients', (req, res) => {
  try {
    const saved = saveClient(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error saving client' });
  }
});

app.put('/api/clients/:id', (req, res) => {
  try {
    const saved = saveClient(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error updating client' });
  }
});

// Movements & Kardex
app.get('/api/movements', (req, res) => {
  try {
    const movements = getAllMovements();
    res.json(movements);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error fetching movements' });
  }
});

app.post('/api/movements', (req, res) => {
  try {
    const saved = insertMovement(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error inserting movement' });
  }
});

// Cuts & Reconciliation
app.get('/api/cuts', (req, res) => {
  try {
    const cuts = getAllCuts();
    res.json(cuts);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error fetching cuts' });
  }
});

app.post('/api/cuts', (req, res) => {
  try {
    const saved = insertCut(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error inserting cut' });
  }
});

// Administrative Reset (Clean Production vs Demo Data)
app.post('/api/admin/reset', (req, res) => {
  try {
    const { mode } = req.body;
    if (mode === 'empty') {
      resetToProductionEmpty();
      res.json({ message: 'Base de datos inicializada en modo producción limpia (ceros).' });
    } else {
      seedDemoData();
      res.json({ message: 'Datos de prueba de demostración restaurados correctamente.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error resetting database' });
  }
});

// Production Static Serving (Cloud deployment single command)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Endpoint de API no encontrado' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`[ConsignLedger Backend] Servidor activo en http://${HOST}:${PORT}`);
});
