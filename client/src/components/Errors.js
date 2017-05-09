import React, { Component } from 'react';

class Errors extends Component{
	render() {
		let { errors } = this.props;

		if(errors) errors = errors.map((error, idx) => (<div key={idx} className="alert alert-danger"><p> {error} </p></div>))

		return (
			<div className="col-md-12">
				{ errors }
			</div>
		);
	}
}

export default Errors;
