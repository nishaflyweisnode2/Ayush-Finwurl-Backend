const express = require("express");
const router = express.Router();

const auth = require("../../controllers/appController/adminController")

const authJwt = require("../../middlewares/auth");

const { profileImage } = require('../../middlewares/imageUpload');

// api/user/

router.post('/api/admin/register', auth.register);
router.post('/api/admin/login', auth.login)
router.get('/api/admin/users', [authJwt.isAdmin], auth.getAllUsers);
router.get('/api/admin/users/:userId', [authJwt.isAdmin], auth.getUserById)
router.put('/api/admin/update', [authJwt.isAdmin], auth.updateProfile);
router.put('/api/admin/upload-profile-picture', [authJwt.isAdmin], profileImage.single('image'), auth.uploadProfilePicture);
router.delete('/api/admin/users/:userId', [authJwt.isAdmin], auth.deleteUser);
router.post('/api/admin/notifications', [authJwt.isAdmin], auth.createNotification);
router.get('/api/admin/notifications/user/:userId', [authJwt.isAdmin], auth.getNotificationsForUser);
router.get('/api/admin/notifications', [authJwt.isAdmin], auth.getAllNotifications);
router.delete('/api/admin/notifications/:id', [authJwt.isAdmin], auth.deleteNotification);


module.exports = router;
