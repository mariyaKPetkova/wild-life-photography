const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userService = require('../services/user.js')
const { COOKIE_NAME, TOKEN_SECRET } = require('../config/index.js')

module.exports = () => (req, res, next) => {

    if (parseToken(req, res)) {
        req.auth = {
            async register(fname, lname, email, password) {
                const token = await register(fname, lname, email, password)
                res.cookie(COOKIE_NAME, token)
            },
            async login(email, password) {
                const token = await login(email, password)
                res.cookie(COOKIE_NAME, token)
            },
            logout() {
                res.clearCookie(COOKIE_NAME)
            }
        }
        next()
    }
}


async function register(fname, lname, email, password) {
    //console.log(username, email, password)
    //const existUsername = await userService.getUserByUsername(username)
    const existEmail = await userService.getUserByEmail(email)

    //console.log(existUsername, existEmail)
    // if (existUsername) {
    //     throw new Error('Username is taken')
    if (existEmail) {
        throw new Error('Email is taken')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userService.createUser(lname, fname, email, hashedPassword)
    return generateToken(user)
}

async function login(email, password) {
    const user = await userService.getUserByEmail(email)
    if (!user) {
        throw new Error('No such email')
    }
    const hasMatch = await bcrypt.compare(password, user.hashedPassword)
    //console.log(hasMatch)
    if (!hasMatch) {
        throw new Error('Incorrect password')
    }
    return generateToken(user)
}

function generateToken(userData) {
    return jwt.sign({
        _id: userData._id,
        email: userData.email,
        fname: userData.fname,
        lname: userData.lname
        // bookedProducts: userData.bookedProducts,
    }, TOKEN_SECRET)
}

function parseToken(req, res) {
    const token = req.cookies[COOKIE_NAME]
    if (token) {
        try {
            const userData = jwt.verify(token, TOKEN_SECRET)
            req.user = userData
            res.locals.user = userData
        } catch (err) {
            res.clearCookie(COOKIE_NAME)
            res.redirect('/auth/login')
            return false
        }
    }
    return true
}