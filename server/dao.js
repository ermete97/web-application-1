"use strict"

//DAO module for accessing tasks
//Data Access Object

const bcrypt = require("bcrypt");

const sqlite = require('sqlite3');

const db = new sqlite.Database("./DB.sqlite", (err) => {
    if (err) throw err;
});

/**
 * This function accesses the database and returns the complete list of all vehicles
 * if fun is setted on "get_number", it returns the number of vehicles
 */
exports.listVehicles = function (category, brand, fun) {
    return new Promise((resolve, reject) => {
        let sql;
        const params = [];
        if (category === null && brand === null) sql = "SELECT * FROM vehicles";
        else if (category === "all" && brand === "all") {
            sql = "SELECT id FROM vehicles"
        } else if (category === "all") {
            sql = "SELECT * FROM vehicles WHERE brand = ?"
            params.push(brand);
        } else if (brand == "all") {
            sql = "SELECT * FROM vehicles WHERE category = ?"
            params.push(category);
        } else {
            sql = "SELECT * FROM vehicles WHERE brand = ? AND category = ?";
            params.push(brand);
            params.push(category);
        }
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (fun === "get_number") {
                resolve(rows.length)
                return;
            }
            const vehicles = rows.map((v) => ({
                id: v.id,
                category: v.category,
                brand: v.brand,
                model: v.model,
            }));
            resolve(vehicles);
        })
    })
}

/**
 * This function accesses the database and returns the complete list of all brands
 */
exports.listBrands = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT DISTINCT brand FROM vehicles"
        let id = 0;
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const brands = rows.map((b) => ({
                id: id++,
                name_brand: b,
            }));
            resolve(brands);
        })
    })
}

/**
 * This function accesses the database and returns a list of free vehicles
 * according to given category, brand and date.
 * If fun is setted, it returns the number of free vehicles and the first id
 */
exports.getFreeVehicles = function (fun, category, brand, start_date, end_date) {
    return new Promise((resolve, reject) => {
        let sql;
        const params = [];
        if (category === "all" && brand === "all") {
            sql = "SELECT id FROM vehicles"
        } else if (category === "all") {
            sql = "SELECT id FROM vehicles WHERE brand = ?"
            params.push(brand);
        } else if (brand == "all") {
            sql = "SELECT id FROM vehicles WHERE category = ?"
            params.push(category);
        } else {
            sql = "SELECT id FROM vehicles WHERE brand = ? AND category = ?";
            params.push(brand);
            params.push(category);
        }
        if (start_date && end_date) {
            sql += " EXCEPT SELECT id_vehicle FROM rentals"
            sql += " WHERE (start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?)"
            params.push(start_date);
            params.push(start_date);
            params.push(end_date);
            params.push(end_date);
            params.push(start_date);
            params.push(end_date);
        }
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (fun === "get_number") {
                if (rows.length > 0) resolve({ number: rows.length, firstId: rows[0].id });
                else resolve({ number: rows.length, firstId: -1 })
                return;
            }
            const freeVehicles = rows.map((fv) => ({
                id: fv.id,
            }));
            resolve(freeVehicles);
        })
    })
}

/**
 * This function accesses the database and returns the complete list of all rentals of user,
 * if fun is setted on "get_number", it returns the number of passed rentals
 */
exports.listRentalOfUser = function (user, fun) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM rentals WHERE user = ?";
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (fun === "get_number") {
                rows = rows.filter((r) => r.end_date < Date.parse(Date()));
                resolve(rows.length);
                return;
            }
            const rentals = rows.map((r) => ({
                id: r.id,
                id_vehicle: r.id_vehicle,
                user: r.user,
                start_date: r.start_date,
                end_date: r.end_date,
                price: r.price,
                category_of_vehicle: r.category_of_vehicle,
                age_of_driver: r.age_of_driver,
                additional_drivers: r.additional_drivers,
                avg_kmperday: r.avg_kmperday,
                extra_insurance: r.extra_insurance,
            }));
            resolve(rentals);
        })
    })
}

/**
 * This function adds a new rental to DB if it is possible.
 * If there are some problems, it returns false
 */
exports.addRental = function (rental) {
    const now = Date.parse(Date());
    return new Promise((resolve, reject) => {
        if (rental.start_date > rental.end_date || rental.start_date < now) {
            resolve(false);
            return;
        }

        const sql = "INSERT INTO rentals(id_vehicle, user, start_date, end_date, price, category_of_vehicle, age_of_driver, additional_drivers, avg_kmperday, extra_insurance) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.run(sql,
            [
                rental.id_vehicle,
                rental.user,
                rental.start_date,
                rental.end_date,
                rental.price,
                rental.category_of_vehicle,
                rental.age_of_driver,
                rental.additional_drivers,
                rental.avg_kmperday,
                rental.extra_insurance,
            ],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(true);
            });

    })
}

/**
 * This function deletes a rental from DB
 */
exports.deleteRental = function (id, userID) {
    const now = Date.parse(Date());
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM rentals WHERE id = ? AND start_date > ${now} AND user = ?`
        db.run(sql, [id, userID], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(id);
        })
    })
}

/**
 * Function to control login operations
 */
exports.checkPwd = function (user, pass) {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM users WHERE email = ?";
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows.length === 0) {
                reject(null);
                return;
            }

            const pwdHash = rows[0].password;

            bcrypt.compare(pass, pwdHash, function (err, res) {
                if (err) reject(err);
                else {
                    if (res) {
                        resolve({
                            userID: rows[0].email,
                            name: rows[0].name,
                        });
                        return;
                    } else {
                        reject(null);
                        return;
                    }
                }
            });
        })
    })
}

/**
 * Function to check that the rental price is correct
 */
exports.checkPrice = function (rental, number, percentageVehicles) {
    return new Promise((resolve, reject) => {
        let price;
        if (!percentageVehicles) reject(false);

        if (rental.category_of_vehicle === "A") price = 80;
        else if (rental.category_of_vehicle === "B") price = 70;
        else if (rental.category_of_vehicle === "C") price = 60;
        else if (rental.category_of_vehicle === "D") price = 50;
        else if (rental.category_of_vehicle === "E") price = 40;

        if (rental.avg_kmperday === 0) price = price * 0.95;
        else if (rental.avg_kmperday === 2) price = price * 1.05;

        if (rental.age_of_driver === 0) price = price * 1.05;
        else if (rental.age_of_driver === 2) price = price * 1.1;

        if (rental.additional_drivers === 1) price = price * 1.15;

        if (rental.extra_insurance === 1) price = price * 1.2;

        if (percentageVehicles < 0.1) price * 1.1;

        if (number >= 3) price = price * 0.9;

        let days = rental.end_date - rental.start_date;
        days = days / 86400000;
        days++;
        price = price * days;

        price = price.toFixed(2);

        resolve(price === rental.price);
    })
}