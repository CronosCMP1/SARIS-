import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'floricultura.db');
const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      images TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT NOT NULL,
      title TEXT,
      subtitle TEXT,
      buttonText TEXT,
      link TEXT
    );
  `);

  // Seed admin user if not exists
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const admin = stmt.get('admin');

  if (!admin) {
    const insert = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    insert.run('admin', 'admin123'); // In a real app, hash this!
  }
}

export default db;
