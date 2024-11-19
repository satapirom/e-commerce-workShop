const express = require('express');
const router = express.Router();
const { create, list, remove } = require('../controllers/catagory'); // ตรวจสอบว่าเส้นทางและชื่อไฟล์ถูกต้อง

router.post('/catagory', create)
router.get('/catagory', list)
router.delete('/catagory/:id', remove)


module.exports = router;