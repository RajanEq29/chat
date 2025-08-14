const mongoose = require('mongoose');

const friendListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   friends: [
    {
      friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'Newuser' },
      name: String,
      email: String,
      addedAt: Date
    }
  ]
});

module.exports = mongoose.model('FriendList', friendListSchema);
