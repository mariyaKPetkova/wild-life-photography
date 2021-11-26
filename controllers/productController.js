const router = require('express').Router()
const { isUser } = require('../middlewares/guards.js')
const { deleteProduct } = require('../services/product.js')

router.get('/create', isUser(), async (req, res) => {

    res.render('product/create')
})

router.post('/create', isUser(), async (req, res) => {

    const productData = {
        // name: req.body.name,
        // city: req.body.city,
        // imageUrl: req.body.imageUrl,
        // rooms: req.body.rooms,
        // booked: [],
        // author: req.user._id
        name: req.body.name,
        keyword: req.body.keyword,
        city: req.body.city,
        date: req.body.date,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        author: req.user._id
    }

    try {
        await req.storage.createProduct(productData)
        
        res.redirect('/catalog')
    } catch (err) {
        console.log(err)
        let errors
        if (err.errors) {
            errors = Object.values(err.errors).map(e => e.properties.message)
        } else {
            errors = [err.message]
        }

        const ctx = {
            errors,
            productData: {
                // name: req.body.name,
                // city: req.body.city,
                // imageUrl: req.body.imageUrl,
                // rooms: req.body.rooms
                name: req.body.name,
                keyword: req.body.keyword,
                city: req.body.city,
                date: req.body.date,
                imageUrl: req.body.imageUrl,
                description: req.body.description,
                //author: req.user._id
            }

        }
        res.render('product/create', ctx)
    }
})

router.get('/details/:id', async (req, res) => {
    
    try {
        const product = await req.storage.getProductById(req.params.id)
        //console.log(product.voted.map(x=> x.email))
        // const authorName = await req.storage.getUserById(product.author)
        console.log(product.author)
        product.hasUser = Boolean(req.user)
        product.isAuthor = req.user && req.user._id == product.author._id
        product.isntAuthor = req.user && req.user._id != product.author._id
        product.isVoted = req.user && product.voted.find(x => x._id == req.user._id)
        product.hasVote = Boolean(product.voted.length > 0)
        product.nameAuthor = `${product.author.lname} ${product.author.fname}`
        product.voters = product.voted.map(x=> x.email).join(', ')
        res.render('product/details', { product })
    } catch (err) {
        res.redirect('/404')

    }
})
router.get('/edit/:id', isUser(), async (req, res) => {
    try {
        const product = await req.storage.getProductById(req.params.id)
        // console.log('req.user._id', req.user._id)
        // console.log('product.author', product.author)
        if (req.user._id != product.author) {
            throw new Error('Cannot edit')
        }
        res.render('product/edit', { product })
    } catch (err) {
        console.log(err)
        res.redirect('/')
    }
})
router.post('/edit/:id', isUser(), async (req, res) => {
    try {
        const product = await req.storage.getProductById(req.params.id)

        if (req.user._id != product.author) {
            throw new Error('Cannot edit')
        }
        await req.storage.editProduct(req.params.id, req.body)
        res.redirect('/products/details/'+req.params.id)
    } catch (err) {
        let errors
        if (err.errors) {
            errors = Object.values(err.errors).map(e => e.properties.message)
        } else {
            errors = [err.message]
        }

        const ctx = {
            errors,
            product: {
                _id: req.params.id,
                name: req.body.name,
                keyword: req.body.keyword,
                city: req.body.city,
                date: req.body.date,
                imageUrl: req.body.imageUrl,
                description: req.body.description,

            }
        }
        res.render('product/edit', ctx)
    }
})

router.get('/delete/:id', isUser(), async (req, res) => {
    try {
        const product = await req.storage.getProductById(req.params.id)

        if (req.user._id != product.author) {
            throw new Error('Cannot delete')
        }

        deleteProduct(product)
        res.redirect('/catalog')
    } catch (err) {
        res.redirect('/404')
    }
})

router.get('/vote-up/:id', isUser(), async (req, res) => {
    try {
        const product = await req.storage.getProductById(req.params.id)
        // console.log(product)
        if (req.user._id == product.author) {
            throw new Error('Cannot vote')
        }

        await req.storage.voteProduct(req.params.id, req.user._id)
        //res.redirect('/product/details/' + req.params.id)
        //res.render('product/details/' + req.params.id)
        res.redirect('/')
    } catch (err) {
        res.redirect('/404')
    }
})

router.get('/vote-down/:id', isUser(), async (req, res) => {
    try {
        const product = await req.storage.getProductById(req.params.id)

        if (req.user._id == product.author) {
            throw new Error('Cannot vote')
        }
        await req.storage.voteProduct(req.params.id, req.user._id)
        res.redirect('/')

    } catch (err) {
        res.redirect('/404')
    }
})
module.exports = router