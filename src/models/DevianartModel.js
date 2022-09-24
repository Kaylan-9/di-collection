const AutoModel = require('./AutoModel');

module.exports = new (class DeviantartModel extends AutoModel {
  constructor(){
    const lPage = (search) => `https://www.deviantart.com/${search}/gallery`;
    const lTitle = '/'+'/*[@id="content-container"]/div[2]/div[1]/div/div/h1/a/span[1]';
    const lGaleria = 'section > a[data-hook="deviation_link"]';
    const lURLImg = '/'+'/*[@id="root"]/main/div/div[1]/div[1]/div/div[2]/div[1]/div/img';
    const pattern_img = (flag_img) => `https://www.deviantart.com/${flag_img}/art/`;
    const exist_blocking = "text='Mature Content'";
    super(lPage, lTitle, lGaleria, lURLImg, pattern_img, exist_blocking);
  }
})();