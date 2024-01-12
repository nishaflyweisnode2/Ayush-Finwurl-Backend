const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        firstName: { type: String, },
        middleName: { type: String, default: '' },
        lastName: { type: String, },
    },
    gender: { type: String, enum: ['Male', 'Female', 'Others'], },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widow(er)', 'Others'], },
    dateOfBirth: { type: String, },

});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);

module.exports = UserDetails;
