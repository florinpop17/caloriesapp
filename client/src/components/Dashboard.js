import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        }

		this.handleEdit = this.handleEdit.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.getUsers = this.getUsers.bind(this);
    }

	componentWillMount() {
		this.getUsers();
	}

	getUsers() {
		const { user_role, user_id } = this.props;

        if(parseInt(user_role, 10) < 3)
            axios.get(`http://localhost:3000/api/users/${user_id}`)
                .then(res => {
                    if(res.data.success){
                        this.setState({
                            users: [...this.state.users, res.data.user]
                        })
                    }
                })

		axios.get(`http://localhost:3000/api/users/role/${user_role}`)
			.then(res => {
				if(res.data.success){

					this.setState({
						users: [...this.state.users, ...res.data.users]
					})
				}
			})
	}

	handleEdit(user_id){
		this.props.userEdit(user_id);
		this.props.history.push('/user');
	}

	handleDelete(user_id){
		axios.delete(`http://localhost:3000/api/users/${user_id}`)
			.then(res => {
				this.getUsers();
			});
	}

    render() {
        const { users } = this.state;
        const { user_role } = this.props;

        const roles = ['user', 'moderator', 'admin'];

        return (
            <div className="row">
                <h1>Dashboard { roles[user_role-1] }</h1>
				{
					users ? (
					<div className="col-sm-12">
						{ users.map(user => (
							<div className="panel panel-primary" key={user._id}>
								<div className="panel-heading">
									{user.email}
								</div>
								<div className="panel-body">
									<div className="pull-left">
										<p>User role: {user.user_role}</p>
										<p>Max calories allowed: {user.max_calories_allowed}</p>
									</div>

									<div className="buttons pull-right">
										<button onClick={() => this.handleEdit(user._id)} className="btn btn-sm btn-warning"><i className="fa fa-edit"></i></button>
										{ user._id !== this.props.user_id ? (<button onClick={() => this.handleDelete(user._id)} className="btn btn-sm btn-danger"><i className="fa fa-trash"></i></button>) : '' }
									</div>
								</div>
							</div>
						)
						)}
					</div>
					)
					: ''
				}
            </div>
        )
    }
}



Dashboard.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

export default withRouter(Dashboard);
