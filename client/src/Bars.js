import React from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import logo from "./images/logo.png";
import * as API from "./API.js"

/* MyNavbar */
function MyNavbar(props) {
    return <nav className="navbar navbar-dark navbar-expand-sm bg-dark fixed-top">
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#left-sidebar" aria-controls="left-sidebar" aria-expanded="false" aria-label="Toggle sidebar">
            <span className="navbar-toggler-icon"></span>
        </button>
        <Logo />
        <Profile logged={props.logged} userLogout={props.userLogout} />
    </nav>
}


function Logo() {
    return <Link to="filter=All" className="navbar-brand">
        <img className="mr-1" src={logo} alt="trash" height="19" width="19" />
      Rental Manager
    </Link>
}

function Profile(props) {
    return <div className="navbar-nav ml-md-auto">
        <Dropdown>
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
                <svg className="bi bi-people-circle" width="30" height="30" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 008 15a6.987 6.987 0 005.468-2.63z" />
                    <path fillRule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8z" clipRule="evenodd" />
                </svg>
            </Dropdown.Toggle>

            <Dropdown.Menu >
                <div className="row ml-3"><Link to={props.logged ? "/" : "login"} onClick={props.logged ? props.userLogout : null}>{props.logged ? "Logout" : "Login"}</Link></div>
                <div className="row ml-3"><Link to={"home"}>All vehicles</Link></div>
                <div className={props.logged ? "row ml-3" : "d-none"}><Link to="configurator">Request a Rental</Link></div>
                <div className={props.logged ? "row ml-3" : "d-none"}><Link to="reservations">Reservations</Link></div>
            </Dropdown.Menu>
        </Dropdown>
    </div>
}

/** MyAsideBar */
class MyAsideBar extends React.Component {
    render() {
        return <aside className="collapse d-sm-block col-sm-4 col-12 bg-light below-nav" id="left-sidebar">
            <h4 className="ml-4">Categories:</h4>
            <Categories changeCategories={this.props.changeCategories} selectedCategories={this.props.selectedCategories} />
            <hr />
            <h4 className="mt-4 ml-4">Brands:</h4>
            <Brands changeBrands={this.props.changeBrands} selectedBrands={this.props.selectedBrands} />
        </aside>
    }
}

class Categories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: ['A', 'B', 'C', 'D', 'E'],
        }
    }

    render() {
        return <div className="list-group list-group-flush">{
            this.state.categories.map((c) => {
                return <RowCategories key={c} category={c} changeCategories={this.props.changeCategories} selectedCategories={this.props.selectedCategories} />
            })
        }</div>
    }
}

function RowCategories(props) {
    return <div className={props.selectedCategories.indexOf(props.category) !== -1 ? "list-group-item list-group-item-action bg-dark text-white" : "list-group-item list-group-item-action"}
        onClick={() => props.changeCategories(props.category)}
    >{props.category}
    </div>
}

class Brands extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            brands: [],
        }
    }

    componentDidMount() {
        API.getBrands()
            .then((b) => {
                const sb = [];
                this.setState({ brands: b })
                for (let brand of this.state.brands) sb[brand.id] = false;
                this.setState({ selectedBrands: sb, loading: false });
            })
    }

    render() {
        if (this.state.loading === true) return null;
        else return <div className="list-group list-group-flush">{
            this.state.brands.map((b) => {
                return <RowBrands key={b.id} brand={b} changeBrands={this.props.changeBrands} selectedBrands={this.props.selectedBrands} />
            })
        }</div>
    }
}

function RowBrands(props) {
    return <div
        className={props.selectedBrands.indexOf(props.brand.name_brand.brand) !== -1 ? "list-group-item list-group-item-action bg-dark text-white" : "list-group-item list-group-item-action"}
        onClick={() => props.changeBrands(props.brand.name_brand.brand)}
    >{props.brand.name_brand.brand}</div>
}

export { MyNavbar, MyAsideBar };