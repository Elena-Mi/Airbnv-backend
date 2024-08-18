const express = require('express')
const app = express();
const postRoute = require("./routes/auth.route.js");
const bookingRoute = require("./routes/booking.route.js");
const photoRoute = require("./routes/photo.route.js");
const placesRoute = require("./routes/places.route.js");

const cookieParser = require('cookie-parser');

const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.set("strictQuery", false)


const PORT =  process.env.port || 4000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));



app.use(cors({
    credentials:true,
    origin: 'https://airbnv-clone.netlify.app',
}));


mongoose
.connect(
  process.env.MONGODB_LINK
)
.then( () => console.log( 'We were connect to Mongodb'))
.catch( (err) => console.log(err)) 


app.get('/api/test', (req,res) => {
 
    res.json('test ok');
})


app.use("/api/register", authRoute);
app.use("/api/login", authRoute);
app.use("/api/profile", authRoute);
app.use("/api/logout", authRoute);
app.use("/api/upload-by-link, photoRoute);
app.use("/api/upload", photoRoute);
app.use("/api/places", placesRoute);
app.use("/api/user-places", placesRoute);
app.use("/api/places/:id", placesRoute);
app.use("/api/places", placesRoute);
app.use("/api/places", placesRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/bookings", bookingRoute);

app.listen(PORT, () => {
    console.log(` Example app  listening on port ${PORT}`)
})

