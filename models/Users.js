"use strict";

const db = require("../config/db");
const render = require("../utils/Rendering");

class Users {
    static async exists(email) {
        const sql = `
            SELECT * FROM users WHERE email = '${email}';
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            if (rows.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
        }
    }

    static async getPassword(email) {
        const sql = `
            SELECT users.password FROM users WHERE email = '${email}';
        `;

        try {
            const [rows, columns] = await db.execute(sql);

            return rows[0].password;
        } catch (error) {
            console.log(error)
        }
    }

    static async getID(email) {
        const sql = `
            SELECT users.id FROM users WHERE email = '${email}';
        `;

        try {
            const [rows, columns] = await db.execute(sql);

            return rows[0].id;
        } catch (error) {
            console.log(error)
        }
    }

    static async getIDByToken(token) {
        const date = new Date();
        const sql = `
            SELECT * FROM session WHERE token = '${token}' AND expires >= '${render.dateToMySQL(date)}';
        `;

        try {
            const [rows, columns] = await db.execute(sql);

            return rows[0].user_id;
        } catch (error) {
            console.log(error)
        }
    }

    static async logIn(token, date, id) {
        const sql = `
            INSERT INTO session (token, expires, user_id) VALUES ('${token}', '${date}', ${id});
        `;

        try {
            await db.execute(sql);
        } catch (error) {
            console.log(error)
        }
    }

    static async checkLogin(token) {
        const date = new Date();
        const sql = `
            SELECT * FROM session WHERE token = '${token}' AND expires >= '${render.dateToMySQL(date)}';
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            
            if (rows.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
        }
    }

    static async isAdmin(token) {
        const sql = `
            SELECT * FROM admins WHERE user_id = (SELECT id FROM session WHERE token = '${token}');
        `;

        try {
            const [rows, columns] = await db.execute(sql);
            
            if (rows.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
        }
    }

    static async add(email, password) {
        const sql = `
            INSERT INTO users (users.email, users.password) VALUES ('${email}', '${password}');
        `;

        try {
            await db.execute(sql);
        } catch (error) {
            console.log(error)
        }
    }
    
    static async like(mediaID, userID) {
        const sqlLook = `
            SELECT * FROM likes WHERE media_id=${mediaID} AND user_id=${userID};
        `;
        const sqlAdd = `
            INSERT INTO likes (media_id, user_id) VALUES (${mediaID}, ${userID});
        `;
        const sqlRemove = `
            DELETE FROM likes WHERE (media_id = ${mediaID}) and (user_id = ${userID});
        `;

        try {
            const [rows, columns] = await db.execute(sqlLook);

            if (rows.length > 0) 
                await db.execute(sqlRemove);
            else 
                await db.execute(sqlAdd);
        } catch (error) {
            console.log(error)
        }
    }
    
    static async liked(mediaID, userID) {
        const sqlLook = `
            SELECT * FROM likes WHERE media_id=${mediaID} AND user_id=${userID};
        `;

        try {
            const [rows, columns] = await db.execute(sqlLook);

            if (rows.length > 0) 
                return "like";
            else 
                return "no-like";
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Users;