const express = require('express');
const mealRouter = express.Router();

module.exports = (Meal) => {
    mealRouter.route('/')
        // .get((req, res) => {
        //     Meal.find((err, meals) => {
        //         if (err) return res.json({ success: false, message: err });
        //         return res.json({ success: true, meals });
        //     });
        // })
        .post((req, res) => {
            const { text, calories, date, user_id } = req.body;
            Meal.create({ text, calories, date, user_id }, (err, meal) => {
                if (err) return res.json({ success: false, message: err });
                return res.json({ success: true, message: 'Meal was created successfully!' });
            });
        });

	mealRouter.route('/by_user/:user_id')
		.get((req, res) => {
			const { user_id } = req.params;

			Meal.find({ user_id }, (err, meals) => {
				if (err) return res.json({ success: false, message: err });
				return res.json({ success: true, meals });
			})
		});

	mealRouter.route('/:meal_id')
		.get((req, res) => {
			const { meal_id } = req.params;

			Meal.findById(meal_id, (err, meal) => {
				if (err) return res.json({ success: false, message: err });
				return res.json({ success: true, message: 'Meal received', meal });
			});
		})
		.patch((req, res) => {
			const { meal_id } = req.params;
			let { text, calories, date } = req.body;

			if(text) text = text.trim();

			const updatedMeal = {
				text, calories, date
			}

			Meal.findByIdAndUpdate(meal_id, updatedMeal, (err, meal) => {
				if (err) return res.json({ success: false, message: err });
				return res.json({ success: true, message: 'Meal was updated successfully!' });
			})
		})
		.delete((req, res) => {
			const { meal_id } = req.params;

			Meal.findByIdAndRemove(meal_id, (err, meal) => {
				if (err) return res.json({ success: false, message: err });
				return res.json({ success: true, message: 'Meal deleted successfully!' });
			});
		})

    return mealRouter;
}
