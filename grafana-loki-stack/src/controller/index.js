const fetch = require('node-fetch')

const express = require('express')
const winston = require('winston')
const expressWinston = require('express-winston')
const prometheusMiddleware = require('express-prometheus-middleware');

var router = express.Router()

var app = express();
var port = process.env.PORT || 3000
app.set('port', port)

const loggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    meta: true,
    expressFormat: true,
    colorize: false
}

const logger = winston.createLogger(loggerOptions)
app.use(expressWinston.logger(loggerOptions))

app.use(prometheusMiddleware({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    normalizeStatus: true,
    requestDurationBuckets: [0.01, 0.05, 0.1, 0.5, 1],
}));

router.get('/current-time', function (req, res, next) {
    let fetchSettings = {
        method: "Get"
    }

    var seconds = 'xx'
    var minutes = 'xx'
    var hours = 'xx'

    let secondsPromise = fetch('http://seconds/v1/seconds', fetchSettings)
        .then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    logger.log({
                        level: 'error',
                        message: `Seconds API response not OK: ${text}`
                    })
                })

                return
            }

            return res.json()
        })
        .then(json => {
            if (json) {
                seconds = json.seconds
            }
        })
        .catch(error => {
            logger.log({
                level: 'error',
                message: `Error querying seconds API: ${error}`
            })
        })

    let minutesPromise = fetch('http://minutes/v1/minutes', fetchSettings)
        .then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    logger.log({
                        level: 'error',
                        message: `Minutes API response not OK: ${text}`
                    })
                })

                return
            }

            return res.json()
        })
        .then(json => {
            if (json) {
                minutes = json.minutes
            }
        })
        .catch(error => {
            logger.log({
                level: 'error',
                message: `Error querying minutes API: ${error}`
            })
        })

    let hoursPromise = fetch('http://hours/v1/hours', fetchSettings)
        .then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    logger.log({
                        level: 'error',
                        message: `Hours API response not OK: ${text}`
                    })
                })

                return
            }

            return res.json()
        })
        .then(json => {
            if (json) {
                hours = json.hours
            }
        })
        .catch(error => {
            logger.log({
                level: 'error',
                message: `Error querying hours API: ${error}`
            })
        })

    Promise.all([secondsPromise, minutesPromise, hoursPromise]).then(() => {
        res.status(200).json({
            time: `${hours}:${minutes}:${seconds}`
        })
    })

})

app.use('/v1/', router)

// error handler
app.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 500).json({
        message: err.message,
        error: err
    })
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})