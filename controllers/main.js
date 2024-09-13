"use strict";

require("dotenv").config();
const bcrypt = require('bcrypt');

const Folder = require("../models/Folder");
const Media = require("../models/Media");
const Users = require("../models/Users");
const crypto = require("../utils/Cryptography");
const render = require("../utils/Rendering");

exports.main = async (req, res) => {
    const context = {
      images: await Media.getPublic(),
      isLogin: false,
      isAdmin: false,
      isUser: false
    };
    
    const token = req.cookies["session-token"];
    if (token && await Users.checkLogin(token)) {
        context.isLogin = true;

        if (await Users.isAdmin(token)) {
            context.isAdmin = true;
        } else {
            context.isUser = true;
        }
    }

    const html = render.renderPage(render.joinPath(__dirname, "..", "views", "home.html"), context);
    res.send(html);
};

exports.login = async (req, res) => {
    const context = {
        error: false
    };

    const html = render.renderPage(render.joinPath(__dirname, "..", "views", "login.html"), context);
    res.send(html);
};

exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    if (await Users.exists(email) && await Users.getPassword(email)) {
        bcrypt.compare(password, await Users.getPassword(email), async (err, result) => {
            if (result) {
                const date = new Date();
                const token = crypto.genToken();
                
                date.setTime(date.getTime() + 43200000);
                await Users.logIn(token, render.dateToMySQL(date), await Users.getID(email));
                
                res.clearCookie("session-token");
                res.cookie("session-token", token, { expires: date });

                res.redirect("/");
            } else {
                const context = {
                    error: true
                };

                const html = render.renderPage(render.joinPath(__dirname, "..", "views", "login.html"), context);
                res.send(html);
            }
        });
    } else {
        const context = {
            error: true
        };

        const html = render.renderPage(render.joinPath(__dirname, "..", "views", "login.html"), context);
        res.send(html);
    }
};

exports.registration = async (req, res) => {
    const context = {
        error: false
    };

    const html = render.renderPage(render.joinPath(__dirname, "..", "views", "registration.html"), context);
    res.send(html);
};

exports.registrationPost = async (req, res) => {
    const { email, password1, password2 } = req.body;
    if (!(await Users.exists(email)) && password1 === password2) {
        bcrypt.hash(password1, +process.env.SALT_ROUNDS, async (err, hash) => {
            await Users.add(email, hash);
            await Folder.addRoot(await Users.getID(email));
        });

        res.redirect("/login");
    } else {
        const context = {
            error: true
        };

        const html = render.renderPage(render.joinPath(__dirname, "..", "views", "registration.html"), context);
        res.send(html);
    }
}