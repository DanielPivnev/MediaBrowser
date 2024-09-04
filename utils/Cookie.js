"use strict";

exports.parser = (req, res, next) => {
    const cookieHeader = req.headers.cookie;

    req.cookies = {};

    if (cookieHeader) {
        const cookies = cookieHeader.split("; ");

        cookies.forEach(cookie => {
            const [name, value] = cookie.split("=");
            req.cookies[name] = decodeURIComponent(value);
        });
    }

    next();
}