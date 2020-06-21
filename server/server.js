const express = require('express');

const PORT = 3001;

app = new express();
const morgan = require("morgan");
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { check, validationResult } = require("express-validator");
const dao = require("./dao.js");

const jwtSecretContent = require('./secret.js');
const jwtSecret = jwtSecretContent.jwtSecret;

//set-up logging
app.use(morgan("common"));

//process body content
app.use(express.json());

// DB error
const dbErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Database error' }] };
// Authorization error
const authErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Authorization error' }] };

const expireTime = 300; // 5 minutes

// Authentication endpoint
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    dao.checkPwd(username, password)
        .then((userObj) => {
            const token = jsonwebtoken.sign({ userID: userObj.userID }, jwtSecret, { expiresIn: expireTime });
            res.cookie('token', token, { httpOnly: true, sameSite: true, maxAge: 1000 * expireTime });
            res.json(userObj);
        }).catch(
            () => new Promise((resolve) => {
                setTimeout(resolve, 3000)
            }).then(
                () => res.status(401).end()
            )
        );
});

app.use(cookieParser());

const csrfProtection = csrf({
    cookie: { httpOnly: true, sameSite: true }
});

// Provide an endpoint for the App to retrieve the CSRF token
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});


app.post('/logout', (req, res) => {
    res.clearCookie('token').end();
});

//REST API endpoints

//Resources: veichle, rental, brand

//GET api/vehicles
app.get("/api/vehicles", (req, res) => {
    dao.listVehicles(null, null)
        .then((vehicles) => { res.json(vehicles) })
        .catch(() => { res.status(500).json(dbErrorObj) });
});

//GET api/vehicles/<category>/<brand>
app.get("/api/vehicles/:category/:brand", (req, res) => {
    dao.listVehicles(req.params.category, req.params.brand, req.query.fun)
        .then((vehicles) => { res.json(vehicles) })
        .catch(() => { res.status(500).json(dbErrorObj) });
});

//GET api/brands
app.get("/api/brands", (req, res) => {
    dao.listBrands()
        .then((brands) => { res.json(brands) })
        .catch(() => { res.status(500).json(dbErrorObj) });
});

// For the rest of the code, all APIs require authentication
app.use(
    jwt({
        secret: jwtSecret,
        getToken: req => req.cookies.token
    })
);

// To return a better object in case of errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json(authErrorObj);
    }
});

//GET api/num_of_free_vehicles
app.get("/api/vehicles/:category/:brand/free", (req, res) => {
    dao.getFreeVehicles(req.query.fun, req.params.category, req.params.brand, req.query.start_date, req.query.end_date)
        .then((fvs) => {
            res.json(fvs)
        })
        .catch(() => { res.status(500).json(dbErrorObj) });
});

//GET api/users/<id>/rentals
app.get("/api/rentals/:email", (req, res) => {
    const userID = req.user && req.user.userID;
    if (userID !== req.params.email) {
        res.json({ error: "Unauthorized" });
        return;
    }
    dao.listRentalOfUser(req.params.email, req.query.fun)
        .then((vehicles) => { res.json(vehicles) })
        .catch(() => { res.status(500).json(dbErrorObj) });
});

//POST /retals/
app.post("/api/rentals", csrfProtection, [
    check("id_vehicle").isNumeric(),
    check("start_date").isNumeric(),
    check("end_date").isNumeric(),
    check("category_of_vehicle").isAlpha().isLength({ min: 1, max: 1 }),
    check("age_of_driver").isNumeric(),
    check("additional_drivers").isNumeric(),
    check("avg_kmperday").isNumeric(),
    check("extra_insurance").isNumeric(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.json(false);
    const userID = req.user && req.user.userID;
    if (userID !== req.body.user.userID) {
        res.json(false);
        return;
    }
    const rental = {
        id_vehicle: req.body.id_vehicle,
        user: userID,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        price: req.body.price,
        category_of_vehicle: req.body.category_of_vehicle,
        age_of_driver: req.body.age_of_driver,
        additional_drivers: req.body.additional_drivers,
        avg_kmperday: req.body.avg_kmperday,
        extra_insurance: req.body.extra_insurance,
    }

    dao.listRentalOfUser(userID, "get_number")
        .then((number) => {
            dao.getFreeVehicles("get_number", rental.category_of_vehicle, "all", rental.start_date, rental.end_date)
                .then((num_of_free_vehicles) => {
                    dao.listVehicles(rental.category_of_vehicle, "all", "get_number")
                        .then((num_of_vehicles) => {
                            dao.checkPrice(rental, number, num_of_free_vehicles.number / num_of_vehicles)
                                .then((bool) => {
                                    if (bool) {
                                        dao.addRental(rental)
                                            .then((res_bool) => res.json(res_bool))
                                            .catch(() => res.status(500).json(dbErrorObj));
                                    } else res.json(false);
                                }).catch(() => res.json(false))
                        }).catch(() => res.json(false))
                }).catch(() => res.json(false))
        }).catch(() => res.json(false))
});

//DELETE /rentals/<rental_id>
app.delete("/api/rentals/:rental_id", csrfProtection, (req, res) => {
    const userID = req.user && req.user.userID;
    dao.deleteRental(req.params.rental_id, userID)
        .then((id) => { res.json(id) })
        .catch((err) => { res.status(500).json(dbErrorObj) });
});

//POST /api/stub
app.post("/api/stub", csrfProtection, [
    check("name").isLength({ min: 2 }),
    check("cc_number").isNumeric().isLength({ min: 16, max: 16 }),
    check("cvv").isAlphanumeric().isLength({ min: 3, max: 3 }),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.json(false);
    else res.json(true);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));