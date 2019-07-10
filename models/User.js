const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, 'is required'],
    lowercase: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'is required']
  }
});

userSchema.pre("save", function(next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    if(err) {
      return next(err);
    }
    this.password = hash;
    next();
  })
});

userSchema.statics.authenticate = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (user) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) reject(err);
        resolve(result === true ? user : null);
      });
    });
  }
  return null;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
