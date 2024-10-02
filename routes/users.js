"use strict";

const express = require("express");

const controllers = require("../controllers/users");
const router = express.Router();

router.route("/store").get(controllers.store);
router.route("/store/add-folder").post(controllers.addFolder);
router.route("/store/uploadImage").post(controllers.uploadImage);

module.exports = router;