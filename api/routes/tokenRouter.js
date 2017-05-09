const express = require('express');
const tokenRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');

module.exports = (User, app) => {

	tokenRouter.route('/auth')
	.post((req, res) => {
		const { email, password } = req.body;

		User.findOne({ email }, (err, user) => {
			if (err) return res.json({ success: false, message: err });

			if (!user) return res.json({ success: false, message: 'Authentication failed. User not found.' });
			else {
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) return res.json({ success: false, message: err });

					if (!isMatch) return res.json({ success: false, message: 'Password is incorrect.' });

					// create token
					const token = jwt.sign(user._id, app.get('secretKey'), {
						expiresIn: 10080 // expires in 7 days
					});

					res.header("x-access-token", token);

					// return the token
					return res.json({ success: true, message: 'Enjoy your token!', user_id: user._id, max_calories_allowed: user.max_calories_allowed, user_role: user.user_role, token });
				});
			}
		});
	});


	tokenRouter.route('/checkToken')
		.post((req, res) => {

			// check header or url parameters or post parameters for token
			const token = req.body.token || req.query.token || req.headers['x-access-token'];

			// decode token
			if (token) {

				// verifies secret and checks exp
				jwt.verify(token, app.get('secretKey'), (err, decoded) => {
					if (err) return res.json({ success: false, message: 'Failed to authenticate token.', err: err })
					else {

						// uf everything is good, save to request for use in other routes
						return res.json({ success:true, message:'Token is correct' });
					}
				});
			} else {
				// no token, return an error
				return res.status(403).send({ success: false, message: 'No token provided.' });
			}
		});

	return tokenRouter;
}
