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
		console.log('download error in function')
	}
	
}

const goToLink = async (url) => {
	try {
		const uri = encodeURI(url)
		const res = await axios.get(uri)
		const $ = cheerio.load(res.data)

		$('.thumb_link').each((idx, el) => {
			let url = $(el).attr('href')
			//console.log('download link', url)
			const name = path.basename(url)
			downloadImage(url, `${dir}/${name}.jpg`)
		})
	} catch (err) {
		console.log(err)
	}

}

const getAll = async () => {
	try {
		//get data from first page
		var res = await axios.get(`https://www.tori.fi/koko_suomi?q=${SEARCH_TERM}&cg=0&w=3&st=s&st=k&st=u&st=h&st=g&ca=18&l=0&md=th`, {timeout: 10000})
		var $ = cheerio.load(res.data)
		var result = $('#last_page').find('a').attr('href')
		const re = /(?<=o=).*/
		const MAX_PAGE = parseInt(result.match(re)[0])

		var list = $('.list_mode_thumb').html()
		$ = cheerio.load(list)
		$("a").each((idx, el) => {
			var item_url = $(el).attr('href')
		//	console.log("HERES THE first page LINK",item_url)
			goToLink(item_url)
		})
		console.log ("max page = ", MAX_PAGE)
		for(PAGE_NUM; PAGE_NUM <= MAX_PAGE; PAGE_NUM++) {
			console.log('HERE')
			try {
				res = await axios.get(`https://www.tori.fi/koko_suomi?ca=18&q=${SEARCH_TERM}&w=3&o=${PAGE_NUM}`, {timeout: 20000})
				$ = cheerio.load(res.data)
				list = $('.list_mode_thumb').html()
				$ = cheerio.load(list)
				$("a").each((idx, el) => {
					item_url = $(el).attr('href')
					if (!item_url.includes('autot')) {
				//		console.log(`HERES THE page ${PAGE_NUM} LINK`, item_url)
						goToLink(item_url)
					}
				})
			} catch (err) {
				console.log("error in loop")
			}
	}
	}catch (err) {
		console.log ("error on first page")
	}

}

getAll()
