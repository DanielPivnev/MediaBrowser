"use strict";

const express = require("express");

const controllers = require("../controllers/users");
const router = express.Router();

router.route("/store").get(controllers.store);
router.route("/store/add-folder").post(controllers.addFolder);
router.route("/store/uploadImage").post(controllers.uploadImage);
router.route("/store/editImage").post(controllers.editImage);
router.route("/store/deleteImage/:id").get(controllers.deleteImage);
router.route("/profile").get(controllers.profile).post(controllers.editProfile);
router.route("/profile/logout").get(controllers.logout);

module.exports = router;