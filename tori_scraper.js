const axios = require('axios')
const cheerio = require('cheerio')
fs = require('fs')

const SEARCH_TERM = 'tuoli'
let PAGE_NUM = 0

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
