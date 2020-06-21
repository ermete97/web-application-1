import React from "react";
import { Table } from "react-bootstrap"
import * as API from "./API.js"
import { Redirect, Link } from "react-router-dom";
import moment from "moment"
import load from "./images/loading.gif";
import trash from "./images/trash.png";

/* TableOfVehicles */
class TableOfVehicles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            listOfVehicles: [],
        }
    }

    componentDidMount() {
        API.getVehicles(this.props.selectedCategories, this.props.selectedBrands)
            .then((v) => this.setState({ listOfVehicles: v, loading: false }));
    }

    componentDidUpdate(old) {
        if (this.props.selectedCategories !== old.selectedCategories || this.props.selectedBrands !== old.selectedBrands) {
            this.setState({ loading: true });
            API.getVehicles(this.props.selectedCategories, this.props.selectedBrands)
                .then((v) => this.setState({ listOfVehicles: v, loading: false }));
        }
    }

    render() {
        return <div className="col-sm-8 below-nav">
            <h2>List of all vehicles</h2>
            <Table bordered hover variant="light" >
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Model</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.listOfVehicles.map((v) => {
                        if (!this.state.loading) return <RowVehicle key={v.id} vehicle={v} />
                        else return null;
                    })}
                </tbody>
            </Table>
        </div>
    }
}

function RowVehicle(props) {
    return <tr>
        <td>{props.vehicle.category}</td>
        <td>{props.vehicle.brand}</td>
        <td>{props.vehicle.model}</td>
    </tr>
}

/* Configurator */
class Configurator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            start_date: "",
            end_date: "",
            price: false,
            category_of_vehicle: "",
            age_of_driver: "",
            additional_drivers: "",
            avg_kmperday: "",
            extra_insurance: "",
            free_for_category: "",
            n_free: false,
            n_of_rentals: 0,
            date_error: false,
            submitted: false,
            firstId: -1,
        }
    }

    componentDidMount() {
        API.getNumberOfRentals(this.props.user)
            .then((n) => this.setState({ n_of_rentals: n }));
    }

    render() {
        if (this.state.submitted) return <Redirect to="payment" />
        return <div className="container below-nav bg-light vheight-100">
            <form className="ml-5" onSubmit={(event) => this.handleSubmit(event)}>
                <h2>{`Welcome, ${this.props.user.name}!`}</h2>
                <p>Fill out the form if you want to request a rental</p>
                <h5 className={this.state.n_free !== false ? "visible" : "d-none"}><span className="badge badge-secondary">{`${this.state.n_free} vehicles are avaiable with this configuration`}</span></h5>
                <h5 className={this.state.price !== false ? "visible" : "d-none"}><span className="badge badge-secondary">{this.state.start_date && this.state.end_date ? `Price: ${this.state.price} €` : `Price: ${this.state.price} € per day`}</span></h5>
                <hr />
                <div className="row">
                    <div className="form-group ml-3">
                        <h5>Start Date</h5>
                        <input required className="form-text text-muted" name="start_date" value={this.state.start_date} type="date" onChange={this.updateField} />
                    </div>

                    <div className="form-group ml-5">
                        <h5>End Date</h5>
                        <input required className="form-text text-muted" name="end_date" value={this.state.end_date} type="date" onChange={this.updateField} />
                    </div>
                </div>

                <div className="form-group">
                    <h5>Category of Vehicle</h5>
                    <div className="row">
                        <div className="form-check ml-3">
                            <input required className="form-check-input" type="radio" name="category_of_vehicle" id="A" value="A" checked={(this.state.category_of_vehicle === "A") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="A">
                                A
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" name="category_of_vehicle" id="B" value="B" checked={(this.state.category_of_vehicle === "B") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="B">
                                B
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" name="category_of_vehicle" id="C" value="C" checked={(this.state.category_of_vehicle === "C") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="C">
                                C
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" name="category_of_vehicle" id="D" value="D" checked={(this.state.category_of_vehicle === "D") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="D">
                                D
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" name="category_of_vehicle" id="E" value="E" checked={(this.state.category_of_vehicle === "E") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="E">
                                E
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <h5>Age of Driver</h5>
                    <div className="row">
                        <div className="form-check ml-3">
                            <input required className="form-check-input" type="radio" id="25" name="age_of_driver" value="<25" checked={(this.state.age_of_driver === "<25") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="25">
                                Less than 25 years old
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" id="65" name="age_of_driver" value="<65" checked={(this.state.age_of_driver === "<65") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="65">
                                Less than 65 years old
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" id="+65" name="age_of_driver" value=">65" checked={(this.state.age_of_driver === ">65") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="+65">
                                More than 65 years old
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <h5>Additional Drivers</h5>
                    <div className="row">
                        <div className="form-check ml-3">
                            <input required className="form-check-input" type="radio" id="si" name="additional_drivers" value="yes" checked={(this.state.additional_drivers === "yes") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="si">
                                Yes
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" id="no" name="additional_drivers" value="no" checked={(this.state.additional_drivers === "no") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="no">
                                No
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <h5>Maximum of Km per day</h5>
                    <div className="row">
                        <div className="form-check ml-3">
                            <input required className="form-check-input" type="radio" id="50" name="avg_kmperday" value="<50" checked={(this.state.avg_kmperday === "<50") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="50">
                                Less than 50 Km per day
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" id="150" name="avg_kmperday" value="<150" checked={(this.state.avg_kmperday === "<150") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="150">
                                Less than 150 Km per day
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" type="radio" id="inf" name="avg_kmperday" value=">150" checked={(this.state.avg_kmperday === ">150") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="inf">
                                More than 150 Km per day
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <h5>Extra Insurance</h5>
                    <div className="row">
                        <div className="form-check ml-3">
                            <input required className="form-check-input" id="yes" type="radio" name="extra_insurance" value="yes" checked={(this.state.extra_insurance === "yes") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="yes">
                                Yes
                            </label>
                        </div>
                        <div className="form-check ml-5">
                            <input className="form-check-input" id="none" type="radio" name="extra_insurance" value="no" checked={(this.state.extra_insurance === "no") ? true : false} onChange={this.updateField} />
                            <label className="form-check-label" for="none">
                                No
                            </label>
                        </div>
                    </div>
                </div>
                <div className={this.state.date_error ? "alert alert-danger mt-5" : "alert alert-danger mt-5 d-none"} role="alert" >
                    Wrong dates
                </div>
                <button type="submit" className="btn btn-dark" disabled={this.state.n_free === 0}>Submit</button>
            </form>

        </div>;
    }

    handleSubmit = (event) => {
        this.setState({ date_error: false });
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) {
            form.reportValidity();
        } else if (Date.parse(this.state.start_date) < Date.parse(Date()) || Date.parse(this.state.start_date) > Date.parse(this.state.end_date)) {
            this.setState({ date_error: true });
        } else {
            let age_of_driver, avg_kmperday;

            const additional_drivers = this.state.additional_drivers === "yes" ? 1 : 0;
            const extra_insurance = this.state.extra_insurance === "yes" ? 1 : 0;

            if (this.state.age_of_driver === "<25") age_of_driver = 0;
            else if (this.state.age_of_driver === "<65") age_of_driver = 1;
            else if (this.state.age_of_driver === ">65") age_of_driver = 2;

            if (this.state.avg_kmperday === "<50") avg_kmperday = 0;
            else if (this.state.avg_kmperday === "<150") avg_kmperday = 1;
            else if (this.state.avg_kmperday === ">150") avg_kmperday = 2;

            this.props.setRental({
                id_vehicle: this.state.firstId,
                user: this.props.user,
                start_date: Date.parse(this.state.start_date),
                end_date: Date.parse(this.state.end_date),
                price: this.state.price,
                category_of_vehicle: this.state.category_of_vehicle,
                age_of_driver: age_of_driver,
                additional_drivers: additional_drivers,
                avg_kmperday: avg_kmperday,
                extra_insurance: extra_insurance,
            });
            this.setState({ submitted: true });
        }
    }

    getPrice = (rental, newName, newValue) => {
        let price = 0;
        Object.assign(rental, { [newName]: newValue });
        if (rental.category_of_vehicle) {
            if (rental.category_of_vehicle === "A") price = 80;
            else if (rental.category_of_vehicle === "B") price = 70;
            else if (rental.category_of_vehicle === "C") price = 60;
            else if (rental.category_of_vehicle === "D") price = 50;
            else if (rental.category_of_vehicle === "E") price = 40;

            if (rental.avg_kmperday === "<50") price = price * 0.95;
            else if (rental.avg_kmperday === ">150") price = price * 1.05;

            if (rental.age_of_driver === "<25") price = price * 1.05;
            else if (rental.age_of_driver === ">65") price = price * 1.1;

            if (rental.additional_drivers === "yes") price = price * 1.15;

            if (rental.extra_insurance === "yes") price = price * 1.20;

            if (rental.n_free / rental.free_for_category < 0.1) price = price * 1.1;

            if (rental.n_of_rentals >= 3) price = price * 0.9;

            if (rental.start_date && rental.end_date) {
                if (rental.start_date <= rental.end_date) {
                    let days = Date.parse(rental.end_date) - Date.parse(rental.start_date);
                    days = days / 86400000;
                    days++;
                    price = price * days;
                } else price = false;
            }
            if (price) price = price.toFixed(2);
            this.setState({ price: price });
        }
    }

    updateField = (ev) => {
        if (ev.target.name === "start_date") {
            this.setState({ [ev.target.name]: ev.target.value })
            API.getNumberOfFreeVechicles(ev.target.value, this.state.end_date, this.state.category_of_vehicle)
                .then((n) => { this.setState({ n_free: n.number, firstId: n.firstId }) })
        } else if (ev.target.name === "end_date") {
            this.setState({ [ev.target.name]: ev.target.value })
            API.getNumberOfFreeVechicles(this.state.start_date, ev.target.value, this.state.category_of_vehicle)
                .then((n) => { this.setState({ n_free: n.number, firstId: n.firstId }) })
        } else if (ev.target.name === "category_of_vehicle") {
            this.setState({ [ev.target.name]: ev.target.value })
            API.getNumberOfFreeVechicles(this.state.start_date, this.state.end_date, ev.target.value)
                .then((n) => { this.setState({ n_free: n.number, firstId: n.firstId }) })
        } else this.setState({ [ev.target.name]: ev.target.value })
        this.getPrice(this.state, ev.target.name, ev.target.value);
    }

}

/* PaymentPage */
class PaymentPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            cc_number: "",
            cvv: "",
            error: false,
            loading: false,
            submitted: false,
        }
    }

    render() {
        if (this.state.loading) return <div className="container">
            <div className="d-flex align-items-center justify-content-center below-nav">
                <img src={load} alt="load" height="50" width="50" className={this.props.loading ? "m-3" : "m-3 d-none"} />
            </div>
        </div>

        if (this.state.submitted === true) return <div className="container jumbotron mt-5 pt-5 below-nav">
            <h1>Payment Completed, your rental has been registred! :)</h1>
            <Link to="home" className="btn btn-dark">Go to the list of vehicles</Link>
        </div>

        if (this.state.submitted === "error") return <div className="container jumbotron mt-5 pt-5 below-nav">
            <h1>Oops, something went wrong :(</h1>
            <Link to="configurator" className="btn btn-dark">Try again</Link>
        </div>

        return <div className="container jumbotron mt-5 pt-5 below-nav">
            <h1>{`Price: ${this.props.rental.price} €`}</h1>
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <h3>Name and Surname</h3>
                    <input name="name" type="text" className="form-control" value={this.state.name} required onChange={this.updateField} />
                    <small className="form-text text-muted">Please insert your name and your surname</small>
                </div>

                <div className="form-group">
                    <h3>Number of Credit Card</h3>
                    <input name="cc_number" value={this.state.cc_number} type="text" className="form-control" required onChange={this.updateField} />
                    <small className="form-text text-muted">Insert the number of your credit card</small>
                </div>

                <div className="form-group">
                    <h3>CVV</h3>
                    <input name="cvv" value={this.state.cvv} type="text" className="form-control" required onChange={this.updateField} />
                    <small className="form-text text-muted">Insert the CVV number</small>
                </div>
                <div className={this.state.error ? "alert alert-danger mt-5" : "alert alert-danger mt-5 d-none"} role="alert" >
                    Error!
                </div>
                <button type="submit" className="btn btn-dark">Pay</button>
            </form>
        </div>
    }

    updateField = (ev) => {
        let regex;
        if (ev.target.name === "name") {
            regex = /^([a-zA-Z '])+$/;
            if (regex.test(ev.target.value)) this.setState({ [ev.target.name]: ev.target.value });
        } else if (ev.target.name === "cc_number") {
            regex = /^([0-9'])+$/;
            if (ev.target.value.length < 17 && regex.test(ev.target.value)) this.setState({ [ev.target.name]: ev.target.value });
        } else if (ev.target.name === "cvv") {
            if (ev.target.value.length < 4) this.setState({ [ev.target.name]: ev.target.value });
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({ error: false });
        const form = event.currentTarget;
        if (!form.checkValidity()) {
            form.reportValidity();
        } else if (this.state.cc_number.length !== 16 || this.state.cvv.length !== 3) {
            this.setState({ error: true });
        } else {
            this.setState({ loading: true })
            API.stub({
                name: this.state.name,
                cc_number: this.state.cc_number,
                cvv: this.state.cvv,
            }, this.props.csrf).then((bool) => {
                if (bool) {
                    API.addRental(this.props.rental, this.props.csrf)
                        .then((bool) => {
                            if (bool) {
                                this.setState({ loading: false, submitted: true })
                                this.props.setRental(null);
                            } else this.setState({ loading: false, submitted: "error" })
                        })
                }
                else this.setState({ loading: false, submitted: "error" });
            })
            this.setState({ submitted: true, loading: false });
        }
    }
}

/* Reservations */
class Reservations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reservations: [],
            vehicles: [],
            loading: true,
            future: true,
        }
    }

    componentDidMount() {
        API.getRentals(this.props.user.userID)
            .then((r) => {
                this.setState({ reservations: r })
                API.getVehicles([], [])
                    .then((v) => this.setState({ vehicles: v, loading: false }));
            });
    }

    render() {
        return <div className="container below-nav vheight-100">
            <div className="row">
                <button type="button" className="btn btn-dark col-6" disabled={this.state.future} onClick={() => this.setState({ future: true })}>Future Rentals</button>
                <button type="button" className="btn btn-dark col-6" disabled={!this.state.future} onClick={() => this.setState({ future: false })}> Old Rentals</button>
            </div>
            <h3 className="mt-5">{this.state.future ? "Future Rentals" : "Old Rentals"}</h3>
            <Table bordered hover variant="light" >
                <thead>
                    <tr>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Vehicle</th>
                        <th>Category</th>
                        <th>Age of driver</th>
                        <th>Additional Drivers</th>
                        <th>Km per Day</th>
                        <th>Extra Insurance</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.reservations.map((r) => {
                        if (!this.state.loading) {
                            if ((this.state.future && r.start_date > Date.parse(Date())) || (!this.state.future && r.start_date < Date.parse(Date())))
                                return <RowRentals key={r.id} rental={r} vehicle={this.state.vehicles.filter((v) => v.id === r.id_vehicle)} deleteRental={this.deleteRental} />
                            else return null
                        }
                        else return null;
                    })}
                </tbody>
            </Table>
        </div>
    }

    deleteRental = async (rental) => {
        this.setState({ loading: true });
        await API.deleteRental(rental.id, this.props.csrf);
        let rentals = await API.getRentals(this.props.user.userID);
        this.setState({ reservations: rentals, loading: false, });
    }
}

function RowRentals(props) {
    let age_of_driver, avg_kmperday;
    const additional_drivers = props.rental.additional_drivers === 0 ? "No" : "Yes";
    const extra_insurance = props.rental.extra_insurance === 0 ? "No" : "Yes";

    if (props.rental.age_of_driver === 0) age_of_driver = "< 25";
    else if (props.rental.age_of_driver === 1) age_of_driver = "< 65";
    else if (props.rental.age_of_driver === 2) age_of_driver = "> 65";

    if (props.rental.avg_kmperday === 0) avg_kmperday = "< 50";
    else if (props.rental.avg_kmperday === 1) avg_kmperday = "< 150";
    if (props.rental.avg_kmperday === 2) avg_kmperday = "> 150";

    const start_date = moment(props.rental.start_date).format("L");
    const end_date = moment(props.rental.end_date).format("L");
    return <tr>
        <td>{start_date}</td>
        <td>{end_date}</td>
        <td>{`${props.vehicle[0].brand} ${props.vehicle[0].model}`}</td>
        <td>{props.rental.category_of_vehicle}</td>
        <td>{age_of_driver}</td>
        <td>{additional_drivers}</td>
        <td>{avg_kmperday}</td>
        <td>{extra_insurance}</td>
        <td>
            <div className="d-flex justify-content-between">
                {`${props.rental.price} €`}
                <img className={props.rental.start_date > Date.parse(Date()) ? "" : "d-none"} src={trash} alt="trash" height="19" width="19" onClick={() => props.deleteRental(props.rental)} />
            </div>
        </td>
    </tr>
}


export { TableOfVehicles, Configurator, PaymentPage, Reservations };