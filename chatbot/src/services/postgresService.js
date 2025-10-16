import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// Configuration du pool de connexions Postgres
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum de connexions dans le pool
  idleTimeoutMillis: 30000, // Fermeture des connexions inactives après 30s
  connectionTimeoutMillis: 2000, // Timeout de connexion de 2s
});

// Gestion des erreurs de connexion
pool.on('error', (err) => {
  console.error('Erreur Postgres inattendue:', err);
});

// Test de connexion au démarrage
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connexion Postgres échouée:', err.message);
  } else {
    console.log('✅ Connexion Postgres établie:', res.rows[0].now);
  }
});

export { pool };
