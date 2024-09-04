"use strict";

const express = require("express");

const controllers = require("../controllers/photos");
const router = express.Router();

router.route("/:id").get(controllers.photo);

module.exports = router;