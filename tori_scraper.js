const axios = require('axios')
const cheerio = require('cheerio')
const path = require('node:path')
const prompt = require('prompt-sync')()
fs = require('fs')

//get search term
const SEARCH_TERM = prompt('Enter a search term (replace spaces with a "+"): ')
var PAGE_NUM = 2

//create dir
var dir = `./${SEARCH_TERM}_jpgs`
if (!fs.existsSync(dir)){
	fs.mkdirSync(dir)
}

//generic function to download a single image
const downloadImage  = async (url, path) => {
	try {
		const response = await axios({
			method: "get",
			url: url,
			responseType: "stream",
			timeout: 20000
		})
		response.data.pipe(fs.createWriteStream(path))
		console.log("downloading image")
	} catch (err) {
		console.log('download error')
	}
	
}

const getAll = async () => {
	try {
		const res = await axios.get(`https://www.tori.fi/koko_suomi?q=${SEARCH_TERM}&cg=0&w=3&st=s&st=k&st=u&st=h&st=g&ca=18&l=0&md=th`, {timeout: 10000})
		const $ = cheerio.load(res.data)
		const result = $('#last_page').find('a').attr('href')
		const re = /(?<=o=).*/
		const MAX_PAGE = parseInt(result.match(re)[0])

		$('.item_image').each((idx, el) => {
				let url = $(el).attr('src')
		const name = path.basename(url)
			downloadImage(url, `${dir}/${name}.jpg`)
		})
		for(PAGE_NUM; PAGE_NUM <= MAX_PAGE; PAGE_NUM++) {
			try {
				const result = await axios.get(`https://www.tori.fi/koko_suomi?ca=18&q=${SEARCH_TERM}&w=3&o=${PAGE_NUM}`, {timeout: 10000})
				const $ = cheerio.load(result.data)
	//		console.log(`found ${$('.item_image').length} images`)
				$('.item_image').each((idx, el) => {
					let url = $(el).attr('src')
					const name = path.basename(url)
					downloadImage(url, `${dir}/${name}.jpg`)
				})
			} catch (err) {
					console.log("download error")
			}
		}
		} catch (err) {
			console.log ("error on first page")
		}
}
getAll()
