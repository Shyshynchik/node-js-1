const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const hostname = 'nodejs';
const port = 3456;

let file = JSON.parse(fs.readFileSync('./routs.json', 'utf-8'));

let printEnv = function (req, res) {
    res.statusCode = file[req.url]['status'];
    res.setHeader('Content-Type', 'text/plain');
    res.end(`NODE_ENV=${process.env.NODE_ENV}\n`);
}

let addHeader = function (req, res) {
    res.statusCode = file[req.url]['status'];
    file[req.url]['header'].forEach(el => res.setHeader(el[0], el[1]));
    res.end(file[req.url]['return']);
}

let setCookie = function (req, res) {
    res.statusCode = file[req.url]['status'];
    res.setHeader('Content-Type', 'text/plain');
    let cookie = [];
    file[req.url]['cookie'].forEach(el => cookie.push(el.join("=")));
    res.setHeader('Set-Cookie', cookie.join(';'));
    res.end(file[req.url]['return']);
}

let getCookie = function (req, res) {
    res.statusCode = file[req.url]['status'];
    res.setHeader('Content-Type', 'text/plain');
    res.end(file[req.url]['return'] + '\n' + req.headers.cookie);
}

let redirect = function (req, res) {
    res.statusCode = file[req.url]['status'];
    res.setHeader('Location', file[req.url]['redirect-url']);
    res.end();
}

const functions = new Map();
functions.set('printEnv', printEnv);
functions.set('addHeader', addHeader);
functions.set('setCookie', setCookie);
functions.set('getCookie', getCookie);
functions.set('redirect', redirect);


let serverError = function (res) {
    res.statusCode = 500;
    res.end('SERVER ERROR');
}

let okStatus = function (req, res) {
    if (file[req.url]['function'] !== undefined) {
        let fun = functions.get(file[req.url]['function']);
        fun === undefined
            ? serverError(res)
            : fun(req, res);
        return;
    }
    res.statusCode = file[req.url]['status'];
    res.setHeader('Content-Type', 'text/plain');
    res.end(file[req.url]['return']);
}
let controllerFunc = function (req, res) {
    if (file[req.url] !== undefined && file[req.url]['method'].includes(req.method)) {
        okStatus(req, res);
        return;
    }
    serverError(res);
}

const server = http.createServer(controllerFunc);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
