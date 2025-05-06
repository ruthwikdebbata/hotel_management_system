// models/user.js
const db = require('../services/db');
const bcrypt = require('bcryptjs');

class User {
  id;
  name;
  email;
  phone;
  contactNumber;
  address;
  role;

  constructor(name, email, phone, contactNumber = null, address = null, role = 'customer') {
    this.name           = name;
    this.email          = email;
    this.phone          = phone;
    this.contactNumber  = contactNumber;
    this.address        = address;
    this.role           = role;
  }

  // Look up user_id by email
  async getIdFromEmail() {
    const sql = 'SELECT user_id FROM users WHERE email = ?';
    const result = await db.query(sql, [this.email]);
    if (result.length) {
      this.id = result[0].user_id;
      return this.id;
    }
    return false;
  }

  // Update password for an existing user
  async setUserPassword(password) {
    const pw = await bcrypt.hash(password, 10);
    const sql = 'UPDATE users SET password = ? WHERE user_id = ?';
    await db.query(sql, [pw, this.id]);
    return true;
  }

  // Create a new user record
  async addUser(password) {
    const pw = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users
        (name, email, phone, contactNumber, address, password, role)
      VALUES (?,    ?,     ?,     ?,             ?,       ?,       ?)
    `;
    const params = [
      this.name, 
      this.email, 
      this.phone, 
      this.contactNumber, 
      this.address, 
      pw, 
      this.role
    ];
    const result = await db.query(sql, params);
    this.id = result.insertId;
    return true;
  }

  // Check submitted password
  async authenticate(submitted) {
    const sql = 'SELECT password FROM users WHERE user_id = ?';
    const result = await db.query(sql, [this.id]);
    if (result.length && await bcrypt.compare(submitted, result[0].password)) {
      return true;
    }
    return false;
  }
}

module.exports = { User };
