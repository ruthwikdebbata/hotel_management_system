// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));
// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
    res.render("index");
});

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});

app.get("/rooms", function (req, res) {
    let { roomType, priceRange, status } = req.query;
    let sql = "SELECT * FROM rooms WHERE 1=1";
    let params = [];

    // Filtering by Room Type
    if (roomType) {
        sql += " AND type = ?";
        params.push(roomType);
    }

    // Filtering by Price Range
    if (priceRange) {
        let [minPrice, maxPrice] = priceRange.split("-");
        sql += " AND price BETWEEN ? AND ?";
        params.push(minPrice, maxPrice);
    }

    // Filtering by Status (Available / Booked)
    if (status) {
        sql += " AND status = ?";
        params.push(status);
    }

    db.query(sql, params)
        .then(results => {
            res.render('rooms', { rooms: results });
        })
        .catch(err => {
            console.error("Error fetching rooms:", err);
            res.status(500).send("Error fetching rooms");
        });
});

app.get("/rooms/:room_id", function (req, res) {
    const roomId = req.params.room_id;
    const sql = "SELECT * FROM rooms WHERE room_id = ?";

    db.query(sql, [roomId])
        .then(results => {
            if (results.length > 0) {
                res.render("details", { room: results[0] });
            } else {
                res.status(404).send("Room not found");
            }
        })
        .catch(err => {
            console.error("Error fetching room details:", err);
            res.status(500).send("Error fetching room details");
        });
});

// Create a route for root - /
app.get("/contact", function(req, res) {
    res.render("contactus");
});




// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});