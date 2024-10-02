"use strict";

const fs = require("fs");

const handleIfElse = (template, data) => {
    const ifElseRegex = /\{\% if (\w+) \%\}([\s\S]*?)(\{\% else \%\}([\s\S]*?))?\{\% endif \%\}/g;

    return template.replace(ifElseRegex, (match, condition, trueBlock, elseMatch, falseBlock) => {
        const conditionResult = data[condition];
        
        return conditionResult ? trueBlock : (falseBlock || '');
    });
}

exports.dateToMySQL = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

exports.joinPath = (...parts) => {
    const filteredParts = parts.filter(Boolean);
    const path = filteredParts.map(part => part.replace(/\/+$/, "")).join("/");

    return path.replace(/\/{2,}/g, "/");
}

exports.renderPage = (templatePath, data) => {
    let template = fs.readFileSync(templatePath, "utf8");
    
    template = template.replace(/\{\% forEach (\w+) \%\}([\s\S]*?)\{\% endforEach \%\}/g, (match, arrayName, loopBlock) => {
        const items = data[arrayName];
        if (Array.isArray(items)) {
            return items.map(item => {
                let itemBlock = loopBlock;
                
                itemBlock = itemBlock.replace(/\{\?(\w+)\?\}/g, (match, variable) => {
                    return item[variable] || "";
                });
                itemBlock = handleIfElse(itemBlock, item);

                return itemBlock;
            }).join("");
        }
        return "";
    });

    template = handleIfElse(template, data);

    template = template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        return data[variable] || "";
    });

    return template;
}


exports.splitBuffer = (buffer, separator) => {
    let parts = [];
    let start = 0;
    let index;
  
    while ((index = buffer.indexOf(separator, start)) !== -1) {
      parts.push(buffer.slice(start, index));
      start = index + separator.length;
    }
  
    parts.push(buffer.slice(start));
    return parts;
}