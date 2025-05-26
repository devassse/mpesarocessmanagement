const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const ldap = require('ldapjs')
const isLocal = true

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      enum: ['Active', 'Pending Active', 'Deactivated', 'Password Recovery'],
      type: String,
      default: 'Pending Active',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
    },
    ticketId: {
      type: String,
    },
    roles: {
      type: [String], // Array of strings for roles
      default: [], // Default to an empty array
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
)

// Static signup method
userSchema.statics.signup = async function (email, username, department, ticketId) {
  // Validation
  if (!email || !username || !department || !ticketId) {
    throw Error('All fields must be filled')
  }
  if (!validator.isEmail(email)) {
    throw Error('Email not valid')
  }

  const existingUser = await this.findOne({ $or: [{ email }] })
  if (existingUser) {
    if (existingUser.status === 'Pending Active') {
      // Update the existing pending user
      existingUser.username = username
      existingUser.department = department
      existingUser.ticketId = ticketId
      await existingUser.save()
      return existingUser
    } else if (existingUser.status === 'Active' || existingUser.status === 'Deactivated') {
      throw Error('Account already registered')
    }
  }

  // Create a new user
  const user = await this.create({
    email,
    username,
    department,
    ticketId,
    status: 'Pending Active',
  })

  return user
}

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  // Find the user in your database
  const user = await this.findOne({ email })
  if (!user) {
    throw Error('Incorrect email')
  }

  // Check if the user's status is 'Active'
  if (user.status !== 'Active') {
    throw Error('User account is not active')
  }

  // Extract the username from the email by removing '@vm.co.mz'
  // Prod ----------------------------------------------------------------
  // const emailPrefix = email.replace('@testad.voda', '');
  // Test -------------------------------------
  const emailPrefix = email.replace('@vm.co.mz', '')

    // LDAP Authentication
    // LDAP server configuration
    // dev --- 10.123.187.100
    const url = 'ldap://192.168.43.117:10389' // Use 'ldaps://' and port 636 if using LDAPS  # Allways use the IP address of the Host
    const client = ldap.createClient({
      url: url,
      timeout: 5000,
      connectTimeout: 10000,
    })

    // User's Distinguished Name (DN) in LDAP
    // Prod ----------------------------------------------------------------
    const userDN = `CN=${emailPrefix},OU=Standard,OU=Vodafone,OU=Users,OU=Vodacom Mozambique,DC=vm,DC=co,DC=mz`
    // Test ------------------------------------
    // const userDN = `CN=${emailPrefix},OU=Users,OU=Vodacom Mozambique,DC=testad,DC=voda`;

    // Attempt to bind (authenticate) with the provided credentials
    return new Promise((resolve, reject) => {
      client.bind(userDN, password, (err) => {
        // Always unbind after the operation
        client.unbind()

        if (err) {
          reject(Error('Incorrect password or authentication failed'))
        } else {
          resolve(user)
        }
      })
    })
  }

// Static signup Local method
userSchema.statics.signupLocal = async function (email, username, password, department, ticketId) {
  // Validation
  if (!email || !username || !password || !department || !ticketId) {
    throw Error('All fields must be filled')
  }

  if (!validator.isEmail(email)) {
    throw Error('Email not valid')
  }

  // Encrypt the password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const existingUser = await this.findOne({ $or: [{ email }] })

  if (existingUser) {
    if (existingUser.status === 'Pending Active') {
      // Update the existing pending user
      existingUser.username = username
      existingUser.department = department
      existingUser.ticketId = ticketId
      await existingUser.save()
      return existingUser
    } else if (existingUser.status === 'Active' || existingUser.status === 'Deactivated') {
      throw Error('Account already registered')
    }
  }

  // Create a new user
  const user = await this.create({
    email,
    username,
    password: hashedPassword,
    department: department.value,
    ticketId,
    status: 'Pending Active',
  })

  return user
}

userSchema.statics.loginLocal = async function (email, password) {
  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  // Find the user in your database
  const user = await this.findOne({ email })
  if (!user) {
    throw Error('Incorrect email')
  }

  // Check if the user's status is 'Active'
  if (user.status !== 'Active') {
    throw Error('User account is not active')
  }

  // Extract the username from the email by removing '@vm.co.mz'
  // Prod ----------------------------------------------------------------
  // const emailPrefix = email.replace('@testad.voda', '');
  // Test -------------------------------------
  // const emailPrefix = email.replace('@vm.co.mz', '')

  // Local Login
  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    return {
      status: 400,
      success: false,
      message: 'Password incorreta',
    }
    // return res.status(400).json({ message: 'Password incorreta' }) This is not working, we don't have access to the res object here
  }

  return {
    status: 200,
    success: true,
    message: 'Login Successful',
    data: user, // cuidado com os dados sensíveis
  }
}

// Create the User model using the specific database connection
const User = mongoose.model('User', userSchema)

module.exports = User
