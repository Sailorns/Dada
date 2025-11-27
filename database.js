const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'birthday.db');
const db = new sqlite3.Database(dbPath);

// Inicijaliziraj bazu podataka
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Funkcije za rad s bazom podataka
function getAllMessages() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM messages ORDER BY created_at DESC", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function addMessage(name, message) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO messages (name, message) VALUES (?, ?)", [name, message], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
}

module.exports = {
    getAllMessages,
    addMessage
};