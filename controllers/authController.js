const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const { isGuest } = require('../middlewares/guards.js')

router.get('/register', isGuest(), (req, res) => {
    res.render('user/register')
})

router.post(
    '/register',
    isGuest(),
    body('email','Invalid email').isEmail(),
    body('fname')
    .isLength({ min: 3 }).withMessage('First name must be at least 3 symbols')
    .isAlpha().withMessage('First name may contain only latin letters'),
    body('lname')
    .isLength({ min: 5 }).withMessage('Last name must be at least 5 symbols')
    .isAlpha().withMessage('Last name may contain only latin letters'),
    body('password')
    .isLength({ min: 4 }).withMessage('Password must be at least 4 symbols')
    .isAlphanumeric().withMessage('Password may contain only latin letters and numbers'),
    body('repeatPassword').custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error('Passwords do not match')
        }
        return true
    }),
    async (req, res) => {
        console.log
        const { errors } = validationResult(req)
        //console.log(errors)
        try {
            if (errors.length > 0) {
                const message = errors.map(err => err.msg).join('\n')
                throw new Error(message)
            }
            await req.auth.register(req.body.fname,req.body.lname, req.body.email, req.body.password)
            res.redirect('/')
        } catch (err) {
            console.log(errors)
            const ctx = {
                errors:err.message.split('\n'),
                userData: {
                    fname: req.body.fname,
                    lname: req.body.lname,
                    email:req.body.email
                }
            }
            res.render('user/register', ctx)
        }

        // if(req.body.username < 3){
        //     throw new Error('User name must be at least 3 symbols')
        // }
    }
)


router.get('/login', isGuest(), (req, res) => {
    res.render('user/login')
})
router.post('/login', isGuest(), async (req, res) => {
    try {
        await req.auth.login(req.body.email, req.body.password)
        res.redirect('/')
    } catch (err) {
        console.log(err)
        const ctx = {
            errors: [err.message],
            userData: {
                email: req.body.email
            }
        }
        res.render('user/login', ctx)
    }
})
router.get('/logout', (req, res) => {
    req.auth.logout()
    res.redirect('/')
})

router.get('/my-posts', async(req, res) => {
    const idAuthor = req.user._id
    const authorName = `${req.user.lname} ${req.user.fname}`
    
    const posts = await req.storage.getAllProducts()
    const userPosts = posts.filter(x=> x.author == idAuthor)
    userPosts.map(x => Object.assign(x, {authorName}))
    //console.log(userPosts);
    
    res.render('user/my-posts',{userPosts})
})
module.exports = router