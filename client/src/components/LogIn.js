import React, { Component } from 'react';
import axios from 'axios';
import validator from 'validator';

import Errors from './Errors';

class LogIn extends Component{
	constructor(props) {
		super(props);

		this.state = {
			errors : []
		}
		this.onSubmitHandler = this.onSubmitHandler.bind(this);
	}

	onSubmitHandler(e) {
		e.preventDefault();

		let { email, password } = this.refs;

		email = email.value;
		password = password.value;

		let errors = [];

		if(validator.isEmpty(email)) errors.push('Please provide an email.');
		else if(!validator.isEmail(email)) errors.push('The email you have entered, is not a valid email.');
		if(validator.isEmpty(password)) errors.push('Please provide a password.');

		if(errors.length === 0){
			axios.post('./api/auth', { email, password })
				.then(res => {
					if(res.data.success){
						const { user_id, max_calories_allowed, user_role, token } = res.data;

						this.props.authHandler(user_id, max_calories_allowed, user_role, token);
					} else {
						const error = res.data.message;

						errors.push(error);

						this.setState({ errors });
					}
				});
		}

		this.setState({ errors });
	}

	render() {
		const { errors } = this.state;

		return (
			<div className="row">
				<Errors errors={errors} />

				<div className="col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
					<h3 className="text-center">Log In</h3>
					<form onSubmit={this.onSubmitHandler}>
						<div className="form-group">
							<label>Email:</label>
							<input ref="email" type="text" className="form-control"/>
						</div>
						<div className="form-group">
							<label>Password:</label>
							<input ref="password" type="password" className="form-control"/>
						</div>
						<button className="btn btn-primary btn-block">Log in</button>
					</form>
				</div>
			</div>
		);
	}
}

export default LogIn;
