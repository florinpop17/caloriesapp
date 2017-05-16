import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import validator from 'validator';
import passValidator from 'password-validator';

import Errors from './Errors';

class User extends Component {
	constructor(props) {
		super(props);

		this.state = {
			meals: [],
			errors : [],
			success : undefined
		}

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleEdit = this.handleEdit.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.getMeals = this.getMeals.bind(this);
	}

	componentWillMount() {
		const { user_to_edit_id } = this.props;

		axios.get(`./api/users/${user_to_edit_id}`)
			.then(res => {
				if(res.data.success){
					this.refs.email.value = res.data.user.email;
					this.refs.user_role.value = res.data.user.user_role;
					this.refs.max_calories_allowed.value = res.data.user.max_calories_allowed;
				}
			})

		this.getMeals();
	}

	getMeals() {
		const { user_to_edit_id } = this.props;

		axios.get(`./api/meals/by_user/${user_to_edit_id}`)
			.then(res => {

				if(res.data.success) {
					this.setState({
						meals: res.data.meals
					});
				}
			});
	}

	handleEdit(meal_id){
		this.props.handleMealEdit(meal_id);
		this.props.history.push('/meal');
	}

	handleDelete(meal_id) {
		axios.delete(`./api/meals/${meal_id}`)
		.then(res => {

			if(res.data.success){
				// re-rendering the meals
				this.getMeals();
			}
		})
	}

	handleSubmit(e) {
		e.preventDefault();

		let { email, user_role, max_calories_allowed, password } = this.refs;
		const { user_to_edit_id } = this.props;

		email = email.value;
		user_role = user_role.value;

		max_calories_allowed = max_calories_allowed.value;
		password = password.value;

		let errors = [];

		if(validator.isEmpty(email)) errors.push('Please provide an email.');
		else if(!validator.isEmail(email)) errors.push('The email you have entered, is not a valid email.');
		if(!validator.isEmpty(password)) {
			let passSchema = new passValidator();

			passSchema
				.is().min(8)
				.has().uppercase()
				.has().lowercase()
				.has().digits()
				.has().not().spaces();

			if(!passSchema.validate(password)) {
				errors.push('Password must contain: 1 uppercase letter, 1 lowercase letter, 1 digit and it should be at least 8 characters long.');
			}
		}

		if(parseInt(this.props.user_role, 10) < parseInt(user_role, 10)) errors.push('You can\'t increase your role.');
		if(validator.isEmpty(user_role)) errors.push('Please provide the user role.');
		if(validator.isEmpty(max_calories_allowed)) errors.push('Please insert the max number of calories allowed.');

		if(errors.length === 0) {
			let updatedUser = { email, user_role, max_calories_allowed };

			if(password) updatedUser.password = password;

			axios.patch(`./api/users/${user_to_edit_id}`, updatedUser)
				.then(res => {
					if(res.data.success){
						if(this.props.user_id === user_to_edit_id){
							this.props.resetUser(user_to_edit_id);
						}
						this.setState({ success: 'User was edited successfully.' });
						setTimeout(() => {this.setState({ success: undefined })}, 2000);
					} else {
						errors.push(res.data.message);
					}
				});
		}

		this.setState({ errors });
	}

	render() {

		const { errors, success, meals } = this.state;

		return (
			<div className="row">
				{ errors.length > 0 ? <Errors errors={errors} /> : '' }
				{ success ? <div className="alert alert-success">{ success }</div> : '' }
				<div className="col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
					<h1>User</h1>
					<form onSubmit={this.handleSubmit}>
						<div className="form-group">
							<label>Email:</label>
							<input ref="email" type="text" className="form-control"/>
						</div>
						<div className="form-group">
							<label>User role:</label>
							<input ref="user_role" type="number" min="1" max="3" step="1" className="form-control"/>
						</div>
						<div className="form-group">
							<label>Max calories allowed:</label>
							<input ref="max_calories_allowed" type="number" min="1" className="form-control"/>
						</div>
						<div className="form-group">
							<label>Password:</label>
							<input ref="password" type="password" className="form-control"/>
						</div>
						<button className="btn btn-primary btn-block">Edit user</button>
					</form>
				</div>
				<div className="col-md-12">
					<h3>User meals:</h3>
					{ meals.length > 0 ? (
						<table className="table table-striped">
							<thead>
								<tr>
									<th>Meal text</th>
									<th>Calories</th>
									<th>Date</th>
									<th>Edit</th>
									<th>Delete</th>
								</tr>
							</thead>
							<tbody>
								{ meals.sort((a, b) => {
									const aDate = new Date(a.date).getTime();
									const bDate = new Date(b.date).getTime();
									return aDate - bDate;
								}).map(meal => (
									<tr key={meal._id}>
										<td>{meal.text}</td>
										<td>{meal.calories}</td>
										<td>{new Date(meal.date).toString()}</td>
										<td><button onClick={() => this.handleEdit(meal._id)} className="btn btn-warning btn-sm"><i className="fa fa-edit"></i></button></td>
										<td><button onClick={() => this.handleDelete(meal._id)} className="btn btn-danger btn-sm"><i className="fa fa-trash-o"></i></button></td>
									</tr>
								))}
							</tbody>
						</table>
				) : 'This user has no meals.'}
				</div>
			</div>
		);
	}
}


User.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

export default withRouter(User);
