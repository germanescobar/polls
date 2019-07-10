const mongoose = require('mongoose');


const pollSchema = mongoose.Schema({
  title: String,
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  options: [{
    text: String,
    votes: { type: Number, default: 0 }
  }]
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
