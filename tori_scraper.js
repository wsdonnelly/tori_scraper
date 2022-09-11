const axios = require('axios')
const cheerio = require('cheerio')
const path = require('node:path')
fs = require('fs')

const prompt = require('prompt-sync')();



const SEARCH_TERM = prompt('Enter a search term: ')
//const SEARCH_TERM = 'baby toy'
let PAGE_NUM = 0







//download imgs to folder
var dir = `./${SEARCH_TERM}_jpgs`
if (!fs.existsSync(dir)){
	fs.mkdirSync(dir)
}

for (PAGE_NUM; PAGE_NUM < 100; PAGE_NUM++) {
	axios.get(`https://www.tori.fi/koko_suomi?ca=18&q=${SEARCH_TERM}&w=3&o=${PAGE_NUM}`)
		.then ((res) => {
			const $ = cheerio.load(res.data)

			$('.item_image').each((idx, el) => {
				let url = $(el).attr('src')
				const name = path.basename(url)
				axios({
					method: "get",
					url: url,
					responseType: "stream"
				})
				.then((response) => {
					response.data.pipe(fs.createWriteStream(`${dir}/${name}.jpg`));
				})
				.catch((err) => console.log(err))
			})
		})
}






/*
//download single img
const fileUrl = "https://images.tori.fi/api/v1/imagestori/images/100130472406.jpg?rule=thumb_280x210"
const name = path.basename(fileUrl)
console.log(name)
axios({
	method: "get",
	url: fileUrl,
	responseType: "stream"
}).then((response) => {
	response.data.pipe(fs.createWriteStream(`images/${name}.jpg`));
})



//more complete version
export async function downloadFile(fileUrl: string, outputLocationPath: string) {
  const writer = createWriteStream(outputLocationPath);

  return Axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {

    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}


//write img url's to file
for (PAGE_NUM; PAGE_NUM < 100; PAGE_NUM++) {
	axios.get(`https://www.tori.fi/koko_suomi?ca=18&q=${SEARCH_TERM}&w=3&o=${PAGE_NUM}`)
		.then ((res) => {
			const $ = cheerio.load(res.data)

			$('.item_image').each((idx, el) => {
				let img = $(el).attr('src')
				fs.writeFile('tori_imgs_src.txt', img + "\n", {flag: 'a+'}, (err) => {
					if (err) return console.log(err)
				})
			})
		})
}
*/