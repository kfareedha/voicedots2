const async = require('hbs/lib/async');
const { reject } = require('bcrypt/promises')
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const cartModel = require('../models/cartModel')
const wishlistModel = require('../models/wishlistModel')
const productModel = require('../models/productModel')
const mongoose = require('mongoose')
const addressModel = require('../models/addressModel')
const Razorpay = require('razorpay');
const orderModel = require('../models/orderModel')
const couponModel = require('../models/couponModel');
var instance = new Razorpay({
    key_id: 'rzp_test_DRTObS63yIQCzy',
    key_secret: 'UoelUxDoICR5bwkpCVVE0tmI',
  });

let userHelper = {

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
            // console.log("id", details)
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
                        let wishlist = await wishlistModel.findOne({ user: user_Id, 'wishListItems.product': proId })
                       console.log(wishlist,"wish")
                        if (wishlist) {
                            wishlistModel.updateOne({ user: userId }, {
                                $pull: {
                                    wishListItems:
                                        { product: proId }
                                }
                            }).then((data) => {
                                response.added = false
                                response.data = data
                                resolve(response)
                                // console.log(wishlist,"wish22")
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
                    let wishlist = await wishlistModel.findOne({ user: user_Id, 'wishListItems.product': proId })
                    console.log(wishlist,"wishlist")
                    if (wishlist) {
                        wishlistModel.updateOne({ user: userId }, {
                            $pull: {
                                wishListItems:
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
                // console.log(cartProduct);
                count = cartProduct.cartItems.length
                // console.log(count);
            }
            resolve(count)
        })
    },
    cartTotal: (cart) => {
        return new Promise(async (resolve, reject) => {
            let total = cart.cartItems.reduce((acc, curr) => {
                acc = acc + curr.product.productprice * curr.quantity
                return acc;
            }, 0)
            let response = {};
            let shipping = 0;
            if (total < 1000) {
                shipping = 100;
            }
            response.shipping = shipping;
            response.total = total;
            response.grandTotal = response.total + response.shipping;
            if(cart.discount){
               response.grandTotal = response.grandTotal - cart.discount
                response.discount = cart.discount
            }
            resolve(response);
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
            // console.log("before fn"+userId)
            let cartItems = await cartModel.findOne({user:userId}).populate('cartItems.product').lean()
            if (cartItems){
            if(cartItems.cartItems.length > 0){
                response.notEmpty =true
                response.cart=cartItems
                resolve(response)
            }else{
                response.notEmpty=false
                resolve(response) 
            }}
            else{
                response.notEmpty=false
                    resolve(response) }
            
            })
        },
    
    quantityPlus: (proId, userId) => {
        // console.log(proId)
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
                // console.log(cart)
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
                    wishListItems
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
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await addressModel.find({ user: userId }).lean();
            resolve(address);
        })
    },
    addAddress: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            try{

                let defaultAddress = null;
                let address = await addressModel.find({ User: userId }).lean();
                console.log(address)
                if (address) {
                    defaultAddress = false;
                } else {
                    defaultAddress = true;
                }
                let Address = new addressModel({
                    User: userId,
                    name: data.name,
                    email:data.email,
                    mobile:data.mobile,
                    address1: data.address1,
                    address2: data.address2,
                    country: data.country,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    
                    defaultAddress
                })
            console.log(Address)
                Address.save().then((address) => {
                    resolve(address);
                })
            }catch(err){
                console.log(err)
            }
            })
            
    },
    applyCoupon: (couponcode,id) => {
        return new Promise(async(resolve, reject) => {
            let response = {}
            response.discount = 0
            // code.code = code.code.toUpperCase();
            let coupon = await couponModel.findOne({code:couponcode.code})
            console.log(coupon)
            if(coupon){
                response.status = true
                response.coupon = coupon
                userHelper.getCartProducts(id).then((cartProducts)=>{
                    userHelper.cartTotal(cartProducts.cart).then((total)=>{
                        response.discount = (total.grandTotal * coupon.percentage)/100
                        response.grandTotal = total.grandTotal - response.discount
                        console.log(response,"cpn apply")
                        resolve(response)
                    })
                })
            }else{
                response.status = false
                resolve(response)
            }
        })
    }, 
    PlaceOrder:(data,userId)=>{
        let orderStatus
        return new Promise(async (resolve, reject) => {
          if(data.paymentMethod==='COD'){
           orderStatus ='Placed' ;
          }else{orderStatus ='Pending'

          }
          console.log(data,"rrrr");
          userHelper.getCartProducts(userId).then((cartProducts)=>{
            userHelper.cartTotal(cartProducts.cart).then((response)=>{
                console.log(response,"ppppp")
                if(data.discount){
                    response.grandTotal = response.grandTotal - data.discount
                    console.log(response.grandTotal,data.discount)
                }
             let order = new orderModel({
                user: userId,
                orderItems: cartProducts.cart.cartItems,
                totalPrice:response.grandTotal,
                deliveryCharge: response.shipping,
                deliveryDetails: data.address,
                paymentDetails:data.paymentMethod,
                orderStatus,
                orderDate:new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear(),
                
                discount:data.discount,
                subTotal:response.total,
              })
              order.save().then(async(data)=>{
                let cartItems = cartProducts.cart.cartItems
                cartModel.findOneAndUpdate({user:userId},{$pull:{cartItems:{}}}).then((data)=>{
                    console.log(data);
                
                })
                
                resolve(data);
              })
            })
          })
        })
      },
      generateRazorPay:(Order)=>{
        return new Promise((resolve,reject) => {
            console.log(Order._id,"generater")
            let fund = Order.totalPrice * 100
            fund = parseInt(fund)
            var options = {
                amount: fund,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+Order._id,
              };
              instance.orders.create(options, function(err, order) {
                console.log(order+"sdfgbhzxcdfgxsdcvxcv");
                console.log(err);

                resolve(order)
              });

        })
      },
      verifyPayment:(data)=>{
        return new Promise(async (resolve, reject) => {
          const crypto = require('crypto');
          let hmac = crypto.createHmac('sha256','UoelUxDoICR5bwkpCVVE0tmI')
          let body=data.payment.razorpay_order_id + "|" + data.payment.razorpay_payment_id;
          hmac.update(body.toString());
          hmac = hmac.digest('hex');
          if(hmac==data.payment.razorpay_signature){
            resolve();
          }else{
            reject();
          }
        })
      },
      changeOrderStatus:(data,id)=>{
        return new Promise(async (resolve, reject)=>{
          orderModel.findByIdAndUpdate(data.order.receipt,{ orderStatus:'Placed',deliveryStatus:'processing' }).then(()=>{
            cartModel.findOneAndRemove({user:id}).then(()=>{
                resolve()
            })
          })
        })
      },
      getOrder:(id) => {
        return new Promise((resolve,reject)=>{
            orderModel.findById(id).populate('orderItems.product').populate('deliveryDetails').lean().then((order)=>{
                resolve(order)
            })
        })
      },
      getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await productModel.find({}).populate('categories').lean().then((products)=>{
                resolve(products);
            })
        })
      },
      getUserOrders:(userId)=>{
        console.log(userId,"orderjs")
        return new Promise(async (resolve, reject) => {
            let userOrder = await orderModel.find({ userId:userId }).sort({orderDate:-1}).populate('orderItems.product').lean()
            console.log(userOrder , "userorder")
                resolve(userOrder)
            })
        },
        cancelOrder:(orderId)=>{
            return new Promise(async(resolve,reject)=>{
                let order = await orderModel.findById(orderId).lean()
                orderModel.findByIdAndUpdate(orderId,{orderStatus:'cancelled'}).then((data)=>{
                    resolve(data)
                })
            })
        }
    /*userData:(id)=>{
        return new Promise((resolve,reject)=>{
            
            User.findById().then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    }*/

}
module.exports = userHelper


