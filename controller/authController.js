const User = require("../Modal/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { status } = require("express/lib/response");

exports.registerUser = async (req, res) => {
  console.log("DEBUG req.body:", req.body);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`; // stored by multer
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      status: "offline",
      image: imagePath,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, status: newUser.status },
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.Login = async (req, res) => {
  const { email, password } = req.body || {};

  // Step 1: Basic validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    // Step 2: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Step 3: Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    user.status = "online";
    await user.save();
    // Step 4: Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Step 5: Send success response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};
