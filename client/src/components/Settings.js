import React, { Component } from 'react';
import axios from 'axios';

class Settings extends Component {
	constructor(props){
		super(props);

		this.state = {
			successMessage: ''
		}
	}

	onSubmitHandler(e) {
		e.preventDefault();

		let { max_calories_allowed } = this.refs;
		const { user_id, setMaxCalories, max_calories } = this.props;

		if(max_calories_allowed.value && max_calories_allowed.value !== max_calories) {
			max_calories_allowed = max_calories_allowed.value;

			axios.patch(`./api/users/${user_id}`, { max_calories_allowed })
				.then(res => {
					setMaxCalories(max_calories_allowed);
					this.setState({ successMessage: 'Calories ammount changed successfully.' });
					setTimeout(() => {this.setState({ successMessage: '' })}, 2000);
				})
		}
	}

	render() {
		const { max_calories } = this.props;
		const { successMessage } = this.state;

		return (
			<div className="row">
				<div className="col-sm-12">
					<h1>Settings page.</h1>

					{ successMessage ? (<div className="alert alert-success">{ successMessage }</div>) : '' }

					<form onSubmit={this.onSubmitHandler.bind(this)}>
						<div className="form-group">
							<label>Change the calories ammount allowed per day:</label>
							<input ref="max_calories_allowed" defaultValue={max_calories} type="number" min="1" className="form-control"/>
						</div>
						<button className="btn btn-primary">Save</button>
					</form>
				</div>
			</div>
		)
	}
}

export default Settings;
