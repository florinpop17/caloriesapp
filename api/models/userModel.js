const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	date: { type: Date, default: Date.now },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_role: { type: Number, default: 1 },
    max_calories_allowed: { type: Number, default: 2000 }
})

// presaving
userSchema.pre('save', function(next) {
    const user = this;

    // generate a salt
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }

        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) { return next(err); }

            user.password = hash;
            next();
        });
    });
});

module.exports = mongoose.model('User', userSchema);
