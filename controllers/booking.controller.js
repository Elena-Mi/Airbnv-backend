const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const jwtSecret = 'jkjff8f7sdfsd8sjds9';


function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
      jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    });
  }

export const bookings =  async (req, res) => {
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
  };


  export const booking =  async (req, res) => {
    const userData = await getUserDataFromReq(req);
    res.json(await Booking.find({user:userData.id}).populate('place'))
  };