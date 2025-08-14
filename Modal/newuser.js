const mongoose = require("mongoose");

const newUser = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
      friends: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Newuser" }
  ]
}, { timestamps: true });


module.exports = mongoose.model('Newuser', newUser)