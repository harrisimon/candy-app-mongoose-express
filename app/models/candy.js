const mongoose = require('mongoose')

const candySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		flavor: {
			type: String,
			required: true,
		},
		calories: {
			type: Number,
			required: true
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Candy', candySchema)
