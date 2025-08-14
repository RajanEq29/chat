const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/Middleware");
const userController = require("../controller/createuser");
const userFriend = require("../controller/friendzoo");
const Message = require("../Modal/Message");


// router.post("/create-new", verifyToken, userController.createUser);
router.get('/all-users', verifyToken, userController.getAllUsers);
router.get('/my-created-users', verifyToken, userController.getUsersCreatedByAdmin);
router.post('/newfriend/:id',verifyToken ,userFriend.addFriend)
router.get('/myfriends', verifyToken, userFriend.getMyFriends);


router.get("/messages/:userId", async (req, res) => {
  const loggedInUserId = req.user.id;
  const otherUserId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { fromUserId: loggedInUserId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: loggedInUserId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


module.exports = router;