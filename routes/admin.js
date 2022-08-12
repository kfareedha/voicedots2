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
router.get('/', function (req, res, next) {
  console.log(req.session.adminLoggedIn)
  if (req.session.admin) {
    res.render('admin/adminhome', { layout: 'adminlayout' });
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

router.get('/view-category', (req, res) => {
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

router.post('/add-category', multer.upload.single('categoryimage'), (req, res) => {
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

router.post('/edit-category', (req, res) => {
  adminHelpers.editCategory(req.body).then((response) => {
    res.redirect('/admin/view-category')
  })
})



router.get('/deletecategory/:id', (req, res) => {
  adminHelpers.deleteCategory(req.params.id).then((response) => {
    res.redirect('/admin/view-category')
  })
})
router.get('/view-users', (req, res) => {
  if (req.session.adminLoggedIn) {
    adminHelpers.getAllUsers().then((userdetails) => {
      res.render('admin/view-users', { userdetails })
    })
  } else {
    res.redirect(302, '/admin/adminlogin')
  }
})
router.get('/block-user/:id', (req, res) => {
  adminHelpers.blockUser(req.params.id).then((response) => {
    res.redirect('/admin/view-users')
  })
})
router.get('/view-product', (req, res) => {
  if (req.session) {
    adminHelpers.getAllProduct().then((products) => {
      res.render('admin/view-product', { products })
    })
  } else {
    res.redirect(302, '/admin/login')
  }
})

router.get('/add-product', async (req, res, next) => {
  let exist = req.session.productexist
  if (req.session.adminLoggedIn) {
    let categories = await category.find({}).lean()
    console.log(categories)

    res.render('admin/add-product', { exist, layout: 'adminlayout', categories })
  }
  else {
    res.redirect('/admin');
  }
})


router.post('/add-product', multer.upload.array('productimage', 4), (req, res) => {
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
      res.render('admin/add-product', { exist: req.session.productexist, layout: 'adminlayout' })
      // req.session.productexist=false 

    } else {
      res.redirect('/admin/view-product')
    }
  })
})


router.get('/edit-product/:id', async (req, res) => {
  if (req.session.adminLoggedIn) {

    let categories = await category.find({}).lean()
    console.log(categories)

    let product = await adminHelpers.getProduct(req.params.id)
    console.log(product)


    res.render('admin/edit-product', { product, layout: 'adminlayout', categories })
  } else {
    res.redirect('/admin')
  }
})
router.post('/edit-product', multer.upload.array('productimage', 4), (req, res) => {
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
router.get('/delete-product/:id', (req, res) => {
  adminHelpers.deleteProduct(req.params.id).then(() => {
    res.redirect('/admin/view-product')
    req.session.productexist = false
  })
})
router.get('/view-banner', (req, res) => {
  if (req.session) {
    adminHelpers.getAllBanner().then((banners) => {
      res.render('admin/view-banner', { banners })
    })
  } else {
    res.redirect(302, '/admin/login')
  }
})

router.get('/add-banner', async (req, res, next) => {
  let exist = req.session.bannerexist
  if (req.session.adminLoggedIn) {
    let categories = await category.find({}).lean()
    console.log(categories)

    res.render('admin/add-banner', { exist, layout: 'adminlayout', categories })
  }
  else {
    res.redirect('/admin');
  }
})
router.post('/add-banner', multer.upload.single('bannerimage'), (req, res) => {
  let image = req.file.filename
  console.log(image);
  adminHelpers.addBanner(req.body, image).then((response) => {
    //console.log(response)
    if (response.check) {
      req.session.bannerexist = true
      res.render('admin/add-banner', { exist: req.session.bannerexist, layout: 'adminlayout' })
      //req.session.productexist=false

    } else {
      res.redirect('/admin/view-banner')
    }
  })

})
router.get('/edit-banner/:id', async (req, res) => {
  if (req.session.adminLoggedIn) {
      
    let banner = await adminHelpers.getBanner(req.params.id)
   console.log(banner)
   let categories = await category.find({}).lean()

    res.render('admin/edit-banner', { banner, layout: 'adminlayout',categories })
  } else {
    res.redirect('/admin')
  }
})
router.post('/edit-banner', multer.upload.single('bannerimage'), (req, res) => {
  let image = req.file.filename
  adminHelpers.editBanner(req.body, image).then((response) => {
    res.redirect('/admin/view-banner')
  })
})
router.get('/delete-banner/:id', (req, res) => {
  adminHelpers.deleteBanner(req.params.id).then(() => {
    res.redirect('/admin/view-banner')
    req.session.bannerexist = false
  })
})



router.get('/adminlogout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/admin');
});
module.exports = router;
