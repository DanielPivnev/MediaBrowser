"use strict";

const express = require("express");

const controllers = require("../controllers/main");
const router = express.Router();

router.route("/").get(controllers.main);
router.route("/login").get(controllers.login).post(controllers.loginPost);
router.route("/registration").get(controllers.registration).post(controllers.registrationPost);

module.exports = router;