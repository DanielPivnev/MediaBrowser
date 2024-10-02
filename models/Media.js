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

    static async getTags() {
        const sql = `
            SELECT name, id FROM tags;
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


    static async getFolder(folder_id) {
        const sql = `
            SELECT media, id FROM media INNER JOIN folder_media ON id = media_id WHERE folder_id=${folder_id};
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
    
    static async getPhotoNameById(id) {
        const sql = `
            SELECT name FROM media WHERE id=${id};
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            // const result = [];
            // rows.forEach(data => {
            //     result.push(data.media);
            // });

            if (rows.length > 0) {
                return rows[0].name;
            } 
        } catch (error) {
            console.log(error)
        }
    }
    
    static async getLikesPhotoById(id) {
        const sql = `
            SELECT * FROM likes WHERE media_id=${id};
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            // const result = [];
            // rows.forEach(data => {
            //     result.push(data.media);
            // });

            return rows.length;
            // console.log(rows)
        } catch (error) {
            console.log(error)
        }
    }

    static async addPhoto(userID, folderID, name, desc, tags, path, isPublic) {
        const sqlAddImage = `
            INSERT INTO media (media, description, public, user_id, name) VALUES ('${path}', '${desc}', ${isPublic}, ${userID}, '${name}');
        `;
        const sqlGetPhotoID = `
            SELECT id FROM media WHERE media='${path}';
        `
        
        try {
            await db.execute(sqlAddImage);
            
            const [rows, columns] = await db.execute(sqlGetPhotoID);
            const photoID = rows[0].id;
            const sqlAddToFolder = `
                INSERT INTO folder_media (folder_id, media_id) VALUES (${folderID}, ${photoID});
            `
            await db.execute(sqlAddToFolder);
            
            tags.forEach(async (tag) => {
                const sqlAddTag = `
                    INSERT INTO tag_media (tag_id, media_id) VALUES (${tag}, ${photoID});
                `;

                await db.execute(sqlAddTag);
            });
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Media;