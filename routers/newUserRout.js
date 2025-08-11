const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/Middleware");
const userController = require("../controller/createuser");


router.post("/create-new", verifyToken, userController.createUser);
router.get('/all-users', verifyToken, userController.getAllUsers);
router.get('/my-created-users', verifyToken, userController.getUsersCreatedByAdmin);


module.exports = router;