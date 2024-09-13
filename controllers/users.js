"use strict";

const render = require("../utils/Rendering");
const Folder = require("../models/Folder");
const Users = require("../models/Users");

exports.store = async (req, res) => {
    const context = {
      isLogin: false,
      isAdmin: false,
      isUser: false,
      folders: []
    };
    
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        context.isLogin = true;
  
        if (await Users.isAdmin(token)) {
            context.isAdmin = true;
        } else {
            context.isUser = true;
            const userID = await Users.getIDByToken(token);

            if (req.query.id) {
                context.folders = await Folder.getFoldersByParentID(+req.query.id, userID);
            } else {
                context.folders = await Folder.getFoldersByParentID(await Folder.getRootID(userID), userID);
            }
        }
    }
  
    const html = render.renderPage(render.joinPath(__dirname, "..", "views", "directories.html"), context);
    res.send(html);
  }