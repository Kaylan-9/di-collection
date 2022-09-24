const auto = require('../models/DevianartModel');

module.exports = new (class Auto {
  async download_images(search) {
    await auto.init();
    console.time('pega imagens');
    await auto.get_URL_Imgs(search, 2);
    console.timeEnd('pega imagens');
    console.time('salva imagens');
    await auto.save_Imgs();
    console.timeEnd('salva imagens');
    console.time('download imagens');
    await auto.download_Imgs();
    console.timeEnd('download imagens');
    console.time('compress imagens');
    await auto.compress_folder();
    console.timeEnd('compress imagens');
    await auto.browserClose();
  }
})();