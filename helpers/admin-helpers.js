const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const adminModel = require('../models/adminModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel'); 
const bannerModel= require('../models/bannerModel') ;

module.exports={
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let email = adminData.email
            let admin = await adminModel.findOne({email})
            
            let response = {}
            if (admin) {
         if(adminData.email ===admin.email &&adminData.password === admin.password){
            console.log(admin)
            response.status=true
            response.admin=admin
            resolve(response)
         }
            } else {
                response.status = false
                resolve(response)
            }
        })
    },
    addCategory: (categoryDetails,image) => {
        return new Promise(async (resolve, reject) => {
            let categoryimage=image
            let {categoryname,categorydescription} = categoryDetails
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
                newCategory.save().then((data)=>{
                    console.log(data)
                    status.data=data
                    resolve(status)
                })
            }
        })
    },
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let categories = await categoryModel.find({}).lean()
            resolve(categories) 
        })
    },
    deleteCategory:(id)=>{
        return new Promise((resolve,reject)=>{
            categoryModel.findByIdAndDelete(id).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    getCategory:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let category = await categoryModel.findOne({_id:id}).lean()
            resolve(category)
        })
    },
    editCategory:(details)=>{
        return new Promise((resolve,response)=>{
            categoryModel.findByIdAndUpdate(details.id,{categoryname:details.categoryname, categorydescription:details.categorydescription}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let userdetails=await userModel.find({}).lean()
            resolve(userdetails)
        })
    },
    blockUser:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await userModel.findById(userid).lean()
            if(user.status){
                userModel.findByIdAndUpdate(userid,{status:false}).then((data)=>{
                    resolve(data)
                })
         }
         else{
            userModel.findByIdAndUpdate(userid,{status:true}).then((data)=>{
                resolve(data)
            })
         }

    })
    },
    getUsers:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let userdetails = await userModel.findOne({_id:id}).lean()
            resolve(userdetails)
        })
    },
    addProduct: (productDetails,image) => {
        return new Promise(async (resolve, reject) => {
            let productimage=image
            let {productname,productdescription,productprice,productcategory} = productDetails
            let product= await productModel.findOne({ productname })
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
                newproduct.save().then((data)=>{
                    console.log(data)
                    status.data=data
                    resolve(status)
                })
            }
        })
    },
    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await productModel.find({}).lean()
            resolve(products)
        })
    },
    deleteProduct:(id)=>{
        return new Promise(async(resolve,reject)=>{
            productModel.findByIdAndDelete(id).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    getProduct:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await productModel.findById(id).lean()
            resolve(product)
        })

    },
    editProduct:(details,images)=>{
        return new Promise(async(resolve,reject)=>{
            console.log("id",details)
            productModel.findByIdAndUpdate((details.id),{productname:details.productname,productdescription:details.productdescription,productimage:images,productprice:details.productprice,productcategory:details.productcategory}).then((data)=>{
               // console.log(data)
                resolve(data)
            })
        })
    },
    addBanner: (bannerDetails,image) => {
        return new Promise(async (resolve, reject) => {

            let bannerimage=image
            let {
         title,
         caption,category,
         } = bannerDetails
         console.log(bannerDetails)
            let banner= await bannerModel.findOne({ title })
            let status = {
                check: false
            }
            if (banner) {
                status.check = true
                resolve(status)
            } else {
                newbanner = new bannerModel({bannerimage,
                    title,
                    caption,
                    category,
                    
                    
                }
                )
                newbanner.save().then((data)=>{
                    console.log(data)
                    status.data=data
                    resolve(status)
                })
            }
        })
    },
    getAllBanner:()=>{
        return new Promise(async(resolve,reject)=>{
            let banners=await bannerModel.find({}).lean()
            console.log(banners)
            resolve(banners)
        })
    },
    deleteBanner:(id)=>{
        return new Promise(async(resolve,reject)=>{
            bannerModel.findByIdAndDelete(id).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    getBanner:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let banner=await bannerModel.findById(id).lean()
            resolve(banner)
        })

    },
    editBanner:(details,image)=>{
        return new Promise(async(resolve,reject)=>{
            console.log("id",details)
            bannerModel.findByIdAndUpdate((details.id),{bannerimage:image,title:details.title,caption:details.caption}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },  
}
    
