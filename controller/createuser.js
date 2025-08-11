const bcrypt = require('bcryptjs');
const Newuser = require('../Modal/newuser');

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


exports.getAllUsers=async(req,res)=>{
     try {
    const users = await Newuser.find().select('-password'); // exclude password from result
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
