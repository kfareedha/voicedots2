var  express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const User = require('../models/userModel');
const userHelpers = require('../helpers/user-helpers')
const auth = require('../helpers/auth')
const adminHelpers = require('../helpers/admin-helpers')
const Products = require('../models/productModel');
const banners = require('../models/bannerModel');
const address = require('../models/addressModel')
const cartModel = require('../models/cartModel');
const Razorpay = require('razorpay');

const isLogin = (req, res, next) => {
  if (req.session.userloggedIn) {
      next()
  } else {
    res.redirect('/login')
  }
};

router.get('/', async (req, res, next) => {
  let session = req.session
  let products = await Products.find({}).lean()
  adminHelpers.getAllCategory().then(async (cats) => {
  let Banners = await banners.find({}).lean()
    res.render('user/user-home', { session, cats, products, Banners });
  })
  req.session.loginerr = false
});

router.get('/shop', async (req, res, next) => {
  let session = req.session
  let products = await Products.find({}).lean()
  adminHelpers.getAllCategory().then(async (cats) => {
  res.render('user/shop', { session, cats, products });
  })
  //req.session.loginerr = false
});

router.get('/shop/:category', async (req, res, next) => {
  let session = req.session
  let category =req.params.category;
  let products = await Products.find({productcategory:category}).lean()
  adminHelpers.getAllCategory().then(async (cats) => {
  res.render('user/shop', { session, cats, products });
  })
   req.session.loginerr = false
});

router.get('/login', function (req, res, next) {
  res.render('user/user-login', { loginerr: req.session.userLoginErr });
  req.session.loginerr = false  
   });


router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      let status = response.user.status;
      if (status) {
        req.session.user = response.user
        req.session.userloggedIn = true
        res.redirect('/')
      } else {
        req.session.userLoginErr = "You are blocked by admin"
        res.redirect('/login')
      }

    } else {
      req.session.userLoginErr = "Invalid user name or password"
      res.redirect('/login')
    }
  })
})
router.get('/register', function (req, res, next) {

  if (req.session.userloggedIn) {
    res.redirect('/')
  }
  else {
    session = req.session.check
    res.render('user/user-register', { session });
  }
});

router.post('/register', (req, res) => {
  auth.userCheck(req.body.email).then((status) => {
    if (status.check) {
      req.session.check = true
      res.redirect('/register')
    }
    else {
      auth.sendOtp(req.body.mobile).then((verification) => {
        req.session.mobile = req.body.mobile
        req.session.user = req.body
        res.redirect('/otp')
      })
    }
  })
})
router.post('/loginotp', (req, res) => {
  auth.checkMobile(req.body.mobile).then((status) => {
    // console.log(status)
    if (!status.check) {
      req.session.exist = true
      res.redirect('/login')
    } else {
      auth.sendOtp(req.body.mobile).then((verification => {
        req.session.exist = false
        req.session.mobile = req.body.mobile
        req.session.user = status.user
        // console.log(req.session.user);
        res.redirect('/loginotp')
      }))
    }
  })
})
router.get('/loginotp', (req, res) => {
  var mobile = req.session.mobile

  res.render('user/loginotp', { mobile })
})

router.post('/otpverify', (req, res) => {
  auth.verifyOtp(req.body.otp, req.body.mobile).then((check) => {
    if (check === 'approved') {
      req.session.otpcheck = true
      req.session.userloggedIn = true

      res.redirect('/')
    } else {

      res.redirect('/loginotp')
    }
  })
})
router.get('/otp', ((req, res) => {
  var mobile = req.session.mobile


  res.render('user/registerotp', { mobile })
}))

router.post('/otp', ((req, res) => {
  auth.verifyOtp(req.body.otp, req.body.mobile).then((check) => {
    if (check === 'approved') {

      userHelpers.userSave(req.session.user).then((data) => {
        req.session.user = data
        req.session.loggedIn = true
        req.session.userloggedIn = true
        res.redirect('/')
      })
    } else {

      res.redirect('/otp')
    }
  })

}))

router.get('/profile',isLogin, (req, res) => {
  let session = req.session
  
    let userdata = req.session.user

    res.render('user/userprofile', { userdata, session })
  
})
router.get('/update-profile',isLogin, (req, res) => {
  let session = req.session
  
    let userdata = req.session.user
    res.render('user/update-profile', { userdata, session })
  

})

router.post('/update-profile',isLogin, (req, res) => {
  userHelpers.updateProfile(req.body).then((response) => {
    res.redirect('/logout')
  })
})



router.get('/view-detail/:id',isLogin, async (req, res) => {

  let session = req.session
  let product = await adminHelpers.getProduct(req.params.id)
  // console.log(product)
  let cats = await adminHelpers.getAllCategory()
  // console.log(cats);
  let products = await Products.find({}).lean()
  res.render('user/product-view', { session, product, cats, products })




})


router.post('/addToCart/:id', isLogin, (req, res) => {
  let userId = req.session.user._id;
  let proId = req.params.id;
  userHelpers.addToCart(userId, proId).then(response => {
    // console.log(response,"cart")
    res.json({ response })
  })

})

router.get('/cart', isLogin, async (req, res) => {
  let session = req.session
  let cats = await adminHelpers.getAllCategory()
  req.session.coupon=null
  req.session.discount-null
  // console.log(cats);
  userHelpers.getCartProducts(req.session.user._id).then((response) => {
     if (response) {
      let cart = response.cart
      res.render('user/cart', { user: true, cart, session, response,cats })
     } else {
       res.render('user/cart', { user: true, session, response,cats })
     }
    // res.send("cart")
  }) 

})

router.get('/cartCount', (req, res) => {
  userHelpers.cartCount(req.session.user._id).then((response) => {
    res.json({ response })
  })
})
router.get('/wishlistCount', (req, res) => {
  userHelpers.wishlistCount(req.session.user._id).then((response) => {
    res.json({ response })
  })
})
router.post('/quantityPlus/:id', isLogin, (req, res) => {
  userHelpers.quantityPlus(req.params.id, req.session.user._id).then((response) => {
    res.json({ response })
  })
})

router.post('/quantityMinus/:id', isLogin, (req, res) => {
  userHelpers.quantityMinus(req.params.id, req.session.user._id).then((response) => {
    res.json({ response })
  })
})

router.post('/deleteFromCart/:id', isLogin, (req, res) => {
  userHelpers.deleteFromCart(req.session.user._id, req.params.id).then((response) => {
    res.json({ response })
  })
})
router.post('/addTowishList/:id', isLogin, (req, res) => {
  userHelpers.addToWishList(req.session.user._id, req.params.id).then((response) => {
    console.log(response)
    res.json({ response })
  })
})
router.get('/wishlist', isLogin, (req, res) => {
  let session = req.session
  userHelpers.wishlistProducts(req.session.user._id).then((response) => {
    if (response.notEmpty) {
      let wishListItems = response.products.wishListItems
      res.render('user/wishlist', { user: true, session, response, wishListItems })
    } else {
      res.render('user/wishlist', { user: true, session, response })
    }
  })
})
router.get('/checkWishlist/:id', isLogin, (req, res) => {
  userHelpers.checkWishlist(req.session.user._id, req.params.id).then((wishlist) => {
    res.json({ wishlist })
  })
})
router.post('/removeWishListItem/:id', isLogin, (req, res) => {
  userHelpers.removeWishlistItem(req.session.user._id, req.params.id).then((response) => {
    res.json({ response})
  })
})
router.get("/checkout", isLogin, (req, res) => {
  const userId = req.session.user._id;
  let session = req.session
  userHelpers.getAddress(userId).then((address) => {
    userHelpers.getCartProducts(userId).then((response) => {
      let cartProducts = response.cart
      if(req.session.discount){
        cartProducts.discount = req.session.discount
      }
      console.log(cartProducts,"checkout")
      userHelpers.cartTotal(cartProducts).then((response) => {
        console.log(response,"checki")
        res.render("user/checkout", { user: true, session, cartProducts, address ,response});
      })
    })
  })
})


router.get('/address', isLogin, (req, res) => {
  let session = req.session
  let userId= req.session.user._id;
  console.log('yttfy',userId)
  userHelpers.getAddress(userId).then((address) => {
    console.log(address,"abcdef")
    res.render("user/address", { layout:'homelayout',user: true, address, session })
  })
})
router.get('/add-address', isLogin, (req, res) => {
  let session = req.session
  let userId= req.session.user._id;
  console.log('yttfy',userId)
  userHelpers.getAddress(userId).then((address) => {
    res.render("user/add-address", { layout:'homelayout',user: true, address, session })
  })
})

router.post('/add-address', isLogin, (req, res) => {
  const userId = req.session.user._id;
  userHelpers.addAddress(req.body, userId).then((address) => {
    res.redirect('/profile')
  })
})
    
router.post('/placeorder',isLogin,(req,res)=>{
  userId = req.session.user._id;
  orderDetails = req.body
  if(req.session.coupon){
    orderDetails.discount = req.session.discount
  }
  userHelpers.PlaceOrder(orderDetails,userId).then((order)=>{
    console.log(order,"PlaceOrder")
    if(order.paymentDetails === 'COD'){
      console.log("cod")
      res.json({order})
    }else{
      userHelpers.generateRazorPay(order).then((data)=>{
        res.json({data})
      })
    }
  })
})    
router.post('/verifyPayment',isLogin, (req, res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changeOrderStatus(req.body,req.session.user._id).then(()=>{
      res.json({status: true});
    })
  })
})  
router.get('/orderSuccess/:id',isLogin,(req,res)=>{
  let session = req.session
  console.log(req.params.id)
  userHelpers.getOrder(req.params.id).then((order)=>{
    console.log(order,"order")
    res.render('user/order',{order,user:true,session})
  })
})

  

router.post('/applyCoupon',isLogin,(req,res)=>{
  userHelpers.applyCoupon(req.body,req.session.user._id).then((response)=>{
    console.log(response,"res")
    if(response.status){
      console.log(response.coupon,"copon")
      req.session.coupon = response.coupon
      req.session.discount = response.discount
    }
    res.json({ response })  
  })
})
router.get('/myOrder', isLogin, async (req, res) => {
  let session = req.session
  let cats = await adminHelpers.getAllCategory()
  
  userHelpers.getUserOrders(req.session.user._id).then((response) => {
    console.log((response),"orderjs")
     if (response) {
      let orders = response
      console.log(orders,"orderjs22")
      res.render('user/myOrder', { user: true, orders, session, response,cats })
     } else {
       res.render('user/myOrder', { user: true, session, response,cats })
     }
    
  }) 

})
router.get('/cancel-order/:id',isLogin, (req, res) => {
 
  let orderId = req.params.id;
   userHelpers.cancelOrder(orderId).then((response) => {
     res.redirect('/myOrder')
   })
 })
 router.get('/single-order/:id',isLogin, (req, res) => {
  let session = req.session
  let orderId = req.params.id;
  userHelpers.getOrder(req.params.id).then((order)=>{
    console.log(order,"order")
    res.render('user/single-order',{order,user:true,session})
  })
 })

router.get('/logout',isLogin, (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

module.exports = router;

