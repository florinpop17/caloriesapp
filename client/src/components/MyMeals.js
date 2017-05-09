import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

import Datetime from 'react-datetime';

class Register extends Component{
	constructor(props) {
		super(props);

		this.state = {
			meals: {},
			date_from: undefined,
			date_to: undefined,
			time_from: undefined,
			time_to: undefined

		}

		this.getMeals = this.getMeals.bind(this);
		this.handleEdit = this.handleEdit.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleDateFilter = this.handleDateFilter.bind(this);
	}

	componentDidMount() {
		this.getMeals();
	}

	getMeals() {
		const { user_id } = this.props;

		if(user_id) {
			axios.get(`http://localhost:3000/api/meals/by_user/${user_id}`)
			.then(res => {

				if(res.data.success) {
					this.setState({
						meals: this.groupMealsByDay(res.data.meals)
					});
				}
			});
		}
	}

	handleEdit(meal_id) {
		this.props.handleMealEdit(meal_id);
		this.props.history.push('/meal');
	}

	handleDelete(meal_id) {
		axios.delete(`http://localhost:3000/api/meals/${meal_id}`)
		.then(res => {

			if(res.data.success){
				// re-rendering the meals
				this.getMeals();
			}
		})
	}

	handleDateFilter(e) {
		let date_from = this.refs.date_from.state.inputValue;
		let date_to = this.refs.date_to.state.inputValue;
		let time_from = this.refs.time_from.state.inputValue;
		let time_to = this.refs.time_to.state.inputValue;

		if(date_from && date_to){
			date_from = this.convertDateToNumber(date_from);
			date_to = this.convertDateToNumber(date_to);

			if(date_from > date_to) {
				date_from = undefined;
				date_to = undefined;
			}

			this.setState({ date_from, date_to });
		}

		if(time_from && time_to){
			time_from = this.convertTimeToNumber(time_from);
			time_to = this.convertTimeToNumber(time_to);

			if(time_from > time_to) {
				time_from = undefined;
				time_to = undefined;
			}

			this.setState({ time_from, time_to });
		}
	}

	convertTimeToNumber(time){
		time = time.split(' ');
		let hour = parseInt(time[0].split(':')[0], 10);
		let minute = parseInt(time[0].split(':')[1], 10);
		let apm = time[1];

		if(apm === 'PM') hour += 12;
		if(hour === 12 || hour === 24) hour -= 12;

		return hour * 60 + minute;
	}

	convertDateToNumber(date){
		date = new Date(date);
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();

		let time = new Date(month+'/'+day+'/'+year).getTime();

		return time;
	}

	groupMealsByDay(meals) {
		let group = {};

		meals.forEach(meal => {
			let day = new Date(meal.date).getDate();
			let month = new Date(meal.date).getMonth() + 1;
			let year = new Date(meal.date).getFullYear();

			let value = month+'/'+day+'/'+year;
			if(!group[value]) group[value] = [];
			group[value].push(meal);

		});

		return group;
	}

	filterMealsByDate(meals) {
		let { date_from, date_to, time_from, time_to } = this.state;

		let filteredMeals = [].concat(meals);

		if(date_from && date_to){
			filteredMeals = filteredMeals.filter(meal => {
				let time = this.convertDateToNumber(meal.date);

				return date_from <= time && time <= date_to;
			});
		}

		if(time_from && time_to){
			filteredMeals = filteredMeals.filter(meal => {
				let date = new Date(meal.date);

				let hour = date.getHours();
				let minutes = date.getMinutes();

				let time = this.convertTimeToNumber(hour+':'+minutes+' AM');

				return time_from <= time && time <= time_to;
			});
		}

		return filteredMeals;
	}

	render() {
		let { meals } = this.state;
		let { max_calories_allowed } = this.props;
		let total_calories = 0;
		let res = [];

		for(let key in meals){
			let filteredMeals =  this.filterMealsByDate(meals[key]);

			let caloriesPerDay = filteredMeals.reduce((acc, meal) => acc += meal.calories, 0);

			total_calories += caloriesPerDay;

			let caloriesTextClass = caloriesPerDay <= max_calories_allowed ? 'bg-success' : 'bg-danger';
			let displayMeals = filteredMeals.map((meal, idx) => {

				return (
					<div key={meal._id} className="panel panel-info">
						<div className="panel-heading">
							<h4>{meal.text}</h4>
						</div>
						<div className="panel-body">
							<p>Calories: {meal.calories}</p>
							<small>Created on { new Date(meal.date).toString() }</small>
							<div className="buttons pull-right">
								<button onClick={() => this.handleEdit(meal._id)} className="btn btn-sm btn-warning"><i className="fa fa-edit"></i></button>
								<button onClick={() => this.handleDelete(meal._id)} className="btn btn-sm btn-danger"><i className="fa fa-trash"></i></button>
							</div>
						</div>
					</div>
				)
			});

			if(displayMeals.length > 0) {
				res.push((
					<div key={key}>
						<h3>{ key } <small> Total calories: <mark className={ caloriesTextClass }> { caloriesPerDay } / { max_calories_allowed }</mark></small></h3>
						{ displayMeals }
					</div>
				))
			}
		}


		return (
			<div className="row">
				<div className="col-md-12">
					<h4 className="text-right">Total calories: { total_calories }</h4>

					<hr />

					<h4>Filters:</h4>
					<form className="form-inline">
						<div className="form-group">
							<label>Date from:</label>
							<Datetime timeFormat={false} ref="date_from" onBlur={this.handleDateFilter}/>
						</div>
						<div className="form-group">
							<label>Date to:</label>
							<Datetime timeFormat={false} ref="date_to" onBlur={this.handleDateFilter}/>
						</div>

						<hr />

						<div className="form-group">
							<label>Time from:</label>
							<Datetime dateFormat={false} ref="time_from" onBlur={this.handleDateFilter}/>
						</div>
						<div className="form-group">
							<label>Time to:</label>
							<Datetime dateFormat={false} ref="time_to" onBlur={this.handleDateFilter}/>
						</div>

					</form>

					<hr />

					{ res.length > 0 ? res : 'No meals to show.' }
				</div>

			</div>
		);
	}
}

Register.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

export default withRouter(Register);
