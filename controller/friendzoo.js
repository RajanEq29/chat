

// import FriendList =req ("../models/FriendList.js");
// import Newuser from ("../models/Newuser.js");
const Newuser = require('../Modal/User')
const FriendList = require('../Modal/friendList')

exports.addFriend = async (req, res) => {
  try {
    const userId = req.params.id; 
    const loggedInUserId = req.user.id;

    console.log('userId:', userId);
    console.log('loggedInUserId:', loggedInUserId);

    // Prevent adding yourself
    if (userId === loggedInUserId) {
      return res.status(400).json({ error: "You cannot add yourself as a friend" });
    }

    // Fetch both users
    const [loggedInUser, friendUser] = await Promise.all([
      Newuser.findById(loggedInUserId),
      Newuser.findById(userId)
    ]);

    if (!loggedInUser || !friendUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch or create FriendLists
    let loggedInFriendList = await FriendList.findOne({ user: loggedInUserId });
    if (!loggedInFriendList) {
      loggedInFriendList = new FriendList({ user: loggedInUserId, friends: [] });
    }

    let friendUserFriendList = await FriendList.findOne({ user: userId });
    if (!friendUserFriendList) {
      friendUserFriendList = new FriendList({ user: userId, friends: [] });
    }

    // Clean null friend entries
    loggedInFriendList.friends = loggedInFriendList.friends.filter(f => f.friendId);

    // Check if already friends
    const alreadyFriends = loggedInFriendList.friends.some(f =>
      f.friendId?.toString() === userId
    );

    if (alreadyFriends) {
      return res.status(400).json({ error: "Already friends" });
    }

    // Add friend entry
    loggedInFriendList.friends.push({
      friendId: friendUser._id,
      name: friendUser.name,
      email: friendUser.email,
      addedAt: new Date()
    });

    // (Optional) Add mutual friendship if desired:
    // friendUserFriendList.friends.push({
    //   friendId: loggedInUser._id,
    //   name: loggedInUser.name,
    //   email: loggedInUser.email,
    //   addedAt: new Date()
    // });

    // Save the updated friend list
    await loggedInFriendList.save();
    // await friendUserFriendList.save(); // If mutual

    // Format and return the updated list
    const formattedFriends = loggedInFriendList.friends.map(friend => ({
      friendId: friend.friendId,
      name: friend.name,
      email: friend.email,
      addedAt: friend.addedAt
    }));

    res.status(200).json({
      message: "Friend added successfully",
      updatedFriends: formattedFriends
    });

  } catch (error) {
    console.error("Add friend error:", error);
    res.status(500).json({ error: "Server error" });
  }
};






// Get friend list
exports.getMyFriends = async (req, res) => {
//   try {


    
//     const friendList = await FriendList.findOne({ user})
//       .populate('friends', '-password'); // populate full user info except password

//     if (!friendList) {
//       return res.status(404).json({ error: "Friend list not found" });
//     }

//     res.status(200).json({
//       user: loggedInUserId,
//       myFriends: friendList.friends,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
try {
    const users = await FriendList.find().select('-password'); 
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

