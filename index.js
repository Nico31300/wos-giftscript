const axios = require('axios');
const crypto = require('crypto')
const hash = "tB87#kPtkxqOS2"

const md5 = (text) => {
    return crypto.createHash('md5').update(text).digest("hex");
}

const signIn = (fid) => {
    const time = new Date().getTime();
    const params = new URLSearchParams();
    params.append('sign', md5(`fid=${fid.toString()}&time=${time.toString()}${hash}`));
    params.append('fid', fid.toString());
    params.append('time', time.toString());
    axios.post('https://wos-giftcode-api.centurygame.com/api/player',
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

const sendGiftCode = (fid, giftCode) => {
    const time = new Date().getTime();
    const params = new URLSearchParams();
    params.append('sign',  md5(`cdk=${giftCode.toString()}&fid=${fid.toString()}&time=${time.toString()}${hash}`));
    params.append('fid', fid.toString());
    params.append('time', time.toString());
    params.append('cdk', giftCode.toString());

    axios.post('https://wos-giftcode-api.centurygame.com/api/gift_code',
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

signIn(36421263);
sendGiftCode(36421263, "familyday24")
