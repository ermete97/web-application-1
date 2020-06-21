import React from "react"
import load from "./images/loading.gif";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
        };
    }

    render() {
        if (this.props.loading) return <div className="container">
            <div className="d-flex align-items-center justify-content-center below-nav">
                <img src={load} alt="load" height="50" width="50" className={this.props.loading ? "m-3" : "m-3 d-none"} />
            </div>
        </div>
        else return <div className="container jumbotron mt-5 pt-5 below-nav">
            <h1>Insert your email and your password to enter</h1>
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <h3>Email</h3>
                    <input name="email" type="email" className="form-control" value={this.state.email} required onChange={this.updateField} />
                    <small className="form-text text-muted">Please insert your email</small>
                </div>

                <div className="form-group">
                    <h3>Password</h3>
                    <input name="password" value={this.state.password} type="password" className="form-control" required onChange={this.updateField} />
                    <small className="form-text text-muted">Insert your password</small>
                </div>

                <button type="submit" className="btn btn-dark">Login</button>
            </form>
            <div className={this.props.loginError ? "alert alert-danger mt-5" : "alert alert-danger mt-5 d-none"} role="alert" >
                Wrong username and/or password
            </div>
        </div>
    }

    updateField = (ev) => {
        this.setState({ [ev.target.name]: ev.target.value });
    }

    userLogin = async (email, password) => this.props.userLogin(email, password);

    handleSubmit = (ev) => {
        ev.preventDefault();
        this.userLogin(this.state.email, this.state.password);
    }


}

export { Login };