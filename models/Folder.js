"use strict";

const db = require("../config/db");

class Folder {
    static async addRoot(userID) {
        const sql = `
            INSERT INTO folder (name, user_id) VALUES ('root', ${userID});
        `;

        try {
            await db.execute(sql);
        } catch (error) {
            console.log(error)
        }
    }

    static async addFolder(name, parentID, userID) {
        const sql = `
            INSERT INTO folder (name, user_id, parent_id) VALUES ('${name}', ${userID}, ${parentID});
        `;

        try {
            await db.execute(sql); 
        } catch (error) {
            console.log(error)
        }
    }
    
    static async getRootID(userID) {
        const sql = `
            SELECT id FROM folder WHERE name='root' AND user_id=${userID};
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            // const result = [];
            // rows.forEach(data => {
            //     result.push(data.media);
            // });

            return rows[0].id;
        } catch (error) {
            console.log(error)
        }
    }
    
    static async getFoldersByParentID(parentID, userID) {
        const sql = `
            SELECT id, name FROM folder WHERE parent_id=${parentID} AND user_id=${userID};
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
}

module.exports = Folder;