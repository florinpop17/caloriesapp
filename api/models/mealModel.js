const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose.model('Meal', new Schema({
    date: { type: Date, default: Date.now },
    text: { type: String, required: true },
    calories: { type: Number, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}));
