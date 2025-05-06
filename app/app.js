// Import express.js
const express = require("express");
const { User } = require("./models/user");
const db = require("./services/db");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const bodyParser = require('body-parser');
const { Booking } = require('./models/booking');
const { Admin } = require('./models/admin');

// Create express app
const app = express();

// Static files
app.use(express.static("static"));

// Pug templating
app.set('view engine', 'pug');
app.set('views', './app/views');

// Session setup
const oneDay = 1000 * 60 * 60 * 24;
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: "driveyourpassion",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: oneDay }
}));

app.use((req, res, next) => {
    res.locals.loggedIn = req.session.loggedIn || false;
    // you could do: res.locals.user = req.session.user || null;
    next();
  });

// Home page
app.get('/', (req, res) => {
    res.render('index');
});

// Show login form
app.get('/admin/login', (req, res) => {
    res.render('admin-login', { error: null });
  });
  
  // Handle login POST
  app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        return res.render('admin-login', { error: 'Invalid email or password' });
      }
      const ok = await admin.authenticate(password);
      if (!ok) {
        return res.render('admin-login', { error: 'Invalid email or password' });
      }
      // success!
      req.session.adminId = admin.id;
      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

// Registration form
app.get('/register', (req, res) => {
    res.render('register');
});

// Authentication (login)
app.post('/authenticate', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send('Email and password are required.');
        }

        // Only email needed to fetch user
        const user = new User(
            null,    // name
            email,
            null,    // phone
            null,    // contactNumber
            null     // address
        );
        const uId = await user.getIdFromEmail();
        if (!uId) {
            return res.status(401).send('Invalid email');
        }

        const match = await user.authenticate(password);
        if (!match) {
            return res.status(401).send('Invalid password');
        }

        req.session.uid = uId;
        req.session.loggedIn = true;
        res.redirect('/rooms');
    } catch (err) {
        console.error('Error while authenticating user:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/login');
    });
});

// Login page
app.get('/login', (req, res) => {
    if (req.session.uid) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

// Set password / Register endpoint
app.post('/set-password', async (req, res) => {
    const { name, email, phone, password, contactNumber, address } = req.body;
  
    if (!name || !email || !phone || !password) {
      return res.status(400).send('Name, email, phone, and password are required.');
    }
  
    const user = new User(name, email, phone, contactNumber, address);
    const uId  = await user.getIdFromEmail();
  
    if (uId) {
      await user.setUserPassword(password);
      return res.status(200).send('Password updated successfully.');
    } else {
      await user.addUser(password);
      return res.status(201).send('New user created successfully.');
    }
  });
  
// Database test route
app.get('/db_test', (req, res) => {
    const sql = 'SELECT * FROM test_table';
    db.query(sql)
      .then(results => res.send(results))
      .catch(err => {
          console.error('Error testing database:', err);
          res.status(500).send('Database Error');
      });
});

// List rooms with optional filters
app.get('/rooms', (req, res) => {
    let { roomType, priceRange, status } = req.query;
    let sql = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];

    if (roomType) {
        sql += ' AND type = ?';
        params.push(roomType);
    }
    if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-');
        sql += ' AND price BETWEEN ? AND ?';
        params.push(minPrice, maxPrice);
    }
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }

    db.query(sql, params)
      .then(results => res.render('rooms', { rooms: results }))
      .catch(err => {
          console.error('Error fetching rooms:', err);
          res.status(500).send('Error fetching rooms');
      });
});

// Room details
app.get('/rooms/:room_id', (req, res) => {
    const roomId = req.params.room_id;
    const sql = 'SELECT * FROM rooms WHERE room_id = ?';

    db.query(sql, [roomId])
      .then(results => {
          if (results.length > 0) {
              res.render('details', { room: results[0] });
          } else {
              res.status(404).send('Room not found');
          }
      })
      .catch(err => {
          console.error('Error fetching room details:', err);
          res.status(500).send('Error fetching room details');
      });
});

// Contact page
app.get('/contact', (req, res) => {
    res.render('contactus');
});

// Services page
app.get('/services', (req, res) => {
    res.render('commingsoon');
});

app.get('/reservations', async (req, res) => {
    // 1) Require login
    if (!req.session.uid) {
      return res.redirect('/login');
    }
  
    const sql = `
      SELECT b.booking_id,
             b.check_in, b.check_out, b.total_price, b.status,
             r.room_number, r.type
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
       WHERE b.user_id = ?
       ORDER BY b.check_in DESC
    `;
  
    try {
      // 2) Fetch reservations
      const reservations = await db.query(sql, [req.session.uid]);
  
      // 3) Render the Pug template
      res.render('reservations', { reservations });
    } catch (err) {
      console.error('Error loading reservations:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  
// Goodbye route
app.get('/goodbye', (req, res) => {
    res.send('Goodbye world!');
});

// Hello route
app.get('/hello/:name', (req, res) => {
    res.send(`Hello ${req.params.name}`);
});



// —─ List all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// —─ Get one booking
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.getById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// —─ Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { user_id, room_id, check_in, check_out, total_price, status } = req.body;
    if (!user_id || !room_id || !check_in || !check_out || !total_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const booking = new Booking({ user_id, room_id, check_in, check_out, total_price, status });
    const id = await booking.create();
    res.status(201).json({ booking_id: id });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// —─ Update an existing booking
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const existing = await Booking.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Booking not found' });

    const updates = { ...existing, ...req.body };
    const booking = new Booking(updates);
    await booking.update();
    res.json({ message: 'Booking updated' });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// —─ Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const existing = await Booking.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Booking not found' });

    await Booking.delete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Fetch a room & show the booking form
app.get('/book/:room_id', (req, res) => {
    const roomId = req.params.room_id;
    const sql    = 'SELECT * FROM rooms WHERE room_id = ?';
  
    db.query(sql, [roomId])
      .then(results => {
        if (results.length === 0) {
          return res.status(404).send('Room not found');
        }
        // Render booking.pug (make sure it's at app/views/booking.pug)
        res.render('booking', {
          room: results[0],
          check_in: '',
          check_out: '',
          total_price: ''
        });
      })
      .catch(err => {
        console.error('Error fetching room for booking:', err);
        res.status(500).send('Internal Server Error');
      });
  });
  

  app.post('/book/:room_id', async (req, res) => {
    try {
      // load room to get price
      const [room] = await db.query('SELECT * FROM rooms WHERE room_id = ?', [req.params.room_id]);
      if (!room) return res.status(404).send('Room not found');
  
      const { check_in, check_out } = req.body;
      const inDate  = new Date(check_in);
      const outDate = new Date(check_out);
  
      if (outDate <= inDate) {
        return res.render('booking', {
          room,
          check_in,
          check_out,
          total_price: '',
          error: 'Check-out must be after check-in'
        });
      }
  
      const nights     = Math.round((outDate - inDate) / (24*60*60*1000));
      const totalPrice = (nights * parseFloat(room.price)).toFixed(2);
  
      const booking = new Booking({
        user_id:    req.session.uid,     // make sure the user is logged in!
        room_id:    room.room_id,
        check_in,
        check_out,
        total_price: totalPrice,
        status:     'Pending'
      });
      await booking.create();
  
      res.redirect('/reservations');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

// Start server
app.listen(3000, () => {
    console.log('Server running at http://127.0.0.1:3000/');
});
