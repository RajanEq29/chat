const bcrypt = require('bcryptjs');
const Newuser = require('../Modal/User');
const { type } = require('express/lib/response');

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await Newuser.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Newuser({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await Newuser.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }


}
exports.getUsersCreatedByAdmin = async (req, res) => {
  const adminId = req.user.id;

  try {
    const users = await Newuser.find({ createdBy: adminId }, '-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletUser = async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  try {
    const deletedUser = await Newuser.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: 'Use Delete Succefully'

    })

  } catch (error) {
    // console.error("Delete user error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });

  }
}
exports.updateUser = async (req, res) => {
  const userId = req.params.id
  console.log(userId)
  const { name, email, password } = req.body

  try {
    let updateData = { name, email };


    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);  
    }

    const updatedUser = await Newuser.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }

}








