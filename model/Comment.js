const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    lecturer:
    {
        type: String,
        required: true
    },
    name:
    {
        type: String,
        required: true
    },
    date:
    {
        type: String,
        required: true
    },
    text:
    {
        type: String,
        required: true
    },
    grade:
    {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('Comment', schema);