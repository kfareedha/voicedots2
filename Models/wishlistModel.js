const mongoose = require('mongoose')

const Schema = mongoose.Schema

const wishListSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    wishListItems: [{
        product:{
        type: Schema.Types.ObjectId,
        ref: 'product'},
        price:{
            type:Number
        }
    }],
},
{
    timestamps: true,
}
)

module.exports = mongoose.model('Wishlist', wishListSchema);