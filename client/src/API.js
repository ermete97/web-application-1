import { Brand, Vehicle } from "./Elements.js"

async function userLogin(username, password) {
    return new Promise((resolve, reject) => {
        fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password: password }),
        }).then((response) => {
            if (response.ok) {
                response.json()
                    .then((obj) => { resolve(obj) })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) })
            } else {
                response.json()
                    .then((obj) => { reject(obj) })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) })
            }
        })
    })
}

async function userLogout() {
    return new Promise((resolve, reject) => {
        fetch("/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            if (response.ok) resolve(null)
            else reject(response.id)
        })
    })
}

async function getBrands() {
    const response = await fetch("/api/brands");
    const brands_json = await response.json();
    if (response.ok) return brands_json.map((t) => Brand.from(t));
    else throw brands_json;
};

async function getVehicles(categoryFilters, brandFilters) {
    let results = [];
    if (categoryFilters.length === 0 && brandFilters.length === 0) {
        const response = await fetch("/api/vehicles");
        const vehicles_json = await response.json();
        if (response.ok) return vehicles_json.map((v) => Vehicle.from(v));
        else throw vehicles_json;
    } else if (categoryFilters.length !== 0 && brandFilters.length !== 0) {
        for (const cat of categoryFilters) {
            const response = await fetch(`/api/vehicles/${cat}/all`);
            const vehicles_json = await response.json();
            if (!response.ok) throw vehicles_json;
            // eslint-disable-next-line
            else vehicles_json.map((v) => results.push(Vehicle.from(v)));
        }
        results = results.filter((v) => {
            for (const b of brandFilters) {
                if (v.brand === b) return true;
            }
            return false;
        });
    } else if (categoryFilters.length === 0 && brandFilters.length !== 0) {
        for (const b of brandFilters) {
            const response = await fetch(`/api/vehicles/all/${b}`);
            const vehicles_json = await response.json();
            if (!response.ok) throw vehicles_json;
            else vehicles_json.map((v) => results.push(Vehicle.from(v)));
        }
    } else {
        for (const cat of categoryFilters) {
            const response = await fetch(`/api/vehicles/${cat}/all`);
            const vehicles_json = await response.json();
            if (!response.ok) throw vehicles_json;
            else vehicles_json.map((v) => results.push(Vehicle.from(v)));
        }
    }
    return results;
}

async function getNumberOfFreeVechicles(start_date, end_date, category_of_vehicle) {
    let category = "all";
    if (category_of_vehicle) category = category_of_vehicle;
    let url = `/api/vehicles/${category}/all/free?fun=get_number`;
    if (start_date && end_date) url += `&start_date=${Date.parse(start_date)}&end_date=${Date.parse(end_date)}`;
    const response = await fetch(url);
    const num_json = await response.json();
    if (!response.ok) throw num_json;
    else return num_json;
}

async function getNumberOfRentals(user) {
    const response = await fetch(`/api/rentals/${user.userID}?fun=get_number`);
    const num_json = await response.json();
    if (!response.ok) throw num_json;
    else return num_json;
}

async function stub(card, csrfToken) {
    return new Promise((resolve, reject) => {
        fetch("/api/stub", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify({ name: card.name, cc_number: card.cc_number, cvv: card.cvv }),
        }).then((response) => {
            if (response.ok) {
                response.json()
                    .then((obj) => { resolve(obj) })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) })
            } else {
                response.json()
                    .then((obj) => { reject(obj) })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) })
            }
        })
    })
}

async function addRental(rental, csrfToken) {
    return new Promise((resolve, reject) => {
        fetch("/api/rentals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify(rental),
        }).then((response) => {
            if (response.ok) {
                response.json()
                    .then((bool) => { resolve(bool) })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) })
            } else {
                response.json()
                    .then((obj) => { reject(obj) })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) })
            }
        })
    })
}

async function getRentals(userID) {
    const response = await fetch(`/api/rentals/${userID}`);
    const rentals_json = await response.json();
    if (!response.ok) throw rentals_json;
    else return rentals_json;
}

async function deleteRental(id, csrfToken) {
    return new Promise((resolve, reject) => {
        fetch("/api/rentals/" + id, {
            method: "DELETE",
            headers: { 'X-CSRF-Token': csrfToken }
        }).then((response) => {
            if (response.ok) resolve(null);
        })
    })
}

async function getCSRFToken() {
    return new Promise((resolve, reject) => {
        fetch("/csrf-token").then((response) => {
            if (response.ok) {
                response.json()
                    .then((obj) => { resolve(obj); })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) });
            } else {
                response.json()
                    .then((obj) => { reject(obj); })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) });
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

export {
    getBrands, getVehicles, userLogin,
    userLogout, getNumberOfFreeVechicles,
    getNumberOfRentals, stub, addRental,
    getRentals, deleteRental, getCSRFToken
}