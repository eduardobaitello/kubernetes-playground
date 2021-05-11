var express = require('express')
const winston = require('winston')
const expressWinston = require('express-winston')
const prometheusMiddleware = require('express-prometheus-middleware');

var router = express.Router()

var app = express();
var port = process.env.PORT || 3003

app.set('port', port)
app.use(expressWinston.logger({
    transports: [ new winston.transports.Console() ],
    format: winston.format.json(),
    meta: true,
    expressFormat: true,
    colorize: false
}))
app.use(prometheusMiddleware({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    normalizeStatus: true,
    requestDurationBuckets: [0.01, 0.05, 0.1, 0.5, 1],
}));


router.get('/hours', function(req, res, next) {
    var date = new Date()
    var hours = date.getHours()

    if (Math.random() < 0.05) {
        res.status(500).json({
            message: "Internal server error"
        })
        return
    }

    res.status(200).json({ 
        hours: hours
    })
})

app.use('/v1/', router)

// error handler
app.use(function(err, req, res, next) {
    // render the error page
    res.status(err.status || 500).json({
        message: err.message,
        error: err
    })
});
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})