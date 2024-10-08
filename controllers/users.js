"use strict";

require("dotenv").config();
const bcrypt = require('bcrypt');
const fs = require("fs");

const parser = require("../utils/Cookie");
const render = require("../utils/Rendering");
const Folder = require("../models/Folder");
const Media = require("../models/Media");
const Users = require("../models/Users");

exports.store = async (req, res) => {
    const context = {
      isLogin: false,
      isAdmin: false,
      isUser: false,
      folders: [],
      images: [],
      tags: [],
      path: [],
      pathSTR: "",
      id: null
    };
    
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        context.isLogin = true;
        const userID = await Users.getIDByToken(token);
        
        if (req.query.path) {
            context.path = parser.pathParser(req.query.path);
        } else {
            const rootID = await Folder.getRootID(userID);
            context.path = [{name: "root", id: rootID, toPath: `root;${rootID}`}];
        }
        context.pathSTR = parser.pathToStrParser(context.path);

        context.tags = await Media.getTags();

        if (await Users.isAdmin(token)) {
            context.isAdmin = true;
        } else {
            context.isUser = true;

            if (req.query.id) {
                context.folders = await Folder.getFoldersByParentID(+req.query.id, userID);
                context.id = req.query.id;
            } else {
                const rootID = await Folder.getRootID(userID);
                context.folders = await Folder.getFoldersByParentID(rootID, userID);
                context.id = rootID;
            }
            context.images = await Media.getFolder(context.id);
        }
    }
  
    const html = render.renderPage(render.joinPath(__dirname, "..", "views", "directories.html"), context);
    res.send(html);
}

exports.addFolder = async (req, res) => {
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        let userID;
        const { parentID, name } = req.body;

        if (await Users.isAdmin(token)) {
            // context.isAdmin = true;
        } else {
            userID = await Users.getIDByToken(token);
            await Folder.addFolder(name, +parentID, userID)
        }
    }
    if (req.params.id && req.params.path) {
        res.redirect(`/users/store?id=${req.params.id}&path=${req.params.path}`);
    } else {
        res.redirect("/users/store");
    }
}

exports.editImage = async (req, res) => {
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        let userID;
        const { isPublic, name, desc, tags, id } = req.body;

        if (await Users.isAdmin(token)) {
            // context.isAdmin = true;
        } else {
            await Media.editPhoto(isPublic, name, id, tags, desc);
        }
    }
    if (req.params.id && req.params.path) {
        res.redirect(`/users/store?id=${req.params.id}&path=${req.params.path}`);
    } else {
        res.redirect("/users/store");
    }
}

exports.deleteImage = async (req, res) => {
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {

        if (await Users.isAdmin(token)) {
            // context.isAdmin = true;
        } else {
            await Media.delete(req.params.id);
        }
    }
    if (req.params.id && req.params.path) {
        res.redirect(`/users/store?id=${req.params.id}&path=${req.params.path}`);
    } else {
        res.redirect("/users/store");
    }
}

exports.uploadImage = async (req, res) => {
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        let userID;
        const chunks = [];        

        if (await Users.isAdmin(token)) {
            // context.isAdmin = true;
        } else {
            userID = await Users.getIDByToken(token);
        
            req.on("data", chunk => {
                chunks.push(chunk);
            }).on("end", async () => {
                const fileData = Buffer.concat(chunks);
                const boundary = req.headers["content-type"].split("; ")[1].replace("boundary=", "");
                const parts = render.splitBuffer(fileData, Buffer.from(`--${boundary}`));
            
                let formData = {};
                let fileBuffer = null;
                
                parts.forEach(part => {

                    if (part.length === 0 || part.includes(Buffer.from("Content-Disposition")) === false) {
                        return;
                    }

                    let headerEnd = part.indexOf("\r\n\r\n");
                    if (headerEnd === -1) return;

                    let heads = part.slice(0, headerEnd).toString();
                    let content = part.slice(headerEnd + 4); 
                    const headers = {};
                    heads = heads.replaceAll("\r\nContent-Disposition: form-data; ", "").replaceAll('"', '');
                    heads.split("; ").forEach(h => {
                        const [k, v] = h.split("=");
                        headers[k] = v;
                    });
            
                    if (headers.name === "file") {
                        fileBuffer = content
                    } else {
                        formData[headers.name] = content.toString().trim();
                    }
                });
                const fileName = `${Date.now()}.${formData.format}`;
                const filePath = render.joinPath(__dirname, "..", "public", "media", "images", fileName);
                fs.writeFileSync(filePath, fileBuffer);

                if (formData.public === "on")
                    formData.public = true;
                else
                    formData.public = false;

                await Media.addPhoto(userID, formData.folderID, formData.name, formData.desc, formData.tags.split(";"), fileName, formData.public);
            });
        }
    }
    if (req.params.id && req.params.path) {
        res.redirect(`/users/store?id=${req.params.id}&path=${req.params.path}`);
    } else {
        res.redirect("/users/store");
    }
}

exports.profile = async (req, res) => {
    const context = {
      isLogin: false,
      isAdmin: false,
      isUser: false,
      firstName: "",
      lastName: "",
      email: "",
      profileImg: ""
    };
    
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        context.isLogin = true;
        const userID = await Users.getIDByToken(token);
        
        if (await Users.isAdmin(token)) {
            context.isAdmin = true;
        } else {
            context.isUser = true;
            const data = await Users.getDataByID(userID);
            context.firstName = data.f_name;
            context.lastName = data.l_name;
            context.email = data.email;
            context.profileImg = data.profile;
        }
    }
  
    const html = render.renderPage(render.joinPath(__dirname, "..", "views", "profile.html"), context);
    res.send(html);
}

exports.editProfile = async (req, res) => {
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        let userID;
        const chunks = [];        
        
        if (await Users.isAdmin(token)) {
            // context.isAdmin = true;
        } else {
            userID = await Users.getIDByToken(token);
            
            req.on("data", chunk => {
                chunks.push(chunk);
            }).on("end", async () => {
                const fileData = Buffer.concat(chunks);
                const boundary = req.headers["content-type"].split("; ")[1].replace("boundary=", "");
                const parts = render.splitBuffer(fileData, Buffer.from(`--${boundary}`));
                
                let formData = {};
                let fileBuffer = null;
                
                parts.forEach(part => {
                    
                    if (part.length === 0 || part.includes(Buffer.from("Content-Disposition")) === false) {
                        return;
                    }
                    
                    let headerEnd = part.indexOf("\r\n\r\n");
                    if (headerEnd === -1) return;
                    
                    let heads = part.slice(0, headerEnd).toString();
                    let content = part.slice(headerEnd + 4); 
                    const headers = {};
                    heads = heads.replaceAll("\r\nContent-Disposition: form-data; ", "").replaceAll('"', '');
                    heads.split("; ").forEach(h => {
                        const [k, v] = h.split("=");
                        headers[k] = v;
                    });
                    
                    if (headers.name === "file") {
                        fileBuffer = content;
                    } else {
                        formData[headers.name] = content.toString().trim();
                    }
                });
                
                if (formData.password) {
                    bcrypt.hash(formData.password, +process.env.SALT_ROUNDS, async (err, hash) => {
                        if (formData.format.length) {
                            const fileName = `${Date.now()}.${formData.format}`;
                            const filePath = render.joinPath(__dirname, "..", "public", "media", "profile", fileName);
                            fs.writeFileSync(filePath, fileBuffer);
                            await Users.edit(formData.email, hash, formData.fNameInput, formData.lNameInput, fileName, userID)
                        } else {
                            const profileImg = await Users.getProfileByID(userID);
                            await Users.edit(formData.email, hash, formData.fNameInput, formData.lNameInput, profileImg, userID)
                        }
                    });
                } else {
                    const password = await Users.getPasswordByID(userID);
                    if (formData.format.length) {
                        const fileName = `${Date.now()}.${formData.format}`;
                        const filePath = render.joinPath(__dirname, "..", "public", "media", "profile", fileName);
                        fs.writeFileSync(filePath, fileBuffer);
                        await Users.edit(formData.email, password, formData.fNameInput, formData.lNameInput, fileName, userID)
                    } else {
                        const profileImg = await Users.getProfileByID(userID);
                        await Users.edit(formData.email, password, formData.fNameInput, formData.lNameInput, profileImg, userID)
                    }
                }

            });
        }
    }
    
    res.redirect("/users/profile");
}

exports.logout = async (req, res) => {
    res.cookie("session-token", "");
    res.redirect("/");
};