const db = require('../services/db');

class Booking {
  booking_id;
  user_id;
  room_id;
  check_in;
  check_out;
  total_price;
  status;
  created_at;

  constructor({ booking_id = null, user_id, room_id, check_in, check_out, total_price, status = 'Pending', created_at = null }) {
    this.booking_id  = booking_id;
    this.user_id     = user_id;
    this.room_id     = room_id;
    this.check_in    = check_in;
    this.check_out   = check_out;
    this.total_price = total_price;
    this.status      = status;
    this.created_at  = created_at;
  }

  // --- Static methods for reads ---

  // Get all bookings
  static async getAll() {
    const sql = 'SELECT * FROM bookings';
    return await db.query(sql);
  }

  // Get a single booking by ID
  static async getById(id) {
    const sql = 'SELECT * FROM bookings WHERE booking_id = ?';
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }

  // --- Instance methods for create/update/delete ---

  // Create a new booking record
  async create() {
    const sql = `
      INSERT INTO bookings
        (user_id, room_id, check_in, check_out, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      this.user_id,
      this.room_id,
      this.check_in,
      this.check_out,
      this.total_price,
      this.status
    ];
    const result = await db.query(sql, params);
    this.booking_id = result.insertId;
    return this.booking_id;
  }

  // Update an existing booking (only status, dates, or price here—but you can extend)
  async update() {
    const sql = `
      UPDATE bookings
      SET user_id    = ?,
          room_id    = ?,
          check_in   = ?,
          check_out  = ?,
          total_price= ?,
          status     = ?
      WHERE booking_id = ?
    `;
    const params = [
      this.user_id,
      this.room_id,
      this.check_in,
      this.check_out,
      this.total_price,
      this.status,
      this.booking_id
    ];
    await db.query(sql, params);
    return true;
  }

  // Delete a booking
  static async delete(id) {
    const sql = 'DELETE FROM bookings WHERE booking_id = ?';
    await db.query(sql, [id]);
    return true;
  }
}

module.exports = { Booking };
