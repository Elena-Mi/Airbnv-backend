const jwt = require('jsonwebtoken');
const jwtSecret = 'jkjff8f7sdfsd8sjds9';
const Place = require('../models/Place');


export const places = (req,res) => {
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
  };

  export const userPlaces =   (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const {id} = userData;
        res.json( await Place.find({owner:id}))
    });
}

export const placesId =  async (req,res) => {
    const {id} = req.params;
    res.json(await Place.findById(id));
 }


export const putPlaces =  async (req,res) => {
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
  };

  export const getPlaces =  async (req,res) => {
    res.json( await Place.find());
  };

  