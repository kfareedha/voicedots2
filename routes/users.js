var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const User = require('../models/userModel');
const userHelpers = require('../helpers/user-helpers')
const auth = require('../helpers/auth')
const adminHelpers = require('../helpers/admin-helpers')
const Products = require('../models/productModel');
const banners = require('../models/bannerModel');


const isLogin = (req, res, next) => {
  if (req.session.userloggedIn) {
    console.log('session ok')
    next()


  } else {
    res.redirect('/login')
  }

}
router.get('/', async (req, res, next) => {
  let session = req.session
  console.log(session)
  let products = await Products.find({}).lean()


  adminHelpers.getAllCategory().then(async (cats) => {
    console.log(cats);
    let Banners = await banners.find({}).lean()
    res.render('user/user-home', { session, cats, products, Banners });
  })
  req.session.loginerr = false
});
router.get('/shop', async (req, res, next) => {
  let session = req.session
  console.log(session)
  let products = await Products.find({}).lean()


  adminHelpers.getAllCategory().then(async (cats) => {
    console.log(cats);

    res.render('user/shop', { session, cats, products });
  })
  req.session.loginerr = false
});
router.get('/shop/:category', async (req, res, next) => {
  let session = req.session
  console.log(session)
  let category=req.params.category;
  let products = await Products.find({productcategory:category}).lean()
   
  adminHelpers.getAllCategory().then(async (cats) => {
    console.log(cats);
    
    res.render('user/shop', { session, cats, products });
  
})
 
  req.session.loginerr = false
});
// let session = req.session
// let cats = await adminHelpers.getAllCategory()
// console.log(cats);
// userHelpers.getCartProducts(req.session.user._id).then((response) => {
//    if (response) {
//     let cart = response.cart
//     res.render('user/cart', { user: true, cart, session, response,cats })
//    } else {
//      res.render('user/cart', { user: true, session, response,cats })
//    }

/*router.get('/', async(req, res, next)=>{
  let session=req.session
   console.log(session)
  let userData = await userHelpers.userData(session._id)
   adminHelpers.getAllCategory().then((cats)=>{
     console.log(cats);
     res.render('user/user-home',{userData,cats});
   })
   req.session.loginerr=false
 });

/*router.get('/', function(req, res, next) {
  let session = req.session
 // console.log(session);
  // res.send('home')
   res.render('user/user-home',{session});

    req.session.loginerr=false
  

});  */



router.get('/login', function (req, res, next) {

  if (req.session.userloggedIn) {

    res.redirect('/')
  } else {
    res.render('user/user-login', { loginerr: req.session.userLoginErr });
    req.session.loginerr = false
  }

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
  console.log(req.body);
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
    console.log(status)
    if (!status.check) {
      req.session.exist = true
      res.redirect('/login')
    } else {
      auth.sendOtp(req.body.mobile).then((verification => {
        req.session.exist = false
        req.session.mobile = req.body.mobile
        req.session.user = status.user
        console.log(req.session.user);
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

router.get('/profile', (req, res) => {
  let session = req.session
  if (req.session.userloggedIn) {
    let userdata = req.session.user
    console.log(userdata)
    res.render('user/userprofile', { userdata, session })
  } else {

    res.redirect('/');

  }
})
router.get('/update-profile', (req, res) => {
  let session = req.session
  if (req.session.userloggedIn) {
    let userdata = req.session.user
    res.render('user/update-profile', { userdata, session })
  } else {

    res.redirect('/');
  }

})

router.post('/update-profile', (req, res) => {
  userHelpers.updateProfile(req.body).then((response) => {
    res.redirect('/logout')
  })
})

/*router.get('/view-detail/:id',async(req,res)=>{
   let session=req.session
   console.log(session)
   let product=await adminHelpers.getProduct(req.params.id)
   console.log(product)
   let cats=await adminHelpers.getAllCategory()
     console.log(cats);
     res.render('user/product-view',{layout:'productviewlayout',session,product,cats})
   
   })*/

router.get('/view-detail/:id', async (req, res) => {

  let session = req.session
  let product = await adminHelpers.getProduct(req.params.id)
  console.log(product)
  let cats = await adminHelpers.getAllCategory()
  console.log(cats);
  let products = await Products.find({}).lean()
  res.render('user/product-view', { session, product, cats, products })




})


router.post('/addToCart/:id', isLogin, (req, res) => {
  let userId = req.session.user._id;
  let proId = req.params.id;
  userHelpers.addToCart(userId, proId).then(response => {
    console.log(response,"cart")
    res.json({ response })
  })

})

router.get('/cart', isLogin, async (req, res) => {
  let session = req.session
  let cats = await adminHelpers.getAllCategory()
  console.log(cats);
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



router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

module.exports = router;

