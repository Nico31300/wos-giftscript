const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db_name = path.join(__dirname, "..", "data", "vhl.db");
const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    return console.error(err.message);
  }
});

const db_all = async (query) => {
  return new Promise(function (resolve, reject) {
    db.all(query, function (err, rows) {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const getAllPlayers = async () => {
  const result = await db_all("SELECT * FROM Players ORDER BY fid");
  console.log(result);
  return result;
};

exports.getAllPlayers = getAllPlayers;
