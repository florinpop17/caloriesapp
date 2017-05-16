import React, { Component } from 'react';
import axios from 'axios';
import validator from 'validator';

import Datetime  from 'react-datetime';

import Errors from './Errors';

class Meal extends Component{
	constructor(props) {
		super(props);

		this.state = {
			errors: [],
			def_date: new Date()
		}

		this.onSubmitHandler = this.onSubmitHandler.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
	}

	onSubmitHandler(e) {
		e.preventDefault();

		let { text, calories, date } = this.refs;
		let { user_id, meal_id } = this.props;

		text = text.value;
		calories = calories.value;
		date = date.state.inputValue;

		let errors = [];

		if(validator.isEmpty(text)) errors.push('Please enter a text for the meal.');
		if(validator.isEmpty(calories)) errors.push('Please enter the number of calories.');
		if(validator.isEmpty(date)) errors.push('Please select a valid date/time.');
		if(new Date(date).getTime() > new Date().getTime()) errors.push('You can\'t create a meal in the future! Please select another date/time.');

		if(errors.length === 0){
			if(meal_id) {
				axios.patch(`./api/meals/${meal_id}`, { text, calories, date })
					.then(res => {
						if(res.data.success){
							this.setState({ success: 'Meal was edited successfully.' });
							setTimeout(() => {this.setState({ success: '' })}, 2000);
						} else {
							const error = res.data.message;

							errors.push(error);

							this.setState({ errors });
						}
					})
			} else {
				axios.post('./api/meals', { text, calories, date, user_id })
				.then(res => {
					if(res.data.success){
						this.refs.text.value = '';
						this.refs.text.focus();
						this.refs.calories.value = 1;

						this.setState({ success: 'New meal created successfully.'})
						setTimeout(() => {this.setState({ success: '' })}, 2000);
					} else {
						const error = res.data.message;

						errors.push(error);

						this.setState({ errors });
					}
				})
			}
		}

		this.setState({ errors });
	}

	handleDateChange(e) {
		this.setState({ def_date: e._d })
	}

	componentWillMount() {
		const { meal_id } = this.props;

		if(meal_id) {
			axios.get(`./api/meals/${meal_id}`)
			.then(res => {
				if(res.data.success){
					this.refs.text.value = res.data.meal.text;
					this.refs.calories.value = res.data.meal.calories;
					this.setState({ def_date: new Date(res.data.meal.date) })
				}
			})
		}
	}

	render() {
		const { errors, success, def_date } = this.state
		const { meal_id } = this.props;

		return (
			<div className="row">
				<Errors errors={errors} />
				{ success ? <div className="alert alert-success"><p>{success}</p></div> : '' }

				<div className="col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
					<h3 className="text-center">{ meal_id ? 'Edit meal' : 'Add new meal' }</h3>
					<form onSubmit={this.onSubmitHandler}>
						<div className="form-group">
							<label>Text:</label>
							<input ref="text" type="text" className="form-control"/>
						</div>
						<div className="form-group">
							<label>Calories:</label>
							<input ref="calories" type="number" min="1" className="form-control"/>
						</div>
						<div className="form-group">
							<label>Date:</label>
							<Datetime ref="date" onChange={this.handleDateChange} value={def_date}/>
						</div>
						<button className="btn btn-primary btn-block">{ meal_id ? 'Edit' : 'Add' }</button>
					</form>
				</div>
			</div>
		);
	}
}

export default Meal;
