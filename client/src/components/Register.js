import React, { Component } from 'react';
import axios from 'axios';
import validator from 'validator';
import passValidator from 'password-validator';

import Errors from './Errors';

class Register extends Component{
	constructor(props) {
		super(props);

		this.state = {
			errors: []
		}

		this.onSubmitHandler = this.onSubmitHandler.bind(this);
	}

	onSubmitHandler(e) {
		e.preventDefault();

		let { email, password, passwordTwo } = this.refs;

		email = email.value;
		password = password.value;
		passwordTwo = passwordTwo.value;

		let errors = [];

		if(validator.isEmpty(email)) errors.push('Please provide an email.');
		else if(!validator.isEmail(email)) errors.push('The email you have entered, is not a valid email.');
		if(validator.isEmpty(password)) errors.push('Please provide a password.');
		else {
			let passSchema = new passValidator();

			passSchema
				.is().min(8)
				.has().uppercase()
				.has().lowercase()
				.has().digits()
				.has().not().spaces();

			if(!passSchema.validate(password)) {
				errors.push('Password must contain: 1 uppercase letter, 1 lowercase letter, 1 digit and it should be at least 8 characters long.')
			}
		}
		if(validator.isEmpty(passwordTwo)) errors.push('Please confim your password.');
		if(!validator.equals(password, passwordTwo)) errors.push('The confirmation password does not match.')

		if(errors.length === 0){
			axios.post('http://localhost:3000/api/users', { email, password })
			.then(res => {
				if(res.data.success){
					axios.post('http://localhost:3000/api/auth', { email, password })
					.then(res => {
						if(res.data.success){
							const { user_id, max_calories_allowed, user_role, token } = res.data;

							this.props.authHandler(user_id, max_calories_allowed, user_role, token);
						} else {
							const error = res.data.message;

							errors.push(error);

							this.setState({ errors });
						}
					})
				} else {
					const error = res.data.message;

					errors.push(error);

					this.setState({ errors });
				}
			})
		}

		this.setState({ errors });
	}

	render() {
		const { errors } = this.state;

		return (
			<div className="row">
				<Errors errors={errors} />

				<div className="col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
					<h3 className="text-center">Register</h3>
					<form onSubmit={this.onSubmitHandler}>
						<div className="form-group">
							<label>Email:</label>
							<input ref="email" type="text" className="form-control"/>
						</div>
						<div className="form-group">
							<label>Password:</label>
							<input ref="password" type="password" className="form-control"/>
						</div>
						<div className="form-group">
							<label>Confirm Password:</label>
							<input ref="passwordTwo" type="password" className="form-control"/>
						</div>
						<button className="btn btn-primary btn-block">Register</button>
					</form>
				</div>
			</div>
		);
	}
}

export default Register;
