import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL || 'database.sqlite';
const db = new Database(dbPath);

let cachedSpecs: any[] | null = null;

function parseSpecsXml() {
  if (cachedSpecs) return cachedSpecs;
  
  const xmlPath = path.join(process.cwd(), 'public', 'specs_2026.xml');
  if (!fs.existsSync(xmlPath)) {
    console.log('XML specs file not found at', xmlPath);
    return [];
  }

  try {
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const jsonObj = parser.parse(xmlContent);

    if (!jsonObj || !jsonObj.Workbook) {
      console.error('Invalid XML structure: Workbook missing');
      return [];
    }

    const manufacturers: any[] = [];
    const worksheets = Array.isArray(jsonObj.Workbook.Worksheet) 
      ? jsonObj.Workbook.Worksheet 
      : (jsonObj.Workbook.Worksheet ? [jsonObj.Workbook.Worksheet] : []);

    for (const sheet of worksheets) {
      if (!sheet) continue;
      const sheetName = sheet["@_ss:Name"] || "Unknown";
      // Create a brand based on sheet name, e.g., "Yuchai c" -> "Yuchai"
      const brandName = sheetName.split(' ')[0];
      
      const table = sheet.Table;
      if (!table || !table.Row) continue;

      const rows = Array.isArray(table.Row) ? table.Row : [table.Row];
      
      // We need to find which column corresponds to which index.
      // Usually Column 0 is the labels, and Column 1..N are the models.
      // But let's check how many models we have by looking at Row 2 (index 1)
      const headerRow = rows[1]; // Row 2 is "Применяемость для ДЭС"
      if (!headerRow || !headerRow.Cell) continue;
      
      const cells = Array.isArray(headerRow.Cell) ? headerRow.Cell : [headerRow.Cell];
      const modelCount = cells.length - 1;

      const models: any[] = [];

      for (let j = 1; j <= modelCount; j++) {
        const getVal = (rowIdx: number, colIdx: number) => {
          const row = rows[rowIdx];
          if (!row || !row.Cell) return "";
          const rowCells = Array.isArray(row.Cell) ? row.Cell : [row.Cell];
          const cell = rowCells[colIdx];
          if (!cell) return "";
          const data = cell.Data;
          if (!data) return "";
          return data["#text"] || (typeof data === 'object' ? "" : data) || "";
        };

        const powerVal = getVal(1, j);
        const power = parseInt(powerVal) || 0; // Row 2
        if (power === 0) continue;

        const model = {
          name: `АД-${power} (${brandName})`,
          nominalPowerKw: power,
          engineModel: getVal(2, j),
          engineType: getVal(3, j),
          displacementL: getVal(5, j),
          cylinders: getVal(6, j),
          controlSystem: getVal(7, j),
          injectionSystem: getVal(8, j),
          aspiration: getVal(9, j),
          coolingL: getVal(10, j),
          lubeL: getVal(11, j),
          fuelCons100: parseFloat(getVal(13, j)) || 0,
          fuelCons75: parseFloat(getVal(14, j)) || 0,
          fuelCons50: parseFloat(getVal(15, j)) || 0,
          oilConsRel: getVal(17, j),
          oilConsUdel: getVal(18, j),
          sysVoltage: getVal(19, j),
          generatorModel: getVal(21, j),
          genType: getVal(22, j),
          genAmps: getVal(23, j),
          genKw: parseFloat(getVal(24, j)) || 0,
          genCosPhi: getVal(25, j),
          genEff100: getVal(26, j),
          genEff90: getVal(27, j),
          genExcitation: getVal(28, j),
          genRegulator: getVal(29, j),
          genOverload: getVal(30, j),
          genShortCircuit: getVal(31, j),
          genWindings: getVal(32, j),
          genProtection: getVal(33, j),
          genInsulation: getVal(34, j),
          controller: getVal(37, j),
          fuelTankL: parseInt(getVal(38, j)) || 0,
          unattended75: getVal(39, j),
          unattended100: getVal(40, j),
          // Defaults for missing XML data
          electricityClass: "G3",
          minLoad: "25%",
          serviceInterval: "500 м.ч.",
          dimOpen: "см. чертеж",
          dimEnclosure: "см. чертеж",
          dimContainer: "см. чертеж",
          weightOpen: "н/д",
          weightEnclosure: "н/д",
          weightContainer: "н/д"
        };
        models.push(model);
      }

      if (models.length > 0) {
        manufacturers.push({
          id: brandName.toLowerCase(),
          name: brandName,
          models
        });
      }
    }

    cachedSpecs = manufacturers;
    return manufacturers;
  } catch (error) {
    console.error('Error parsing XML specs:', error);
    return [];
  }
}

async function bootstrap() {
  // Initialize database
  db.exec(`
    CREATE TABLE IF NOT EXISTS managers (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT, -- New field for password
    photoUrl TEXT,
    role TEXT DEFAULT 'manager' -- 'admin' or 'manager'
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE, -- New slugs for better links
    clientName TEXT,
    managerId TEXT,
    items TEXT, -- JSON array of specs items
    blocks TEXT, -- JSON array of CP blocks (for visual editor)
    fuelPrice REAL,
    toRate REAL,
    showCompanyInfo INTEGER,
    usePurpose INTEGER,
    useControlPanel INTEGER,
    purposeType TEXT,
    createdAt TEXT,
    viewCount INTEGER DEFAULT 0,
    lastViewedAt TEXT,
    firstViewedAt TEXT,
    FOREIGN KEY(managerId) REFERENCES managers(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS questionnaires (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    managerId TEXT,
    companyName TEXT,
    contactPerson TEXT,
    phone TEXT,
    email TEXT,
    data TEXT, -- JSON blob of the questionnaire answers
    status TEXT DEFAULT 'pending', -- 'pending' or 'completed'
    createdAt TEXT,
    completedAt TEXT,
    FOREIGN KEY(managerId) REFERENCES managers(id)
  );
`);

  // Migrations: Add role to managers if not exists
  const managersInfo = db.prepare("PRAGMA table_info(managers)").all() as any[];
  if (!managersInfo.some(col => col.name === 'role')) {
    db.prepare("ALTER TABLE managers ADD COLUMN role TEXT DEFAULT 'manager'").run();
  }

  // Migrations: Add password to managers if not exists
  if (!managersInfo.some(col => col.name === 'password')) {
    db.prepare("ALTER TABLE managers ADD COLUMN password TEXT").run();
  }

  // Migrations: Add blocks to proposals if not exists
  const proposalsInfo = db.prepare("PRAGMA table_info(proposals)").all() as any[];
  if (!proposalsInfo.some(col => col.name === 'blocks')) {
    db.prepare("ALTER TABLE proposals ADD COLUMN blocks TEXT").run();
  }

  // Migrations: Add slug to proposals if not exists
  if (!proposalsInfo.some(col => col.name === 'slug')) {
    db.prepare("ALTER TABLE proposals ADD COLUMN slug TEXT").run();
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_proposals_slug ON proposals(slug)").run();
  }

// Bootstrap admin if not exists
const adminEmail = 'seo@comd.ru';
const existingAdmin = db.prepare('SELECT * FROM managers WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  db.prepare('INSERT INTO managers (id, name, email, phone, role) VALUES (?, ?, ?, ?, ?)').run(
    'admin-1', 'Admin', adminEmail, '', 'admin'
  );
}

const app = express();
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/specs', (req, res) => {
  const specs = parseSpecsXml();
  res.json(specs);
});

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const manager = db.prepare('SELECT * FROM managers WHERE email = ?').get(email) as any;
  
  if (!manager) {
    return res.status(401).json({ error: 'Пользователь не найден. Обратитесь к администратору.' });
  }

  if (manager.password && manager.password !== password) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }

  res.json(manager);
});

app.get('/api/managers', (req, res) => {
  const managers = db.prepare(`
    SELECT m.*, 
    (SELECT COUNT(*) FROM proposals p WHERE p.managerId = m.id) as proposalCount,
    (SELECT SUM(p.viewCount) FROM proposals p WHERE p.managerId = m.id) as totalViews
    FROM managers m
  `).all();
  res.json(managers);
});

app.post('/api/managers', (req, res) => {
  const { name, email, phone, role, password } = req.body;
  const id = Math.random().toString(36).substring(2, 11);
  try {
    db.prepare('INSERT INTO managers (id, name, email, phone, role, password) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, name, email, phone, role || 'manager', password || ''
    );
    res.json({ id, name, email, phone, role });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/managers/:id', (req, res) => {
  const manager = db.prepare('SELECT * FROM managers WHERE id = ?').get(req.params.id);
  if (manager) res.json(manager);
  else res.status(404).json({ error: 'Not found' });
});

app.put('/api/managers/:id', (req, res) => {
  const { name, phone, email, photoUrl, role, password } = req.body;
  db.prepare('UPDATE managers SET name = ?, phone = ?, email = ?, photoUrl = ?, role = ?, password = ? WHERE id = ?').run(
    name, phone, email, photoUrl, role, password, req.params.id
  );
  res.json({ success: true });
});

app.delete('/api/managers/:id', (req, res) => {
  // Prevent deleting the last admin or the master admin
  const manager = db.prepare('SELECT * FROM managers WHERE id = ?').get(req.params.id) as any;
  if (manager?.email === adminEmail) {
    return res.status(403).json({ error: 'Cannot delete master admin' });
  }
  db.prepare('DELETE FROM managers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/proposals', (req, res) => {
  const { managerId } = req.query;
  let proposals;
  const baseQuery = `
    SELECT p.*, m.name as managerName 
    FROM proposals p 
    LEFT JOIN managers m ON p.managerId = m.id
  `;
  if (managerId) {
    proposals = db.prepare(`${baseQuery} WHERE p.managerId = ? ORDER BY p.createdAt DESC`).all(managerId);
  } else {
    proposals = db.prepare(`${baseQuery} ORDER BY p.createdAt DESC`).all();
  }
  res.json((proposals as any[]).map(p => ({
    ...p,
    items: JSON.parse(p.items || '[]'),
    blocks: JSON.parse(p.blocks || '[]'),
    showCompanyInfo: !!p.showCompanyInfo,
    usePurpose: !!p.usePurpose,
    useControlPanel: !!p.useControlPanel
  })));
});

app.get('/api/proposals/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ? OR slug = ?').get(idOrSlug, idOrSlug) as any;
  if (proposal) {
    res.json({
      ...proposal,
      items: JSON.parse(proposal.items || '[]'),
      blocks: JSON.parse(proposal.blocks || '[]'),
      showCompanyInfo: !!proposal.showCompanyInfo,
      usePurpose: !!proposal.usePurpose,
      useControlPanel: !!proposal.useControlPanel
    });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/proposals', (req, res) => {
  const id = Math.random().toString(36).substring(2, 11);
  const data = req.body;
  const slug = data.slug || id;

  try {
    db.prepare(`
      INSERT INTO proposals (
        id, slug, clientName, managerId, items, blocks, fuelPrice, toRate, 
        showCompanyInfo, usePurpose, useControlPanel, purposeType, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, slug, data.clientName, data.managerId, JSON.stringify(data.items || []), JSON.stringify(data.blocks || []), 
      data.fuelPrice, data.toRate,
      data.showCompanyInfo ? 1 : 0, data.usePurpose ? 1 : 0, data.useControlPanel ? 1 : 0, data.purposeType,
      new Date().toISOString()
    );
    res.json({ id, slug });
  } catch (e: any) {
    // If slug is taken, fallback to ID or append something
    res.status(400).json({ error: 'Slug related error: ' + e.message });
  }
});

app.put('/api/proposals/:id', (req, res) => {
  const data = req.body;
  db.prepare(`
    UPDATE proposals SET 
      clientName = ?, slug = ?, items = ?, blocks = ?, fuelPrice = ?, toRate = ?, 
      showCompanyInfo = ?, usePurpose = ?, useControlPanel = ?, purposeType = ?
    WHERE id = ?
  `).run(
    data.clientName, data.slug, JSON.stringify(data.items || []), JSON.stringify(data.blocks || []), 
    data.fuelPrice, data.toRate,
    data.showCompanyInfo ? 1 : 0, data.usePurpose ? 1 : 0, data.useControlPanel ? 1 : 0, data.purposeType,
    req.params.id
  );
  res.json({ success: true });
});

app.delete('/api/proposals/:id', (req, res) => {
  db.prepare('DELETE FROM proposals WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/proposals/:idOrSlug/view', (req, res) => {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE proposals SET 
      viewCount = viewCount + 1,
      lastViewedAt = ?,
      firstViewedAt = COALESCE(firstViewedAt, ?)
    WHERE id = ? OR slug = ?
  `).run(now, now, req.params.idOrSlug, req.params.idOrSlug);
  res.json({ success: true });
});

// Questionnaire Routes
app.get('/api/questionnaires', (req, res) => {
  const { managerId } = req.query;
  let questionnaires;
  if (managerId) {
    questionnaires = db.prepare('SELECT q.*, m.name as managerName FROM questionnaires q LEFT JOIN managers m ON q.managerId = m.id WHERE q.managerId = ? ORDER BY q.createdAt DESC').all(managerId);
  } else {
    questionnaires = db.prepare('SELECT q.*, m.name as managerName FROM questionnaires q LEFT JOIN managers m ON q.managerId = m.id ORDER BY q.createdAt DESC').all();
  }
  res.json((questionnaires as any[]).map(q => ({
    ...q,
    data: JSON.parse(q.data || '{}')
  })));
});

app.get('/api/questionnaires/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const questionnaire = db.prepare('SELECT q.*, m.name as managerName FROM questionnaires q LEFT JOIN managers m ON q.managerId = m.id WHERE q.id = ? OR q.slug = ?').get(idOrSlug, idOrSlug) as any;
  if (questionnaire) {
    res.json({
      ...questionnaire,
      data: JSON.parse(questionnaire.data || '{}')
    });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/questionnaires', (req, res) => {
  const id = Math.random().toString(36).substring(2, 11);
  const data = req.body;
  const slug = data.slug || id;

  try {
    db.prepare(`
      INSERT INTO questionnaires (
        id, slug, managerId, companyName, contactPerson, phone, email, data, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, slug, data.managerId, data.companyName, data.contactPerson, data.phone, data.email, 
      JSON.stringify(data.data || {}), new Date().toISOString()
    );
    res.json({ id, slug });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/questionnaires/:id', (req, res) => {
  const data = req.body;
  const now = data.status === 'completed' ? new Date().toISOString() : null;
  
  db.prepare(`
    UPDATE questionnaires SET 
      companyName = ?, contactPerson = ?, phone = ?, email = ?, 
      data = ?, status = ?, completedAt = COALESCE(completedAt, ?)
    WHERE id = ?
  `).run(
    data.companyName, data.contactPerson, data.phone, data.email, 
    JSON.stringify(data.data || {}), data.status || 'pending', now, req.params.id
  );
  res.json({ success: true });
});

app.delete('/api/questionnaires/:id', (req, res) => {
  db.prepare('DELETE FROM questionnaires WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Settings Routes
app.get('/api/settings/:key', (req, res) => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key) as any;
  if (row) {
    res.json({ value: JSON.parse(row.value) });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/settings/:key', (req, res) => {
  const { value } = req.body;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    req.params.key, 
    JSON.stringify(value)
  );
  res.json({ success: true });
});

// Vite Middleware
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
