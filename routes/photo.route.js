import express from 'express';
import { photoByLink, upload } from '../controllers/photo.controller';
const router = express.Router();

router.post('/upload-by-link',photoByLink);
router.post('/upload', upload);

export default router;