const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true},
    password: String,
    role: {type: String, required: true},
    location: String,
});

const admin = mongoose.models.users || mongoose.model('users', userSchema);

module.exports = admin;