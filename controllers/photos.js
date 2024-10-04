"use strict";

const fs = require("fs");

const render = require("../utils/Rendering");
const Media = require("../models/Media");
const Users = require("../models/Users");

exports.photo = async (req, res) => {
    const context = {
      image: await Media.getPhotoById(req.params.id),
      name: await Media.getNamePhotoById(req.params.id),
      desc: await Media.getDescPhotoById(req.params.id),
      isLogin: false,
      isAdmin: false,
      isUser: false,
      likes: null,
      id: req.params.id,
      liked: null
    };
    
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        context.isLogin = true;

        if (await Users.isAdmin(token)) {
            context.isAdmin = true;
        } else {
            const userID = await Users.getIDByToken(token);

            context.isUser = true;
            context.likes = `${await Media.getLikesPhotoById(req.params.id)}`;
            context.liked = await Users.liked(req.params.id, userID);
        }
    }

    const html = render.renderPage(render.joinPath(__dirname, "..", "views", "photo.html"), context);
    res.send(html);
};

exports.like = async (req, res) => {
  const token = req.cookies["session-token"];
  if (token && await Users.checkLogin(token) && !await Users.isAdmin(token)) {
    const userID = await Users.getIDByToken(token);
    await Users.like(req.params.id, userID);
  }

  res.redirect(`/images/${req.params.id}`);
};

exports.save = async (req, res) => {
  const token = req.cookies["session-token"];
  if (token && await Users.checkLogin(token) && !await Users.isAdmin(token)) {
    const userID = await Users.getIDByToken(token);
    const img = await Media.getPhotoById(req.params.id);
    const filePath = render.joinPath(__dirname, "..", "public", "media", "images", img);
    const newFileName = `${Date.now()}.${img.split(".").pop()}`;
    const newFilePath = render.joinPath(__dirname, "..", "public", "media", "images", newFileName);
    fs.writeFileSync(newFilePath, fs.readFileSync(filePath));
    await Media.savePhoto(req.params.id, newFileName, userID);
  }

  res.redirect(`/images/${req.params.id}`);
};

exports.download = async (req, res) => {
  const token = req.cookies["session-token"];
  if (token && await Users.checkLogin(token) && !await Users.isAdmin(token)) {
    const fileName = await Media.getPhotoById(req.params.id);
    const fileExt = fileName.split(".").pop();
    const imageName = await Media.getPhotoNameById(req.params.id);
    const filePath = render.joinPath(__dirname, "..", "public", "media", "images", fileName);
    res.download(filePath, `${imageName}.${fileExt}`, (err) => {
      if (err) {
          console.log(err);
          res.status(500).send('Error downloading the image.');
      }
    });
  }
};