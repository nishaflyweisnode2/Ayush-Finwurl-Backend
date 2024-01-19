const mongoose = require('mongoose');

const ratingReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

const RatingReview = mongoose.model('RatingReview', ratingReviewSchema);

module.exports = RatingReview;
