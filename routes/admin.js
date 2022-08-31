var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
const Admin = require('../models/adminModel');
const adminHelpers = require('../helpers/admin-helpers');
const { response } = require('../app');
const multer = require('../helpers/multer')
const category = require('../models/categoryModel');
const banner = require('../models/bannerModel');


function isLogin(req, res, next) {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    console.log(req.session.adminLoggedIn + "asdfsd");
    res.redirect('admin/login')
  }
}

/* GET home page. */
router.get('/', async (req, res, next)=> {
  console.log(req.session.adminLoggedIn)
  let session=req.session.admin
  let totalproducts = await adminHelpers.TotalProduct()
  let totalUser = await adminHelpers.TotalUsers()
  let totalOrder =await adminHelpers.TotalOrders()
  let COD = await adminHelpers.TotalCOD()
  let online = await adminHelpers.TotalOnline()
  let shipped = await adminHelpers.TotalShipped()
  let delivered = await adminHelpers.TotalDelivered()
  let recentOrders = await adminHelpers. getrecentOrders()
  let todayrevenue = await adminHelpers. getTodayRevenue ()
  let totalrevenue = await adminHelpers. getTotalRevenue ()
  let todaysale = await adminHelpers. getTodaySales ()
  let totalsale = await adminHelpers. getTotalSales ()
  
  if (req.session.admin) {
    res.render('admin/adminhome', { layout: 'adminlayout',session,todaysale,totalsale,totalrevenue,todayrevenue ,recentOrders,totalproducts,totalUser,totalOrder,COD,online,shipped,delivered });
  } else {
    res.redirect('/admin/adminlogin');
    req.session.adminLoggErr = false;
  }
});
router.get('/adminlogin', function (req, res) {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin')
  }
  else {
    res.render('admin/admin-login', { adminLoginErr: req.session.adminLoginErr })
    req.session.adminLoginErr = false;
  }

})
router.post('/login', async (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      console.log(response);
      req.session.admin = response.admin
      req.session.adminLoggedIn = true
      res.redirect('/admin')
    } else {
      req.session.adminLoginErr = true;
      res.redirect('/admin/adminlogin')
    }
  })
})

router.get('/view-category',isLogin, (req, res) => {
  if (req.session.adminLoggedIn) {
    adminHelpers.getAllCategory().then((categories) => {
      res.render('admin/view-category', { categories })
    })
  } else {
    res.redirect(302, '/admin/adminlogin')
  }
})

router.get('/add-category', isLogin, (req, res) => {
  let exist = req.session.categoryexist
  res.render('admin/add-category', { exist })
})

router.post('/add-category',isLogin, multer.upload.single('categoryimage'), (req, res) => {
  let image = req.file.filename
  console.log(image);
  adminHelpers.addCategory(req.body, image).then((response) => {
    //console.log(response)
    if (response.check) {
      req.session.categoryexist = true
      res.redirect('/admin/add-category')
    } else { 
      res.redirect('/admin/view-category')
      
    }
  })

})


router.get('/editcategory/:id', isLogin, (req, res) => {
  adminHelpers.getCategory(req.params.id).then((response) => {
    res.render('admin/edit-category', { response })
  })
})

router.post('/edit-category',isLogin, (req, res) => {
  adminHelpers.editCategory(req.body).then((response) => {
    res.redirect('/admin/view-category')
  })
})



router.get('/deletecategory/:id',isLogin, (req, res) => {
  adminHelpers.deleteCategory(req.params.id).then((response) => {
    res.redirect('/admin/view-category')
  })
})
router.get('/view-users', isLogin,(req, res) => {
  if (req.session.adminLoggedIn) {
    adminHelpers.getAllUsers().then((userdetails) => {
      res.render('admin/view-users', { userdetails })
    })
  } else {
    res.redirect(302, '/admin/adminlogin')
  }
})
router.get('/block-user/:id',isLogin, (req, res) => {
  adminHelpers.blockUser(req.params.id).then((response) => {
    res.redirect('/admin/view-users')
  })
})
router.get('/view-product',isLogin, (req, res) => {
  if (req.session) {
    adminHelpers.getAllProduct().then((products) => {
      res.render('admin/view-product', { products })
    })
  } else {
    res.redirect(302, '/admin/login')
  }
})

router.get('/add-product',isLogin, async (req, res, next) => {
  let exist = req.session.productexist
  if (req.session.adminLoggedIn) {
    let categories = await category.find({}).lean()
    console.log(categories)

    res.render('admin/add-product', { exist, categories })
  }
  else {
    res.redirect('/admin');
  }
})


router.post('/add-product',isLogin, multer.upload.array('productimage', 4), (req, res) => {
  let images = []
  files = req.files
  console.log(files)
  images = files.map((value) => {
    return value.filename
  })
  console.log(images);
  adminHelpers.addProduct(req.body, images).then((response) => {

    console.log(response)
    if (response.check) {
      req.session.productexist = true
      res.render('admin/add-product', { exist: req.session.productexist})
      // req.session.productexist=false 

    } else {
      res.redirect('/admin/view-product')
    }
  })
})


router.get('/edit-product/:id',isLogin, async (req, res) => {
  if (req.session.adminLoggedIn) {

    let categories = await category.find({}).lean()
    console.log(categories)

    let product = await adminHelpers.getProduct(req.params.id)
    console.log(product)


    res.render('admin/edit-product', { product,categories })
  } else {
    res.redirect('/admin')
  }
})
router.post('/edit-product',isLogin, multer.upload.array('productimage', 4), (req, res) => {
  let images = []
  files = req.files
  console.log(files)
  console.log(files)
  images = files.map((value) => {
    return value.filename
  })
  adminHelpers.editProduct(req.body, images).then((response) => {
    res.redirect('/admin/view-product')
  })
})
router.get('/delete-product/:id',isLogin, (req, res) => {
  adminHelpers.deleteProduct(req.params.id).then(() => {
    res.redirect('/admin/view-product')
    req.session.productexist = false
  })
})
router.get('/view-banner',isLogin, (req, res) => {
  if (req.session) {
    adminHelpers.getAllBanner().then((banners) => {
      res.render('admin/view-banner', { banners })
    })
  } else {
    res.redirect(302, '/admin/login')
  }
})

router.get('/add-banner', isLogin,async (req, res, next) => {
  let exist = req.session.bannerexist
  if (req.session.adminLoggedIn) {
    let categories = await category.find({}).lean()
    console.log(categories)

    res.render('admin/add-banner', { exist, categories })
  }
  else {
    res.redirect('/admin');
  }
})
router.post('/add-banner',isLogin, multer.upload.single('bannerimage'), (req, res) => {
  let image = req.file.filename
  console.log(image);
  adminHelpers.addBanner(req.body, image).then((response) => {
    //console.log(response)
    if (response.check) {
      req.session.bannerexist = true
      res.render('admin/add-banner', { exist: req.session.bannerexist })
      //req.session.productexist=false

    } else {
      res.redirect('/admin/view-banner')
    }
  })

})
router.get('/edit-banner/:id',isLogin, async (req, res) => {
  if (req.session.adminLoggedIn) {
      
    let banner = await adminHelpers.getBanner(req.params.id)
   console.log(banner)
   let categories = await category.find({}).lean()

    res.render('admin/edit-banner', { banner,categories })
  } else {
    res.redirect('/admin')
  }
})
router.post('/edit-banner', isLogin,multer.upload.single('bannerimage'), (req, res) => {
  let image = req.file.filename
  adminHelpers.editBanner(req.body, image).then((response) => {
    res.redirect('/admin/view-banner')
  })
})
router.get('/delete-banner/:id', isLogin,(req, res) => {
  adminHelpers.deleteBanner(req.params.id).then(() => {
    res.redirect('/admin/view-banner')
    req.session.bannerexist = false
  })
})

router.get('/view-coupons',isLogin,(req,res)=>{
  adminHelpers.getcoupons().then((coupon)=>{
      res.render('admin/view-coupon',{coupon,admin:true})
  })
})
router.get('/add-coupon',isLogin,(req,res)=>{
  adminHelpers.getcoupons().then((coupon)=>{
      res.render('admin/add-coupon',{coupon,admin:true})
  })
})
router.post('/add-coupon',isLogin,(req,res)=>{
  adminHelpers.addcoupon(req.body).then((response)=>{
      res.redirect('/admin/view-coupons')
  })
})
router.get('/edit-coupon/:id',isLogin,async(req,res)=>{
  let coupon = await adminHelpers.getcoupon(req.params.id)
  console.log(coupon,"COP")
  res.render('admin/edit-coupon',{coupon,admin:true})
})
router.post('/edit-coupon', isLogin, (req, res) => {
 
  adminHelpers.editcoupon(req.body).then((response) => {
    res.redirect('/admin/view-coupons')
  })
})


router.get('/delete-coupon/:id',isLogin,(req, res) => {
  adminHelpers.deletecoupon(req.params.id).then((data) => {
    res.redirect('/admin/view-coupons')
  })
})
router.get('/view-order',isLogin, function (req, res, next) {
 
  adminHelpers.getAllUsers().then((userdetails) => {
    adminHelpers.getAllOrders().then((orderdetails) => { 
          if (req.session.adminLoggedIn) {
      res.render('admin/view-order', { userdetails,orderdetails});
      
    } else {
      res.redirect('/admin')
    }
  })
  }
  )
});

router.get('/orderstatus-shipped/:id', isLogin,(req, res) => {
  
  adminHelpers.changeOrderStatusShipped(req.params.id).then(() => {
    res.redirect('/admin/view-order')
  })
})

router.get('/orderstatus-deliverd/:id',isLogin, (req, res) => {
  
 
 adminHelpers.changeOrderStatusdelivered(req.params.id).then(() => {
   res.redirect('/admin/view-order')
 })
})

router.get('/orderstatus-arriving/:id',isLogin, (req, res) => {
  
 
 adminHelpers.changeOrderStatusarriving(req.params.id).then(() => {
   res.redirect('/admin/view-order')
 })
})

router.get('/chart1',isLogin, (req, res) => {
 adminHelpers.getmonthlysales().then(orders => {
  console.log(orders,"kkkkk")
     res.json({orders})
 })
})

router.get('/chart2',isLogin, (req, res) => {
 adminHelpers.TotalShipped().then(shipped => {
   adminHelpers.TotalDelivered().then(delivered => {
    adminHelpers.TotalPlaced().then(Placed => {
      console.log(Placed,"pppp")
      console.log(delivered,"dddd")
      console.log(shipped,"sssss")
     let orders = {
       shipped,
       delivered,
       Placed
     }
     console.log(orders);
     
     res.json({orders})
   })
  })
 })
})

router.get('/report',isLogin,async(req,res)=>{
  let deliveredOrder = await adminHelpers.getAllDeliveredOrder()
    res.render('admin/report',{deliveredOrder,admin:true})
  })

router.get('/*', function (req, res, next) {
  res.render('admin/404', { layout: 'adminerrorlayout' });
});


router.get('/adminlogout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/admin');
});
module.exports = router;
