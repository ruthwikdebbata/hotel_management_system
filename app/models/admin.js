// models/admin.js
const db     = require('../services/db');
const bcrypt = require('bcryptjs');

class Admin {
  constructor({ id = null, email }) {
    this.id    = id;
    this.email = email;
  }

  // Look up an admin by email
  static async findByEmail(email) {
    const sql = 'SELECT id, email, password FROM admins WHERE email = ?';
    const rows = await db.query(sql, [email]);
    if (!rows.length) return null;
    // return an instance with the hashed password tacked on
    const { id, password } = rows[0];
    const admin = new Admin({ id, email });
    admin.hashedPassword = password;
    return admin;
  }

  // Create a new admin (hashes password)
  async create(rawPassword) {
    const pwHash = await bcrypt.hash(rawPassword, 10);
    const sql    = 'INSERT INTO admins (email, password) VALUES (?, ?)';
    const result = await db.query(sql, [this.email, pwHash]);
    this.id = result.insertId;
    return this.id;
  }

  // Check a submitted password against the hash
  async authenticate(submittedPassword) {
    if (!this.hashedPassword) {
      // load it if not already loaded
      const sql = 'SELECT password FROM admins WHERE id = ?';
      const rows = await db.query(sql, [this.id]);
      if (!rows.length) return false;
      this.hashedPassword = rows[0].password;
    }
    return bcrypt.compare(submittedPassword, this.hashedPassword);
  }
}

module.exports = { Admin };
