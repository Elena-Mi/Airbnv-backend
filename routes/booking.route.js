import express from 'express';
import { booking, bookings } from '../controllers/booking.controller';
const router = express.Router();

router.post('/bookings', bookings);
router.get('/bookings', booking);

export default router;