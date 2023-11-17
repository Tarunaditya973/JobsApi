const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
require('dotenv').config("../env");
const jwt = require('jsonwebtoken')


const register = async (req, res) => {
  const user = await User.create({ ...req.body })

  const payload = {
    _id: user._id,
    email: user.email,
    password: user.password
  }
  const token = jwt.sign(payload, process.env.SECRET);
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })
}

const login = async (req, res) => {
  let token = req.cookie?.token
  if (!token) {
    const { email, password } = req.body

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({ email })
    if (!user) {
      throw new UnauthenticatedError('Invalid Credentials')
    }
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid Credentials')
    }
    // Create a JWT Token for the user
    const payload = {
      _id: user._id,
      email: user.email,
      password: user.password
    }
    // console.log(payload)
    token = jwt.sign(payload, process.env.SECRET);
    console.log(token)
    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })

  } else {
    return jwt.verify(token, process.env.SECRET);
  }
}

module.exports = {
  register,
  login,
}
