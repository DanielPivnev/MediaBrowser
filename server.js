"use strict";

require("dotenv").config();
const express = require("express");

const render = require("./utils/Rendering");
const cookie = require("./utils/Cookie");

const server = express();
const PORT = process.env.PORT;

server.use(express.urlencoded({extended: false}));
server.use(express.json());
server.use(express.static(render.joinPath(__dirname, "public")));
server.use(cookie.parser)

server.use("/", require("./routes/main"));
server.use("/images", require("./routes/photos"));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));