const { Schema, model } = require('mongoose')

const schema = new Schema({
    name: {
        type: String,
        required: [true,'Name is required'],
        minLength: [6, 'The title must be at least 6 symbols long'],
    },
    keyword: {
        type: String,
        required: [true,'Keyword is required'],
        minLength: [6, 'The keyword must be at least 6 symbols long']
    },
    city: {
        type: String,
        required: [true,'City is required'],
        maxLength: [10, 'Location should be a maximum of 10 characters long']
    },
    date: {
        type: String,
        required: [true,'Date is required'],
        match: [/[0-9]{2}.[0-9]{2}.[0-9]{4}/, 'The Date should be exactly 10 characters - 02.02.2021']
    },
    imageUrl: {
        type: String,
        required: [true,'Image is required'],
        match: [/^https?:\/\//, 'The Wildlife Image should start with http:// or https://']
    },
    description: {
        type: String,
        required: [true,'Description is required'],
        minLength: [8, 'The Description should be a minimum of 8 characters long.']
    },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    voted: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    vote:{type:Number,default:0}
})

module.exports = model('Product', schema)