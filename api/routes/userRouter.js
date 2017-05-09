const express = require('express');
const userRouter = express.Router();
const bcrypt = require('bcrypt-nodejs');

module.exports = (User) => {
    userRouter.route('/')
    // .get((req, res) => {
    //     User.find((err, users) => {
    //         if (err) return res.json({ success: false, message: err });
    //         return res.json({ success: true, users });
    //     });
    // })
    .post((req, res) => {
        let { email, password } = req.body;

        if(email) email = email.trim();
        if(password) password = password.trim();

        User.create({ email, password }, (err, user) => {
            // email and password validation will be done on the front-end

            if (err) return res.json({ success: false, message: 'This email is already in use.' });
            return res.json({ success: true, message: 'User was created successfully!', user_id: user._id });
        })
    });

    userRouter.route('/:user_id')
        .get((req, res) => {
            const { user_id } = req.params;
            User.findById(user_id, (err, user) => {
                if (err) return res.json({ success: false, message: err });
                console.log(user_id);
                return res.json({ success: true, message: 'Success getting the user', user });
            });
        })
        .patch((req, res) => {
            const updatedUser = {};
            const { user_id } = req.params;
            let { email, user_role, max_calories_allowed, password } = req.body;

            if(email) {
                email = email.trim();
                updatedUser.email = email;
            }

            if(password) {
                password = password.trim();
                updatedUser.password = password;
            }

            if(max_calories_allowed) {
                updatedUser.max_calories_allowed = max_calories_allowed;
            }

            if(user_role) {
                updatedUser.user_role = user_role;
            }

            bcrypt.genSalt(10, (err, salt) => {
                if (err) return res.json({ success: false, message: err });

                bcrypt.hash(updatedUser.password, salt, null, (err, hash) => {
                    if (err) return res.json({ success: false, message: err });

                    if(updatedUser.password)
                        updatedUser.password = hash;

                    User.findByIdAndUpdate(user_id, updatedUser, (err, user) => {
                        if (err) return res.json({ success: false, message: err });
                        return res.json({ success: true, message: 'User was updated successfully!'});
                    });
                });
            });
        })
        .delete((req, res) => {
            const { user_id } = req.params;
            User.findByIdAndRemove(user_id, (err, user) => {
                if (err) return res.json({ success: false, message: err });
                return res.json({ success: true, message: 'User was deleted successfully!'});
            });
        });

    userRouter.route('/role/:user_role')
        .get((req, res) => {
            const { user_role } = req.params;
			let role_allowed = 0;

            if(user_role === '2') role_allowed = 1;
			if(user_role === '3') role_allowed = 3;

            User.find({ user_role: { $lte : role_allowed } }, (err, users) => {
                if (err) return res.json({ success: false, message: err });

                if (users.length > 0)
                    return res.json({ success: true, message: 'Success on getting the users by role', users });
            });
        });

    return userRouter;
}
