require('dotenv').config();
const cod = require('./CryptoModel');
const backup = require('./BackupFileModel');
const download = require('./DownloadModel');
const { firefox } = require('playwright'); 
const { access, constants, createWriteStream, existsSync, rmdir } = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');
const archiver = require('archiver');


module.exports = class AutoModel {
  constructor(lPage, lTitle, lGaleria, lURLImg, pattern_img, exist_blocking=false) {
    this.lPage = lPage;
    this.lTitle =  lTitle;
    this.lGaleria = lGaleria;
    this.lURLImg = lURLImg;
    this.pattern_img = pattern_img; 
    this.exist_blocking = exist_blocking;
    this.search = '';
    this.data = {};
  }

  get folderdownloads() {
    return process.env.FOLDER_DOWNLOADS;
  }

  async init() {
    const size = {width: 2560, height: 1080};
    const headless = {headless : false}; 
    this.browser = await firefox.launch(headless);
    this.page = await this.browser.newPage();
    await this.page.setViewportSize(size);
  }

  async get_URL_Imgs(search, nPages = 1) {
    this.search = search;
    this.data.pattern_img = this.pattern_img(this.search);
    await this.page.goto(this.lPage(this.search));
    await this.page.mouse.wheel(0, 1000);
    await this.page.waitForTimeout(2000);
    this.data.title = cod.cryp(await this.page.locator(this.lTitle).textContent(''));
    
    this.data.imgs = [];
    for(let i = 0; i<=(nPages-1); i++) {
      if(i>0) await this.page.click('/'+'/*[@id="sub-folder-gallery"]/div/div[3]/div/a[4]');
      let galeria = await this.page.$$(this.lGaleria);
      await Promise.all(galeria.map(async item => {
        let src = await item.getAttribute('href');
        let name = src.replace(this.data.pattern_img, String(''));
        this.data.imgs.push(cod.cryp(name));
      }));
    }
  };

  async save_Imgs() {
    access(backup.local, constants.F_OK, async err => {
      if(err) {
        await backup.write(this.search, this.data);
        console.log(`$"${this.search}" primeiro arquivo adicionado ao backup`);
      } else {
        let data = await backup.read_imgs(this.search);
        if(!data) {
          await backup.write(this.search, this.data);
          console.log(`$"${this.search}" adicionado ao arquivo de backup`);
          return;
        }
        console.log(`$"${this.search}" já foi adicionado`);
      }
    });
  }

  async waitPlease() {
    this.page.waitForTimeout(4000);
  }


  async download_URL(i,  profile_path) {
    const url_image = await this.page.locator(this.lURLImg).getAttribute('src');
    const dir_file = path.join(profile_path, i+'.jpg');
    await download.forURL(url_image, dir_file);
  }

  async download_Imgs() {
    let name_path = cod.decryp(this.data.title);
    let _path = path.join(__dirname, '..', this.folderdownloads, name_path);
    if(!existsSync(_path)) mkdir(_path);
    let profile_path = path.join(_path, name_path);
    let i = 0;
    if(!existsSync(profile_path)) mkdir(profile_path);
    while(this.data.imgs.length > i) {
      const _URL = this.data.pattern_img + cod.decryp(this.data.imgs[i]);
      await this.page.goto(_URL);
      if(this.exist_blocking) {
        const exist_blocking = await this.page.$$(this.exist_blocking);
        if(exist_blocking.length == 0) this.download_URL(i, profile_path);
      } else this.download_URL(i, profile_path);
      i++;
    }
  }

  async compress_folder() {
    let _path = path.join(__dirname, '..', process.env.FOLDER_COMPRESS);
    if(!existsSync(_path)) mkdir(_path);
    let compress = createWriteStream(path.join(_path, `${this.search}.zip`))
    let archive = archiver('zip');
    compress.on('close', async () => { 
      this.data.size = this.byte_in_mb(archive.pointer())+"mbs";
      await backup.write(this.search, this.data);
    });
    compress.on('error', (err) => {throw err});
    archive.pipe(compress);
    archive.directory(path.join(__dirname, '..', this.folderdownloads, this.search), false);
    await archive.finalize();
  }

  async browserClose() {
    await this.browser.close();
  }

  byte_in_mb(bytes) {
    return (Number(bytes)/1024)/1024;
  }
}