"use strict";

const db = require("../config/db");
const Folder = require("./Folder");

class Media {
    static async getPublic() {
        const sql = `
            SELECT media, id, name, description, tag_id FROM media LEFT JOIN tag_media ON id = media_id WHERE public=TRUE;
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            // console.log(rows)
            const result = {};

            rows.forEach(img => {
                if (result[img.id] && img.tag_id) {
                    result[img.id].tags.push(img.tag_id);
                } else {
                    result[img.id] = {};
                    result[img.id].media = img.media;
                    result[img.id].name = img.name;
                    result[img.id].id = img.id;
                    result[img.id].description = img.description;
                    if (img.tag_id)
                        result[img.id].tags = [img.tag_id];
                    else
                        result[img.id].tags = [];
                }
            });
            // console.log(Object.values(result))

            // rows = ;

            return Object.values(result);
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

    static async getPhotoTags(id) {
        const sql = `
            SELECT tag_id FROM tag_media WHERE media_id=${id};
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            if (rows.length) {
                const result = [];
                rows.forEach(data => {
                    result.push(data.tag_id);
                });
    
                return result;
            } else {
                return [];
            }
        } catch (error) {
            console.log(error)
        }
    }


    static async getFolder(folder_id) {
        const sql = `
            SELECT media, id, description, name, tag_id, public FROM media INNER JOIN folder_media ON media.id = folder_media.media_id LEFT JOIN tag_media ON media.id = tag_media.media_id WHERE folder_media.folder_id=${folder_id};
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            const result = {};

            rows.forEach(img => {
                if (result[img.id] && img.tag_id) {
                    if (result[img.id].tagsID.length)
                        result[img.id].tagsID = result[img.id].tagsID + ";" + img.tag_id;
                    else
                        result[img.id].tagsID = "" + img.tag_id;
                } else {
                    result[img.id] = {};
                    result[img.id].media = img.media;
                    result[img.id].name = img.name;
                    result[img.id].id = img.id;
                    result[img.id].description = img.description;
                    result[img.id].public = "" + img.public;
                    result[img.id].tagsID = "";
                    if (img.tag_id)
                        result[img.id].tagsID = "" + img.tag_id;
                        
                }
            });
            // console.log(Object.values(result))

            // rows = ;

            return Object.values(result);
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
    
    static async getNamePhotoById(id) {
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
    
    static async getDescPhotoById(id) {
        const sql = `
            SELECT description FROM media WHERE id=${id};
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            // const result = [];
            // rows.forEach(data => {
            //     result.push(data.media);
            // });

            if (rows.length > 0) {
                return rows[0].description;
            } 
        } catch (error) {
            console.log(error)
        }
    }
    
    static async getPhotoNameById(id) {
        const sql = `
            SELECT name FROM media WHERE id='${id}';
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

    static async savePhoto(id, newPath, userID) {
        const sqlGetPhoto = `
            SELECT * FROM media WHERE id=${id};
        `;
        
        try {
            const [rows, columns] = await db.execute(sqlGetPhoto);
            if (rows.length) {
                const img = rows[0];
                const savedID = await Folder.getSavedID(userID);
                const tags = await Media.getPhotoTags(id);

                await Media.addPhoto(userID, savedID, img.name, img.description, tags, newPath, false);
            }
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

    static async editPhoto(isPublic, name, id, tags, desc) {
        isPublic = isPublic === "on" ? 1 : 0;
        const sqlImgEdit = `
            UPDATE media SET description = '${desc}', name = '${name}', public = ${isPublic} WHERE (id = ${id});
        `;
        const sqlDeleteTags = `
            DELETE FROM tag_media WHERE (media_id = ${id});
        `;
        
        try {
            await db.execute(sqlImgEdit);
            const oldTags = await Media.getPhotoTags(id);
            if (oldTags.length) {
                await db.execute(sqlDeleteTags);
            }
            if (tags.length) {
                tags.split(";").forEach(async (tag) => {
                    const sqlAddTag = `
                        INSERT INTO tag_media (tag_id, media_id) VALUES (${tag}, ${id});
                    `;

                    await db.execute(sqlAddTag);
                });
            }
        } catch (error) {
            console.log(error)
        }
    }

    static async delete(id) {
        const sql = `
            DELETE FROM media WHERE (id = ${id});
        `;

        try {
            await db.execute(sql);
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Media;