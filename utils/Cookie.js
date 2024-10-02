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

exports.pathParser = (path) => {
    const paths = path.split(">");
    const pathDetails = [];

    paths.forEach((path, idx) => {
        const details = path.split(";");
        if(details.length === 2 && !isNaN(details[1]) && !isNaN(parseFloat(details[1])))
            pathDetails.push({
                name: details[0],
                id: +details[1],
            });
    });
    pathDetails.forEach((_, idx) => {
        pathDetails[idx].toPath = pathDetails.reduce((accumulator, currentValue, idx2) => {
            if (idx2 <= idx && idx2 > 0)
                return `${accumulator}>${currentValue.name};${currentValue.id}`;
            else 
                return accumulator;
        }, `${pathDetails[0].name};${pathDetails[0].id}`)
    });
    
    return pathDetails;
}

exports.pathToStrParser = (path) => {
    if (path.length) {
        return path.reduce((accumulator, currentValue, idx) => {
            if (idx > 0)
                return `${accumulator}>${currentValue.name};${currentValue.id}`;
            else
                return accumulator;
        }, `${path[0].name};${path[0].id}`)
    } else {
        return "";
    }
}

exports.parseImage = (data, boundary) => {
    const parts = data.split(`--${boundary}`);
    
    const imagePart = parts.find(part => part.includes('Content-Type: image'));
    const imageData = imagePart.split('\r\n\r\n')[1].split('\r\n--')[0];
  
    return Buffer.from(imageData, 'binary');
}