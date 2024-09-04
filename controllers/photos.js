"use strict";

const render = require("../utils/Rendering");
const Media = require("../models/Media");

exports.photo = async (req, res) => {
    const context = {
      image: await Media.getPhotoById(req.params.id)
    };

    const html = render.renderPage(render.joinPath(__dirname, "..", "views", "photo.html"), context);
    res.send(html);
};