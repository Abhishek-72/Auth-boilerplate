const User = require("../model/userModel.js");
const jwt = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;
    // check if user aledy exist  by username or email
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user already exist ! Please log in.",
      });
    }

    // create new user
    const newUser = new User({
      userName,
      email,
      password,
    });
    await newUser.save();

    // Genrate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    // send token using cookie
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true, // Protect against XSS attacks
    });

    // remove password from response
    newUser.password = undefined;

    // respond with newely crreated user
    res.status(201).json({
      success: true,
      token,
      message: "User registered successfully !",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // check user exist and password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      console.log(password);
      console.log(user.password);

      return res.status(401).json({
        status: false,
        message: "Incorrect email or password",
      });
    }

    // Genrate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // send token using cookie
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true, // Protect against XSS attacks
    });
    user.password = undefined;
    // send response
    res.status(200).json({
      status: true,
      token,
      message: "user  logged in successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
