import bcrypt from 'bcrypt';
import User from '../models/User.js';
import fs from 'fs';
import jwt from 'jsonwebtoken';



export const loginUser = async (req, res) => {

  const { email, password } = req.body || {};
  try {
    const isExist = await User.findOne({ email });

    if (!isExist) return res.status(404).json({ message: "User not found" });

    const isMatch = bcrypt.compareSync(password, isExist.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Credential" });
    const token = jwt.sign({
      id: isExist._id,
      role: isExist.role
    }, process.env.JWT_SECRET);

    // res.cookie('token', token, {
    //   httpOnly: true,
    //   maxAge: 24 * 60 * 60 * 1000
    // });

    return res.status(200).json({
      role: isExist.role,
      token
    });


  } catch (err) {
    return res.status(400).json({
      message: err.message
    })

  }
}

export const registerUser = async (req, res) => {
  const { username, email, password, bio } = req.body || {};
  try {
    const isExist = await User.findOne({ email });
    if (isExist) {
      fs.unlink(`./uploads/${req.imagePath}`, (err) => {
        if (err) return res.status(500).json({ message: "Something went wrong" });
        return res.status(400).json({ message: "User already exist" });
      })

    } else {

      const hashPass = bcrypt.hashSync(password, 10);
      await User.create({
        username, email,
        password: hashPass,
        image: req.imagePath,
        bio
      });
      return res.status(201).json({ message: "Registered successfully" });

    }

  } catch (err) {
    return res.status(400).json({
      message: err.message
    })

  }

};


export const getUserProfile = async (req, res) => {

  try {

    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);

  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }

}


export const updateUserProfile = async (req, res) => {
  const { email, username } = req.body || {};
  try {

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.email = email || user.email;
    user.username = username || user.username;
    if (req.imagePath) {
      fs.unlink(`./uploads/${user.image}`, async (err) => {
        if (err) return res.status(500).json({ message: "Something went wrong" });
      })
      user.image = req.imagePath;
      await user.save();
      return res.status(200).json({ message: "Profile updated" });
    } else {
      await user.save();
      return res.status(200).json({ message: "Profile updated" });
    }

  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }

}