import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from 'react-router-dom';
import axios from 'axios';

import Home from './components/Home';
import Register from './components/Register';
import LogIn from './components/LogIn';
import Dashboard from './components/Dashboard';

import MyMeals from './components/MyMeals';
import Meal from './components/Meal';
import User from './components/User';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isAuth: false,
            user_id: undefined,
            user_to_edit_id: undefined,
            max_calories_allowed: undefined,
			user_role: undefined,
            token: undefined,
            meal_id: undefined
		}

        this.authenticateUser = this.authenticateUser.bind(this);
        this.checkToken = this.checkToken.bind(this);
        this.logoutHandler = this.logoutHandler.bind(this);
        this.resetUser = this.resetUser.bind(this);
        this.onHandleMealEdit = this.onHandleMealEdit.bind(this);
        this.onHandleUserEdit = this.onHandleUserEdit.bind(this);
	}

    authenticateUser(user_id, max_calories_allowed, user_role, token) {
        this.setState({
            user_id, max_calories_allowed, user_role, token
        });

        localStorage.setItem('user_id', user_id);
        localStorage.setItem('max_calories_allowed', max_calories_allowed);
		localStorage.setItem('user_role', user_role);
        localStorage.setItem('token', token);

        this.checkToken();
    }

    checkToken() {
        const { token } = this.state;

        axios.post('./api/checkToken', { token })
            .then(res => {
                if(res.data.success){
                    this.setState({ isAuth: true });
                } else {
                    this.setState({ isAuth: false });
                }
            })
    }

    logoutHandler() {
        this.setState({
            isAuth: false,
            user_id: undefined,
            user_to_edit_id: undefined,
            max_calories_allowed: undefined,
            token: undefined,
			user_role: undefined,
            meal_id: undefined
        });

        localStorage.removeItem('user_id');
        localStorage.removeItem('max_calories_allowed');
		localStorage.removeItem('user_role');
        localStorage.removeItem('token');
    }

    resetUser(user_id) {
		axios.get(`./api/users/${user_id}`)
			.then(res => {
				if(res.data.success){
					console.log(res.data);
					let { max_calories_allowed } = res.data.user;
					let { user_role } = res.data.user;

					this.setState({ user_role, max_calories_allowed });

					localStorage.setItem('max_calories_allowed', max_calories_allowed);
					localStorage.setItem('user_role', user_role);
				}
			})
    }

    onHandleMealEdit(meal_id) {
        this.setState({ meal_id: meal_id });
    }

    onHandleUserEdit(user_id) {
        this.setState({ user_to_edit_id: user_id });
    }

    componentWillMount() {
        const token = localStorage.getItem('token');
        const max_calories_allowed = localStorage.getItem('max_calories_allowed');
        const user_id = localStorage.getItem('user_id');
		const user_role = localStorage.getItem('user_role');

        if( token && user_id ) {
            this.setState({
                isAuth: true,
                token,
                max_calories_allowed,
				user_role,
                user_id
            });
        }
    }

    render() {
        const { isAuth, user_id, max_calories_allowed, user_role, meal_id, user_to_edit_id } = this.state;

		console.log('app render ', max_calories_allowed);

        return (
            <Router>
                <div className="container-fluid">
                    <div className="row">
                        <nav className="navbar navbar-default">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#collapse" aria-expanded="false">
                                    <span className="sr-only"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                </button>
                            </div>
                            <div className="collapse navbar-collapse" id="collapse">
                                <ul className="nav navbar-nav">
                                    <li><Link to="/">Home</Link></li>
                                </ul>
                                <ul className="nav navbar-nav navbar-right">
                                    { isAuth ? '' : <li><Link to="/register">Register</Link></li> }
                                    { isAuth ? '' : <li><Link to="/login">Log In</Link></li> }
                                    { isAuth ? <li><Link to="/meals">My Meals</Link></li> : '' }
                                    { isAuth ? <li><Link to="/meal" onClick={() => {this.setState({ meal_id: undefined })}}>Add Meal</Link></li> : '' }
									{ isAuth ? <li><Link to="/dashboard">Dashboard</Link></li> : '' }
                                    { isAuth ? <li><a href="" onClick={this.logoutHandler}>Logout</a></li> : '' }
                                </ul>
                            </div>
                        </nav>

                        <div className="container">
                            <Switch>
                                <Route exact path="/" component={Home} />
                                <Route path="/register" render={() => {
                                    return isAuth ? <Redirect to="/meals" /> : <Register authHandler={this.authenticateUser} />
                                }} />
                                <Route path="/login" render={() => {
                                    return isAuth ? <Redirect to="/meals" /> : <LogIn authHandler={this.authenticateUser} />
                                }} />
                                <Route path="/meals" render={() => {
                                    return isAuth ? <MyMeals user_id={user_id} max_calories_allowed={max_calories_allowed} handleMealEdit={this.onHandleMealEdit} /> : <Redirect to="/login" />
                                }} />
                                <Route path="/meal" render={() => {
                                    return isAuth ? <Meal user_id={user_id} meal_id={meal_id}/> : <Redirect to="/login" />
                                }} />
								<Route path="/user" render={() => {
									if(isAuth && user_to_edit_id) return <User user_id={user_id} resetUser={this.resetUser} user_to_edit_id={user_to_edit_id} user_role={user_role} handleMealEdit={this.onHandleMealEdit} />
									if(isAuth) return <Redirect to="/meals" />
									return <Redirect to="/login" />
								}} />
								<Route path="/dashboard" render={() => {
									return isAuth ? <Dashboard user_id={user_id} user_role={user_role} userEdit={this.onHandleUserEdit} /> : <Redirect to="/login" />
								}} />
                                <Route render={() => (<h3 className="text-center">Page Not Found. 404</h3>)} />
                            </Switch>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

export default App;
