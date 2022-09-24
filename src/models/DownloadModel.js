const https = require('https');
const { createWriteStream } = require('fs');

module.exports = new (class DownloadModel {
  async forURL(url_image, dir_file) {
    let local_file = createWriteStream(dir_file);
    https.get(url_image, (res) => {
      res.pipe(local_file);
      local_file.on('finish', () => local_file.close());
    });
  }
})();