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
        host: 'redis-16748.c14.us-east-1-2.ec2.cloud.redislabs.com',
        port: 16748,
        password: 'COlQJB3bLM5bCETqt7cEdxkcnUlAwk54'        
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