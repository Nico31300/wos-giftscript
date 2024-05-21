const axios = require("axios");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const express = require("express");
const hash = "tB87#kPtkxqOS2";

const db_name = path.join(__dirname, "data", "vhl.db");
const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    return console.error(err.message);
  }
});

const msg = {
  40007: {
    code: 1,
    msg: "TIME ERROR.",
    err_code: 40007,
    descr: "Gift code expired.",
  },
  40014: {
    code: 1,
    msg: "CDK NOT FOUND.",
    err_code: 40014,
    descr: "Gift code does not exist.",
  },
  40009: {
    code: 1,
    msg: "RECEIVED.",
    err_code: 40007,
    descr: "Gift code already used.",
  },
  40010: {
    code: 1,
    msg: "SUCCESS",
    err_code: 40007,
    descr: "Gift code send.",
  },
};

const md5 = (text) => {
  return crypto.createHash("md5").update(text).digest("hex");
};

const signIn = async (fid) => {
  const time = new Date().getTime();
  const params = new URLSearchParams();
  params.append(
    "sign",
    md5(`fid=${fid.toString()}&time=${time.toString()}${hash}`)
  );
  params.append("fid", fid.toString());
  params.append("time", time.toString());

  const response = await axios.post(
    "https://wos-giftcode-api.centurygame.com/api/player",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return {
    "x-ratelimit-remaining": response.headers["x-ratelimit-remaining"],
    data: response.data,
  };
};

const sendGiftCode = async (fid, giftCode) => {
  const time = new Date().getTime();
  const params = new URLSearchParams();
  params.append(
    "sign",
    md5(
      `cdk=${giftCode.toString()}&fid=${fid.toString()}&time=${time.toString()}${hash}`
    )
  );
  params.append("fid", fid.toString());
  params.append("time", time.toString());
  params.append("cdk", giftCode.toString());

  return await axios.post(
    "https://wos-giftcode-api.centurygame.com/api/gift_code",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
};

const init_db = () => {
  const sql_create = `CREATE TABLE IF NOT EXISTS Players (
        fid INTEGER PRIMARY KEY,
        nickname TEXT,
        kid INTEGER,
        stove_lv INTEGER,
        stove_lv_content TEXT,
        avatar_image TEXT
      );`;
  db.run(sql_create, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });
};

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

const sendRewards = async (giftcode) => {
  const allPlayers = await db_all("SELECT * FROM Players ORDER BY fid");
  for (let index = 0; index < allPlayers.length; index++) {
    console.log(allPlayers[index].nickname);
    signIn(allPlayers[index].fid)
      .then((response) => {
        console.log(`Rate-Limit=${response["x-ratelimit-remaining"]}`);
        if (response["x-ratelimit-remaining"] > 0) {
          sendGiftCode(allPlayers[index].fid, giftcode).then((response) => {
            console.log(msg[response.data.err_code].descr);
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

const app = express();
const port = 3000;

app.get("/init-db", (req, res) => {
  init_db();
  sendRewards("familyday24");
  res.send("Hello World!");
});

app.get("/gift/:code", (req, res) => {
  var giftCode = req.params.code;
  sendRewards(giftCode);
  res.send(`Sending rewards for code ${giftCode}`);
});

app.get("/players", async (req, res) => {
  const allPlayers = await db_all("SELECT * FROM Players ORDER BY fid");
  res.send(allPlayers);
});

app.listen(port, () => {
  console.log(`Listen on port ${port}`);
});

//.then(async (response) => {
//  console.log(response);
//
//});
//});
/*
db.each("", async (err, row) => {
    
    console.log("Response:");
    console.log(signInResponse);
    
  });
  */
