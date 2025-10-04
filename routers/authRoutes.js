const express = require("express");
const router = express.Router();
const { registerUser, Login } = require("../controller/authController");
const upload =require('../Middleware/upload')


router.post("/register",upload.single("image"), registerUser);
router.post("/login", Login);


module.exports = router;
