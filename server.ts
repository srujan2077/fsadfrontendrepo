import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store (simulating the Spring Boot H2 database)
  let nodes = [
    { id: 1, title: 'Network Security', provider: 'Srujan', rate: '$150/hr', desc: 'Implementation of zero-knowledge proofs and secure data pipelines.' },
    { id: 2, title: 'Systems Infrastructure', provider: 'Hari Haran', rate: '$120/hr', desc: 'Scalable backend systems and high-security API integrations.' }
  ];

  let logs = [
    { id: 1, action: 'NODE_DEPLOY', user: 'Srujan', timestamp: new Date().toISOString() },
    { id: 2, action: 'SYSTEM_BOOT', user: 'SYSTEM', timestamp: new Date().toISOString() }
  ];

  let users = [
    { id: 1, username: 'srujan', role: 'pro', status: 'active' },
    { id: 2, username: 'hari', role: 'pro', status: 'active' },
    { id: 3, username: 'client_alpha', role: 'user', status: 'active' }
  ];

  // API Routes (ProConnect Network API)
  app.get("/api/v1/network/nodes", (req, res) => {
    res.json(nodes);
  });

  app.get("/api/v1/network/logs", (req, res) => {
    res.json(logs);
  });

  app.get("/api/v1/network/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/v1/network/deploy", (req, res) => {
    const newNode = {
      id: Date.now(),
      ...req.body
    };
    nodes.push(newNode);
    logs.push({ id: Date.now(), action: 'NODE_DEPLOY', user: newNode.provider, timestamp: new Date().toISOString() });
    res.status(201).json(newNode);
  });

  app.put("/api/v1/network/update/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = nodes.findIndex(n => n.id === id);
    if (index !== -1) {
      nodes[index] = { ...nodes[index], ...req.body };
      logs.push({ id: Date.now(), action: 'NODE_UPDATE', user: 'ADMIN', timestamp: new Date().toISOString() });
      res.json(nodes[index]);
    } else {
      res.status(404).send();
    }
  });

  app.delete("/api/v1/network/revoke/:id", (req, res) => {
    const id = parseInt(req.params.id);
    nodes = nodes.filter(n => n.id !== id);
    logs.push({ id: Date.now(), action: 'NODE_REVOKE', user: 'ADMIN', timestamp: new Date().toISOString() });
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
