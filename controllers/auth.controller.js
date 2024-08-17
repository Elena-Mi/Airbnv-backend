const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'jkjff8f7sdfsd8sjds9';


export const register =  async (req,res) => {
    const {name,email,password } = req.body;
  
    try {
        const userDoc =  await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        })
        res.json({userDoc});
    } catch (e) {
        res.status(422).json(e)
    }
  
};


export const login =  async (req,res) => {
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
  };

  export const profile =  (req, res) => {
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
    
  }
  
  export const logout =  (req, res) => {
    res.cookie('token', '').json(true)
  
  }
 