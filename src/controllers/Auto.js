const auto = require('../models/DevianartModel');

module.exports = new (class Auto {
  async download_images(search) {
    await auto.init();
    console.time('pega imagens');
    await auto.getURLDownloadInstantly(search);
    console.timeEnd('pega imagens'); 
    await auto.browserClose();
  }
})();