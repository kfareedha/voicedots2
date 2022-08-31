const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const adminModel = require('../models/adminModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel');
const bannerModel = require('../models/bannerModel');
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel');
module.exports = {

    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let email = adminData.email
            let admin = await adminModel.findOne({ email })

            let response = {}
            if (admin) {
                if (adminData.email === admin.email && adminData.password === admin.password) {
                    console.log(admin)
                    response.status = true
                    response.admin = admin
                    resolve(response)
                }
            } else {
                response.status = false
                resolve(response)
            }
        })
    },
    addCategory: (categoryDetails, image) => {
        return new Promise(async (resolve, reject) => {
            let categoryimage = image
            let { categoryname, categorydescription } = categoryDetails
            let category = await categoryModel.findOne({ categoryname })
            let status = {
                check: false
            }
            if (category) {
                status.check = true
                resolve(status)
            } else {
                newCategory = new categoryModel({
                    categoryname,
                    categorydescription,
                    categoryimage
                }
                )
                newCategory.save().then((data) => {
                    console.log(data)
                    status.data = data
                    resolve(status)
                })
            }
        })
    },
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await categoryModel.find({}).lean()
            resolve(categories)
        })
    },
    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            categoryModel.findByIdAndDelete(id).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getCategory: (id) => {
        return new Promise(async (resolve, reject) => {
            let category = await categoryModel.findOne({ _id: id }).lean()
            resolve(category)
        })
    },
    editCategory: (details) => {
        return new Promise((resolve, response) => {
            categoryModel.findByIdAndUpdate(details.id, { categoryname: details.categoryname, categorydescription: details.categorydescription }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let userdetails = await userModel.find({}).lean()
            resolve(userdetails)
        })
    },
    blockUser: (userid) => {
        return new Promise(async (resolve, reject) => {
            let user = await userModel.findById(userid).lean()
            if (user.status) {
                userModel.findByIdAndUpdate(userid, { status: false }).then((data) => {
                    resolve(data)
                })
            }
            else {
                userModel.findByIdAndUpdate(userid, { status: true }).then((data) => {
                    resolve(data)
                })
            }

        })
    },
    getUsers: (id) => {
        return new Promise(async (resolve, reject) => {
            let userdetails = await userModel.findOne({ _id: id }).lean()
            resolve(userdetails)
        })
    },
    addProduct: (productDetails, image) => {
        return new Promise(async (resolve, reject) => {
            let productimage = image
            let { productname, productdescription, productprice, productcategory } = productDetails
            let product = await productModel.findOne({ productname })
            let status = {
                check: false
            }
            if (product) {
                status.check = true
                resolve(status)
            } else {
                newproduct = new productModel({
                    productname,
                    productdescription,
                    productimage,
                    productprice,
                    productcategory
                }
                )
                newproduct.save().then((data) => {
                    console.log(data)
                    status.data = data
                    resolve(status)
                })
            }
        })
    },
    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await productModel.find({}).lean()
            resolve(products)
        })
    },
    deleteProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            productModel.findByIdAndDelete(id).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            let product = await productModel.findById(id).lean()
            resolve(product)
        })

    },
    editProduct: (details, images) => {
        return new Promise(async (resolve, reject) => {
            console.log("id", details)
            productModel.findByIdAndUpdate((details.id), { productname: details.productname, productdescription: details.productdescription, productimage: images, productprice: details.productprice, productcategory: details.productcategory }).then((data) => {
                // console.log(data)
                resolve(data)
            })
        })
    },
    addBanner: (bannerDetails, image) => {
        return new Promise(async (resolve, reject) => {

            let bannerimage = image
            let {
                title,
                caption, category,
            } = bannerDetails
            console.log(bannerDetails)
            let banner = await bannerModel.findOne({ title })
            let status = {
                check: false
            }
            if (banner) {
                status.check = true
                resolve(status)
            } else {
                newbanner = new bannerModel({
                    bannerimage,
                    title,
                    caption,
                    category,


                }
                )
                newbanner.save().then((data) => {
                    console.log(data)
                    status.data = data
                    resolve(status)
                })
            }
        })
    },
    getAllBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await bannerModel.find({}).lean()
            console.log(banners)
            resolve(banners)
        })
    },
    deleteBanner: (id) => {
        return new Promise(async (resolve, reject) => {
            bannerModel.findByIdAndDelete(id).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getBanner: (id) => {
        return new Promise(async (resolve, reject) => {
            let banner = await bannerModel.findById(id).lean()
            resolve(banner)
        })

    },
    editBanner: (details, image) => {
        return new Promise(async (resolve, reject) => {
            console.log("id", details)
            bannerModel.findByIdAndUpdate((details.id), { bannerimage: image, title: details.title, caption: details.caption }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getcoupons: () => {
        return new Promise(async (resolve, reject) => {
            couponModel.find({}).lean().then((coupons) => {
                resolve(coupons)
            })
        })
    },
    getcoupon: (id) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await couponModel.findById(id).lean()
            resolve(coupon)
        })

    },
    addcoupon: (couponData) => {
        console.log(couponData)
        return new Promise(async (resolve, reject) => {
            let { name, code, description, percentage } = couponData
            // code = code.toUpperCase()
            let response = {}
            let coupon = await couponModel.findOne({ code: couponData.code })
            if (coupon) {
                response.exist = true
                resolve(response)
            } else {
                newCoupon = new couponModel({
                    name,
                    code,
                    description,
                    percentage
                })
                newCoupon.save().then((data) => {
                    response.exist = false
                    resolve(response)
                })
            }
        })
    },
    editcoupon: (details) => {
        return new Promise(async (resolve, reject) => {
            console.log("id", details)
            couponModel.findByIdAndUpdate((details.id), { name: details.name, code: details.code, description: details.description }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },

    deletecoupon: (id) => {
        return new Promise(async (resolve, reject) => {
            couponModel.findByIdAndDelete(id).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orderdetails = await orderModel.find({}).sort({ orderdDate: -1 }).populate('user').populate('deliveryDetails').populate('orderItems.product').lean()
            console.log(JSON.stringify(orderdetails) + "bdbsd")
            resolve(orderdetails)
        })
    },

    getOrders:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let orderdetails = await orderModel.findOne({_id:id}).lean()
            resolve(orderdetails)
        })
    },
    
    changeOrderStatusShipped:(orderId)=>{
        console.log(orderId,"shippedid");
        return new Promise(async(resolve,reject)=>{
          let order=await orderModel.findByIdAndUpdate({_id:orderId},{
                $set:{orderStatus:'shipped'}
            })
             resolve(order)
           
           
        })
    },
    changeOrderStatusdelivered:(orderId)=>{
        console.log(orderId);
        return new Promise(async(resolve,reject)=>{
          let order=await orderModel.findByIdAndUpdate({_id:orderId},{
                $set:{orderStatus:'delivered'}
            })
             resolve(order)
           
           
        })
    
    
    },
    changeOrderStatusarriving:(orderId)=>{
        console.log(orderId);
        return new Promise(async(resolve,reject)=>{
          let order=await orderModel.findByIdAndUpdate({_id:orderId},{
                $set:{orderStatus:'arriving'}
            })
             resolve(order)
           
           
        })
    
    
    },
    TotalUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let usercount= await userModel.count()
            console.log(usercount,"user")
            resolve(usercount)
        })
    },
    TotalProduct:()=>{
        return new Promise(async (resolve, reject) => {
            let productcount= await productModel.count() 
            resolve(productcount)
            console.log(productcount,"product")
        })
    },
    TotalOrders:()=>{
        return new Promise(async (resolve, reject) => {
            let ordercount= await orderModel.count() 
            console.log(ordercount,"orderer")
            resolve(ordercount)
        })
    },
    TotalCOD:()=>{
        return new Promise(async (resolve, reject) => {
            const totalCod = await orderModel.find({ paymentDetails
                : 'COD' }).count()
            console.log(totalCod,"cod")
            resolve(totalCod);
        })
    },
    TotalOnline: () => {
        return new Promise(async (resolve, reject) => {
            const totalOnline = await orderModel.find({ paymentDetails
                : 'online' }).count()
            console.log(totalOnline,"onl")
            resolve(totalOnline);
        })
    },
    TotalPlaced:()=>{
    
        return new Promise(async (resolve, reject) => {
            const totalPlaced = await orderModel.find({ orderStatus: 'Placed' }).count()
            console.log(totalPlaced,"plc")
            resolve(totalPlaced);
        })
    },
    TotalShipped:()=>{
    
        return new Promise(async (resolve, reject) => {
            const totalShipped = await orderModel.find({ orderStatus: 'shipped' }).count()
            console.log(totalShipped,"shp")
            resolve(totalShipped);
        })
    },
    TotalDelivered:()=>{
    
        return new Promise(async (resolve, reject) => {
            const totalDelivered = await orderModel.find({ orderStatus: 'delivered' }).count()
            console.log(totalDelivered,"dlv")
            resolve(totalDelivered);
        })
    },
    getAllDeliveredOrder:()=>{
        return new Promise(async (resolve, reject)=>{
            const totalDeliverdOrder = await orderModel.find({orderStatus:'delivered'}).sort({date:-1}).populate('user').populate('deliveryDetails').populate('orderItems.product').lean()
            resolve(totalDeliverdOrder)
        })
        
    },
    getrecentOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let recentOrders
                 = await orderModel.aggregate([
                    {
                        $match: { orderStatus: 'cancelled' }
                    },
                    {
                         $sort: {orderDate :-1 }
                     },
                     {
                        $unwind: '$orderItems'
                     },
                     {
                        $limit: 10
                     }, 
                    {
                        $project:{
                 _id:0,
            user:1,
                            'orderItems.product' : 1,
                            paymentDetails:1,
                            orderDate:1

                        } 
                    },
                    {
                        $lookup:{
                            from:'users',
                            localField:'user',
                            foreignField : '_id',
                            
                            as:'user'

                        } 
                    },
                     {
                        $lookup:{
                            from:'products',
                            localField:'orderItems.product',
                            foreignField : '_id',
                            
                            as:'product'

                        } 
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $unwind: '$user'
                    },
                    {
                        $project:{
                           'product.productname' :1,
                            'product.productimage' :1,
                            'product.productprice' : 1,
                             paymentDetails:1,
                             orderDate:1,
                             'user.name':1

                        } 
                    },


                 ])
                 
                 if (recentOrders) {
                    resolve(recentOrders)
                 } else {
                    resolve(recentOrders = 0)
                 }
            } catch (error) {
                reject(error)
            }
        })
    },
    getTodayRevenue:()=>{

        return new Promise(async (resolve, reject) => {
           try{
            let  todayrevenue = await orderModel.aggregate([
                {
                    $unwind: '$orderItems'
                },
                {
                    $match: {
                        orderDate: new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear()
                       
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$totalPrice'
                        }
                    }
                }
            ])
            
            if (todayrevenue[0]) {
                resolve(todayrevenue[0].total)
            } else {
                resolve(todayrevenue = 0)
            }
        } catch (error) {
            reject(error)
        }
    })
},
getTotalRevenue:()=>{

    return new Promise(async (resolve, reject) => {
       try{
        let  totalrevenue = await orderModel.aggregate([
            {
                $unwind: '$orderItems'
            },
            
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$totalPrice'
                    }
                }
            }
        ])
        if (totalrevenue[0]) {
            resolve(totalrevenue [0].total)
        } else {
            resolve(totalrevenue  = 0)
        }
    } catch (error) {
        reject(error)
    }
})
},

getTotalSales:()=>{

    return new Promise(async (resolve, reject) => {
       try{
        let  totalsales = await orderModel.aggregate([
            {
                $unwind: '$orderItems'
            },
           
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$orderItems.quantity'
                    }
                }
            }
        ])
        if (totalsales[0]) {
            resolve(totalsales[0].total)
        } else {
            resolve(totalsales = 0)
        }
    } catch (error) {
        reject(error)
    }
})
},
getTodaySales:()=>{

    return new Promise(async (resolve, reject) => {
       try{
        let  todaysales = await orderModel.aggregate([
            {
                $unwind: '$orderItems'
            },
            {
                $match: {
                    orderDate: new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear()
                   
                }
            },
           
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$orderItems.quantity'
                    }
                }
            }
        ])
        if (todaysales[0]) {
            resolve(todaysales [0].total)
        } else {
            resolve(todaysales  = 0)
        }
    } catch (error) {
        reject(error)
    }
})
},
getmonthlysales:()=>{

    return new Promise(async (resolve, reject) => {
       try{
        let  monthlysales = await orderModel.aggregate([
            {
                $match: {orderStatus:'cancelled'}
            },
            
            {
                $unwind: '$orderItems'
            },
           
            {
                $group: {
                    _id:{ 
                    $slice:[{
                        $split: ['$orderDate',"-"]
                    },1,1]
                },
                totalPrice
                :{$sum:"$totalPrice"} 
            }
        }
         ]);
             console.log(monthlysales,"rrr")
                              
             resolve(monthlysales)
    
    } catch (error) {
        reject(error)
    }
})
},
    
    }
    