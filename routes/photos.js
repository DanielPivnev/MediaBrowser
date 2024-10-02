"use strict";

const express = require("express");

const controllers = require("../controllers/photos");
const router = express.Router();

router.route("/:id").get(controllers.photo);
router.route("/like/:id").get(controllers.like);
router.route("/download/:id").get(controllers.download);

module.exports = router;