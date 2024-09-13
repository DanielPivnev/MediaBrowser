"use strict";

const express = require("express");

const controllers = require("../controllers/users");
const router = express.Router();

router.route("/store").get(controllers.store);

module.exports = router;