const config = require('config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const status = require('http-status');
const jwt = require('jsonwebtoken');

var refreshTokens = [];
const accessTokenSecret = config.get("auth.accessTokenSecret");
const refreshTokenSecret = config.get("auth.refreshTokenSecret");

const app = express();
// Enable CORS
app.use(cors());

// Enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// TODO: authentication / authorization functions
// pre-created 2 client application, temporary used purpose
const clients = [
    {
        app: 'chrome-extension',
        secret: 'luatinhkhongluadao',
        role: 'client'
    }, {
        app: 'firefox-plguin',
        secret: 'password123member',
        role: 'client'
    }
]

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
    console.log('app: ', app);
    console.log('secret: ', secret);

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
            refresh: refreshToken
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
    res.status(status.OK).send({
        status: status.OK,
        version: config.get("app.version"),
        requestedOn: new Date(),
      });
})

console.info("Launch the API Server at ", config.get("app.domain"), ":", config.get("app.port"));
app.listen(config.get("app.port"));