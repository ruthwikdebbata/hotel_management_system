// Import express.js
const express = require("express");
const { User } = require("./models/user");
const db = require("./services/db");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const bodyParser = require('body-parser');

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

// Reservations page
app.get('/reservations', (req, res) => {
    res.render('commingsoon');
});

// Goodbye route
app.get('/goodbye', (req, res) => {
    res.send('Goodbye world!');
});

// Hello route
app.get('/hello/:name', (req, res) => {
    res.send(`Hello ${req.params.name}`);
});

// Start server
app.listen(3000, () => {
    console.log('Server running at http://127.0.0.1:3000/');
});
