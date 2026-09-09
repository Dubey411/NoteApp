
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     email:{type:String,required:true,unique:true},
//     password:{type:String,required:true}
// });

// module.exports = mongoose.model('User',userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // not required → Google users won’t have this
  },
  name: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values, but unique when filled
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
