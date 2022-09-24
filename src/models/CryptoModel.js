require('dotenv').config();
const {AES, enc} = require('crypto-js');


module.exports = new (class CryptoModel {
  cryp(data) {
    return AES.encrypt(data, this.info_crypto.key).toString();
  }

  decryp(data) {
    return AES.decrypt(data, this.info_crypto.key).toString(enc.Utf8);
  }

  get info_crypto() {
    return {
      key: process.env.CRYKEY
    };
  }
})();