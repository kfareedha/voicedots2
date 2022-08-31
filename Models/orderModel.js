const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const orderSchema = new mongoose.Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    orderItems:[
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'product',
            },
            quantity: {
                type: Number,
            }
        }
    ],
    totalPrice: {
        type: Number,
    },
    deliveryCharge: {
        type: Number,
    },
    deliveryDetails:{
        type: Schema.Types.ObjectId,
        ref: 'Address',
    },
    paymentDetails:{
        type: String,
    },
    orderStatus:{
        type: String,
    },
    
    deliveryStatus:{
        type: String,
    },
    orderDate:{
        type: String,
    },
    
    discount:{
        type: Number,
    },
    subTotal:{
        type: Number,
    },
},
{
    timestamps: true,
})

module.exports = mongoose.model('Order',orderSchema);