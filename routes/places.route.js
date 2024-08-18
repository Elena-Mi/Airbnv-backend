import express from 'express';
import { getPlaces, places, placesId, putPlaces, userPlaces } from '../controllers/places.controller';
const router = express.Router();

router.post('/places', places);
router.get('/user-places', userPlaces);
router.get('/places/:id',placesId);
router.put('places', putPlaces);
router.get('/places', getPlaces);

export default router;
