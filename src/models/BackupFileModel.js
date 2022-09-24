require('dotenv').config();
const { writeFile, readFile,  unlink } = require('fs/promises');


module.exports = new (class BackupFileModel {
  get local() {
    return process.env.BACKUP_LOCAL_IMGS;
  }

  async write(position, data) {
    let data_s = await this.read();
    data_s = data_s ? data_s : {};
    data_s[position] = data;
    const data_final = JSON.stringify(data_s, null, 2);
    writeFile(this.local, data_final);
  }

  async read_imgs(position) {
    const data_search = await this.read()[position];
    return data_search ? data_search : false;
  }

  async read() {
    const data_str = await readFile(this.local, 'utf8');
    return (data_str != String()) ? JSON.parse(data_str) : false;
  }

  async delete() {
    unlink(this.local, (err) => {
      if(err) throw err;
      console.log(`Arquivo de segurança removido download concluído com sucesso!`);
    });
  }
})();