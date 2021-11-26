const User = require('../models/User.js')
async function createUser(fname, lname, email, hashedPassword) {
    const user = new User({
        fname,
        lname,
        email,
        hashedPassword
    })
    await user.save()
    return user
}
async function getUserByUsername(username) {
    const pattern = new RegExp(`^${username}$`, 'i')
    const user = await User.findOne({ username: { $regex: pattern } })
    return user
}
async function getUserByEmail(email) {
    const pattern = new RegExp(`^${email}$`, 'i')
    const user = await User.findOne({ email: { $regex: pattern } })
    return user
}
async function getUserById(id) {
    const user = await User.findById(id).lean()
    return user
}

module.exports = {
    createUser,
    getUserByUsername,
    getUserByEmail,
    getUserById

}

