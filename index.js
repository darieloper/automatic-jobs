const app = require('express')()
const { router, setQueues, BullAdapter } = require('bull-board')
const Queue = require('bull')

const PORT = process.env.PORT || 8080

app.use('/admin', router)

app.get('/hello', (req, resp) => {
    resp.send('Hello World')
})

const scrapyQueue = new Queue('scrapy', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PSW        
    }
})

scrapyQueue.add({name: "algo"}, { repeat: { cron: '1 * * * * *' } });

scrapyQueue.on('completed', job => {
    console.log(`Completed: ${job.id}`)
})

scrapyQueue.process(job => {
    console.log('Proceses')
    return new Date()
})

setQueues([
    new BullAdapter(scrapyQueue)
])

app.listen(PORT, () => {
    console.log('start')
})