const express = require('express')
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Place = require('./models/Place');
const Booking = require('./models/Booking');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer= require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.set("strictQuery", false)

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'jkjff8f7sdfsd8sjds9';

const PORT =  process.env.port || 4000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));



app.use(cors({
    credentials:true,
    origin: 'https://airbnv-clone.netlify.app',
    methods: ["GET", "POST", "PUT", "DELETE"],
}));


mongoose
.connect(
  process.env.MONGODB_LINK
)
.then( () => console.log( 'We were connect to Mongodb'))
.catch( (err) => console.log(err)) 


function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

app.get('/api/test', (req,res) => {
 
    res.json('test ok');
})



app.post('/api/register', async (req,res) => {
    const {name,email,password } = req.body;
  
    try {
        const userDoc =  await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        })
        res.json({userDoc});
    } catch(e) {
        res.status(422).json(e)
    }
  
});


app.post('/api/login', async (req,res) => {
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign({
          email:userDoc.email,
          id:userDoc._id
        }, jwtSecret, {}, (err,token) => {
          if (err) throw err;
          res.cookie('token', token).json(userDoc);
        });
      } else {
        res.status(422).json('pass not ok');
      }
    } else {
      res.json('not found');
    }
  });



app.get('/api/profile', (req, res) => {
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);
      res.json({name,email,_id});
    });
  } else {
    res.json(null)
  }
  
})



app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json(true)
  
  })


  app.post('/api/upload-by-link', async (req, res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
      url: link,
      dest: __dirname + '/uploads/' + newName,
    });
    res.json(newName)
  })


  const photosMiddleware = multer({dest:'uploads/'});

  app.post('/api/upload', photosMiddleware.array('photos', 100), async (req,res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const {path,originalname} = req.files[i];
    const parts = originalname.split('.');
    const ext = parts[parts.length -1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace('uploads/', ''));
  }
  res.json(uploadedFiles);
});



app.post('/api/places', (req,res) => {
    const {token} = req.cookies;
    const {
      title,address,addedPhotos,description,price,
      perks,extraInfo,checkIn,checkOut,maxGuests,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const placeDoc = await Place.create({
        owner:userData.id,price,
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,
      });
      res.json(placeDoc);
    });
  });
  


app.get('/api/user-places', cors(), (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const {id} = userData;
        res.json( await Place.find({owner:id}))
    });
})



app.get('/api/places/:id', cors(), async (req,res) => {
    const {id} = req.params;
    res.json(await Place.findById(id));
 })
  



app.put('/api/places', cors(), async (req,res) => {
  const {token} = req.cookies;
  const {
    id,title,address,addedPhotos,description,perks,
    extraInfo,checkIn,checkOut,maxGuests,price
  } = req.body;

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);

    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price,
      });
      await placeDoc.save();
      res.json('ok');
    }

  })
})


app.get('/api/places', cors(), async (req,res) => {
  res.json( await Place.find());
})



app.post('/api/bookings', cors(), async (req, res) => {
  const userData = await getUserDataFromReq(req);
  const {
    place, checkIn, checkOut, 
    numberOfGuests, name, 
    phone, price
  } = req.body;
  Booking.create({
    place, checkIn, checkOut, numberOfGuests, 
    name, phone, price, 
    user: userData.id,
  }).then((doc) => {
    res.json(doc);
  }).catch((err) => {
    throw err;
  });
});



app.get('/api/bookings', cors(), async (req, res) => {
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({user:userData.id}).populate('place'))
})


app.listen(PORT, () => {
    console.log(` Example app  listening on port ${PORT}`)
})
