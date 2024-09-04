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
}

module.exports = Users;