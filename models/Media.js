"use strict";

const db = require("../config/db");

class Media {
    static async getPublic() {
        const sql = `
            SELECT media, id FROM media WHERE public=TRUE;
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            // const result = [];
            // rows.forEach(data => {
            //     result.push(data.media);
            // });

            return rows;
        } catch (error) {
            console.log(error)
        }
    }
    
    static async getPhotoById(id) {
        const sql = `
            SELECT media FROM media WHERE id=${id};
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            // const result = [];
            // rows.forEach(data => {
            //     result.push(data.media);
            // });

            if (rows.length > 0) {
                return rows[0].media;
            } 
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Media;