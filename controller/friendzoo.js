
const Newuser = require('../Modal/User')
const FriendList = require('../Modal/friendList')

exports.addFriend = async (req, res) => {
  try {
    const userId = req.params.id;
    const loggedInUserId = req.user.id;

    console.log('userId:', userId);
    console.log('loggedInUserId:', loggedInUserId);

    if (userId === loggedInUserId) {
      return res.status(400).json({ error: "You cannot add yourself as a friend" });
    }


    const [loggedInUser, friendUser] = await Promise.all([
      Newuser.findById(loggedInUserId),
      Newuser.findById(userId)
    ]);
    console.log(friendUser)

    if (!loggedInUser || !friendUser) {
      return res.status(404).json({ error: "User not found" });
    }


    let loggedInFriendList = await FriendList.findOne({ user: loggedInUserId });
    if (!loggedInFriendList) {
      loggedInFriendList = new FriendList({ user: loggedInUserId, friends: [] });
    }

    let friendUserFriendList = await FriendList.findOne({ user: userId });
    if (!friendUserFriendList) {
      friendUserFriendList = new FriendList({ user: userId, friends: [] });
    }

    loggedInFriendList.friends = loggedInFriendList.friends.filter(f => f.friendId);


    const alreadyFriends = loggedInFriendList.friends.some(f =>
      f.friendId?.toString() === userId
    );

    if (alreadyFriends) {
      return res.status(400).json({ error: "Already friends" });
    }
    loggedInFriendList.friends.push({
      friendId: friendUser._id,
      name: friendUser.name,
      email: friendUser.email,
      status: friendUser.status,
      image: friendUser.image,
      addedAt: new Date()
    });

    await loggedInFriendList.save();

    res.status(200).json({
      message: "Friend added successfully",
      updatedFriends: loggedInFriendList.friends
    })
  } catch (error) {
    console.error("Add friend error:", error);
    res.status(500).json({ error: "Server error" });
  }
};






// Get friend list
exports.getMyFriends = async (req, res) => {

  try {
    const users = await FriendList.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

