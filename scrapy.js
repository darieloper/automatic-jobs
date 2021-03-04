const axios = require('axios')
const cheerio = require('cheerio')

const scrapy = {
    page: null,
    baseUrl: null,

    init(page, baseUrl) {
        this.page = page
        const pageParam = page == 1 ? '' : `&page=${this.page}`
        this.baseUrl = (baseUrl || 'http://www.cubadebate.cu/?s=cuba+reporta') + pageParam

        return this
    },

    getFormattedDate() {
        const year = this.date.getFullYear()
        const month = this.date.getMonth().toString().padStart(2, '0')
        const day = this.date.getDate().toString().padStart(2, '0')

        return `${year}/${month}/${day}`
    },

    parseWord2Number(number) {
        const pairs = { uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 }

        return /\d+/.test(number) ? number : (pairs[number] || 0)
    },

    search() {
        axios.get(this.baseUrl)
        .then(({data}) => {
            const $ = cheerio.load(data)
            const divs = $('div.generic.salud-medicina')
            let beforeDate;
            const missingDates = []
            divs.each((i, div) => {
                const title = $(div).find('div.title a').text()
                const url = $(div).find('div.title a').attr('href')
                const date = new Date($(div).find('div.meta time').attr('datetime'))
                if (beforeDate) {
                   const diff = (beforeDate.getTime() - date.getTime())/(1000*60*60);
                   if (diff > 30) {
                       var missing = new Date();
                       missing.setTime(beforeDate.getTime()-1000*60*60*24)
                       missingDates.push(missing)
                   }
                }
                var totalRegexp = new RegExp(/(\d+) nuevos casos/g)
                const total = totalRegexp.exec(title)[1]
                var healthRegexp = new RegExp(/(\d+) altas m/g)
                const health = healthRegexp.exec(title)[1] || 0
                var deathRegexp = new RegExp(/(\w+) fallecidos /g)
                const death = this.parseWord2Number(deathRegexp.exec(title)[1] || 0)

                console.log(total, health, death, date)                
                beforeDate = date
            })

            console.log(missingDates)
        }) 
    }
}

scrapy.init(new Date()).search();