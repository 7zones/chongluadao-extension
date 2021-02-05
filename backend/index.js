const config = require('config');
const express = require('express');

const cors = require('cors');
const bodyParser = require('body-parser');
const status = require('http-status');
const jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");

const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');
const morgan = require('morgan');

const { MongoClient } = require('mongodb');

const fields = ['time','rating', 'url', 'ip', 'client'];
const opts = { fields, header: false };
const parser = new Parser(opts);

var refreshTokens = [];
const accessTokenSecret = config.get("auth.accessTokenSecret");
const refreshTokenSecret = config.get("auth.refreshTokenSecret");

const apiLimiter = rateLimit({
    windowMs: 55 * 60 * 1000,
    max: 100,
    message: "Too many request from this IP, please try again after an hour"
  });


const app = express();
// Enable CORS
app.use(cors());
app.use(express.static('public'));

// Enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Enable logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))
// Rate limit
app.use(`/${config.get("app.version")}/rate`, apiLimiter);

// TODO: authentication / authorization functions
const clients = config.get("auth.clients");

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

app.post(`/${config.get("app.version")}/initSession`, (req, res) => {
    const { app, secret } = req.body;
    const client = clients.find(u => { return u.app === app && u.secret === secret });

    if (client) {
        //TODO: generate an access token
        const accessToken = jwt.sign({
            username: client.app,
            role: client.role
        },
        accessTokenSecret,
        {
            expiresIn: config.get("auth.expiration")
        });

        const refreshToken = jwt.sign({
            username: client.app,
            role: client.role
            },
            refreshTokenSecret);

        refreshTokens.push(refreshToken);


        res.json({
            version: config.get("app.version"),
            requestedOn: new Date(),
            token: accessToken,
            refresh: refreshToken,
        });
    }
    else {
        res.status(status.FORBIDDEN).send({
            version: config.get("app.version"),
            requestedOn: new Date(),
            message: `Client application credential incorrect. ${status['401_MESSAGE']}`});
    }
});

app.post(`/${config.get("app.version")}/token`, (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }

    jwt.verify(token, refreshTokenSecret, (err, client) => {
        if (err) {
            return res.sendStatus(403);
        }

        const accessToken = jwt.sign({
            username: client.app,
            role: client.role
        },
        accessTokenSecret,
        {
            expiresIn: config.get("auth.expiration")
        });

        res.json({
            status: status.OK,
            version: config.get("app.version"),
            requestedOn: new Date(),
            token: accessToken
        });
    });
});

app.post(`/${config.get("app.version")}/closeSession`, (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => t !== token);

    res.status(status.OK).send({
        status: status.OK,
        version: config.get("app.version"),
        requestedOn: new Date(),
        message: "Session closed"
      });
});

app.get(`/${config.get("app.version")}/ping`, function(req, res){
  res.status(status.OK).send({
      status: status.OK,
      version: config.get("app.version"),
      requestedOn: new Date(),
    });
})

app.post(`/${config.get("app.version")}/rate`, authenticateJWT, function(req, res) {
    //TODO: store request to file
    const params = {  time: new Date(), ...req.body, ip: req.ip};
    const msg = validateSubmitting(params);
    if (msg.indexOf("ok") == -1) {
        res.status(status.BAD_REQUEST).send({
            status: status.BAD_REQUEST,
            version: config.get("app.version"),
            requestedOn: new Date(),
            "message": msg
        });
    }
    else {
        if (params) {
            db.collection("rating").insertOne(params);
            /*
            const data = parser.parse(params);
            fs.appendFile(config.get("app.storage"), `${data}\r\n`, 'utf8', function (err) {
                if (err) {
                    console.log('Some error occured - file either not saved or corrupted file saved.');
                } else{
                    console.log('saved: ',  data);
                }
            });
            */
        }

        res.status(status.OK).send({
            status: status.OK,
            version: config.get("app.version"),
            requestedOn: new Date(),
            "message":"ok"
        });
    }
})

/**
 * The route to get blacklist or whitelist sites from DB
 * this is public so the request shouldn't be authenticated
 * @param {String} typelist  type of list we wanna get ('blacklist' or 'whitelist')
 * @return {JSON} array of objects
 */
app.get(`/${config.get("app.version")}/:typelist`, function(req, res) {
    let type = null
    switch (req.params.typelist) {
        case "blacklist":
            type = "blacklist"
            break;
        case "whitelist":
            type = "whitelist"
            break;
        default:
            res.status(400).send(req.params.typelist + " is not a valid type of list")
    }

    db.collection(type).find().toArray().then(result => {
        res.status(status.OK).send(result);
    })

})

app.post(`/${config.get("app.version")}/res/:resId`, authenticateJWT, function(req, res) {
    if (!req.params.resId || ['blacklist', 'whitelist'].indexOf(req.params.resId) == -1) {
        res.status(status.NOT_FOUND).send({
            status: status.NOT_FOUND,
            version: config.get("app.version"),
            requestedOn: new Date(),
            message: `${req.params.resId} not found`
        });
    }

    //get encrypted data
    fs.readFile(`secure/${req.params.resId}.json`, "utf8", function(err, data){
        if(err) throw err;

        if (data) {
            return res.status(status.OK).send({
                status: status.OK,
                version: config.get("app.version"),
                requestedOn: new Date(),
                data
            });
        }
    });
});

function validateSubmitting(params) {
    const { rating, url } = params;
    const expUrl = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

    if (rating < 1 || rating > 5) {
        return "Rating is out of range";
    }
    else if (!url.match(new RegExp(expUrl))) {
        return `Incorrect URL ${url}`;
    }
    return "ok";
}


var db = null;
const url = `mongodb://${config.get("db.username")}:${config.get("db.password")}@${config.get("db.url")}:${config.get("db.port")}/${config.get("db.name")}`;
MongoClient.connect(url, {
    useUnifiedTopology: true,
}, (err, database) => {
    // ... start the server
    if (err) {
        console.log('error: ', err);
        return;
    }

    db = database.db(config.get("db.name"));
    console.info("Launch the API Server at ", config.get("app.domain"), ":", config.get("app.port"));
    app.listen(config.get("app.port"));
 });
