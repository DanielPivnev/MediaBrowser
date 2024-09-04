"use strict";

// const crypto = require("crypto");

exports.genToken = () => {
    // return crypto.randomBytes(length).toString("hex");
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 100; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters.charAt(randomIndex);
    }
    
    return token;
}