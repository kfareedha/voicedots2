const async = require('hbs/lib/async');
const { reject } = require('bcrypt/promises')
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const cartModel = require('../models/cartModel')
const wishlistModel = require('../models/wishlistModel')
const productModel = require('../models/productModel')
const mongoose = require('mongoose')
module.exports = {

    userSave: (userData) => {
        return new Promise(async (resolve, reject) => {
            let { name, email, mobile, password, confirmPassword } = userData
            let status = true;
            password = await bcrypt.hash(password, 10)
            user = new User({

                name,
                email,
                mobile,
                password,
                confirmPassword,
                status

            })

            user.save().then((data) => {
                console.log(data)
                resolve(data)
            }).catch((err) => {
                console.log(err)
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await User.findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    },
    updateProfile: (details) => {
        return new Promise((resolve, reject) => {
            console.log("id", details)
            User.findByIdAndUpdate((details.id), { name: details.name, email: details.email, mobile: details.mobile }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    addToCart: (userId, proId) => {
        let user_Id = mongoose.Types.ObjectId(userId);
        const response = {
            duplicate: false
        }
        return new Promise(async (resolve, reject) => {

            let cart = await cartModel.findOne({ user: user_Id })
            if (cart) {
                let cartProduct = await cartModel.findOne({ user: user_Id, 'cartItems.product': proId })
                if (cartProduct) {
                    response.duplicate = true
                    resolve(response)
                } else {
                    let cartArray = { product: proId, quantity: 1 }
                    cartModel.findOneAndUpdate({ user: user_Id }, { $push: { cartItems: cartArray } }).then(async (data) => {
                        let wishlist = await wishlistModel.findOne({ user: user_Id, 'wishlistItems.product': proId })
                        if (wishlist) {
                            wishlistModel.updateOne({ user: userId }, {
                                $pull: {
                                    wishlistItems:
                                        { product: proId }
                                }
                            }).then((data) => {
                                response.added = false
                                response.data = data
                                resolve(response)
                            })
                        }
                        resolve(data)
                    })
                }
            } else {
                let product = proId;
                let quantity = 1;
                cart = new cartModel({
                    user: userId,
                    cartItems: [
                        {
                            product,
                            quantity
                        }
                    ]
                })
                cart.save().then(async (data) => {
                    let wishlist = await wishlistModel.findOne({ user: user_Id, 'wishlistItems.product': proId })
                    if (wishlist) {
                        wishlistModel.updateOne({ user: userId }, {
                            $pull: {
                                wishlistItems:
                                    { product: proId }
                            }
                        }).then((data) => {
                            response.added = false
                            response.data = data
                            resolve(response)
                        })
                    }
                    resolve(data)
                })
            }
        })
    },
    
    showCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartProduct = await cartModel.findOne({ user: userId }).populate('products')
            resolve(cartProduct)
        })
    },
    deleteFromCart: (userId, proId) => {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId }, {
                $pull: {
                    cartItems:
                        { product: proId }
                }
            }).then((data) => {
                resolve(data)
            })
        })

    },
    cartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cartProduct = await cartModel.findOne({ user: userId });
            if (cartProduct) {
                console.log(cartProduct);
                count = cartProduct.cartItems.length
                console.log(count);
            }
            resolve(count)
        })
    },
    wishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlistProduct = await wishlistModel.findOne({ user: userId })
            if (wishlistProduct) {
                count = wishlistProduct.wishListItems.length
            }
            resolve(count)
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async(resolve, reject) => {
            let response={}
            console.log("before fn"+userId)
            let cartItems = await cartModel.findOne({user:userId}).populate('cartItems.product').lean()
            console.log(cartItems)
            if(cartItems.cartItems.length > 0){
                response.notEmpty =true
                response.cart=cartItems
                resolve(response)
            }else{
                response.notEmpty=false
                resolve(response) 
            }
            
            })
        },
    
    quantityPlus: (proId, userId) => {
        console.log(proId)
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId, 'cartItems.product': proId }, { $inc: { 'cartItems.$.quantity': 1 } }).then(async (data) => {
                let cart = await cartModel.findOne({ user: userId }).lean()
                let response = {}
                let count = null
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == proId) {
                        count = cart.cartItems[i].quantity
                    }
                }
                response.count = count
                resolve(response)
            })
        })
    },
    quantityMinus: (proId, userId) => {
        console.log(proId)
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId, 'cartItems.product': proId }, { $inc: { 'cartItems.$.quantity': -1 } }).then(async (data) => {
                let response = {}
                let cart = await cartModel.findOne({ user: userId }).lean()
                response.cart = cart
                console.log(cart)
                let count = null
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == proId) {
                        count = cart.cartItems[i].quantity
                    }
                }
                if (count == 0) {
                    cartModel.updateOne({ user: userId }, {
                        $pull: {
                            cartItems:
                                { product: proId }
                        }
                    }).then((data) => {
                        response.data = data
                    })
                }
                response.count = count
                resolve(response)
            })
        })
    },
    deleteFromCart: (userId, proId) => {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId }, {
                $pull: {
                    cartItems:
                        { product: proId }
                }
            }).then((data) => {
                resolve(data)
            })
        })
    },
    
    addToWishList:(userId,productId)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            let userWishlist = await wishlistModel.findOne({user: userId})
            if(userWishlist){
                let exist = await wishlistModel.findOne({user: userId,'wishListItems.product':productId})
                if(!exist){
                    let conditions = {
                        user: userId,
                        'wishListItems.product': { $ne: productId }
                    };
                    var update = {
                        $addToSet: { wishListItems: { product: productId} }
                    }
                    wishlistModel.findOneAndUpdate(conditions, update).then((data)=>{
                        response.added = true
                        response.data = true
                        resolve(response)
                    })
                }else{
                    wishlistModel.updateOne({ user: userId }, {
                        $pull: {
                            wishListItems:
                                { product: productId }
                        }
                    }).then((data)=>{
                        response.added = false
                        response.data = data
                        resolve(response)
                    })
                }

            }else{
                let user = userId
                let product = productId
                let wishlistItems = []
                wishlistItems[0] = {product}
                newWishlist = new wishlistModel({
                    user,
                    wishlistItems
                })
                newWishlist.save().then((data) => {
                    response.added = true
                    response.data = data
                    resolve(response)
                })
            }
        })
    },
    wishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let products = await wishlistModel.findOne({ user: userId }).populate('wishListItems.product').lean()
            if (products.wishListItems.length > 0) {
                response.notEmpty = true
                response.products = products
                resolve(response)
            } else {
                response.notEmpty = false
                resolve(response)
            }
        })
    },
    removeWishlistItem: (userId, proId) => {
        return new Promise((resolve, reject) => {
            let response = {}
            wishlistModel.updateOne({ user: userId }, {
                $pull: {
                    wishListItems:
                        { product: proId }
                }
            }).then((data) => {
                response.removed = true
                response.data = data
                resolve(response)
            })
        })
    },
    /*userData:(id)=>{
        return new Promise((resolve,reject)=>{
            
            User.findById().then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    }*/

}



