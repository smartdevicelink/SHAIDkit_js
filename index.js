'use strict';

const http = require('http'),
    https = require('https'),
    GET = require("lodash.get");

class shaidkit {
    constructor(options = {}){
        this.entities = {
            "application": "application",
            "application/approval/vendor": "application/approval/vendor",
            "application/approval/sdlc": "application/approval/sdlc",
            "category": "category",
            "country": "country",
            "permission": "permission",
            "service": "service",
            "vendor": "vendor",
            "vendor/key": "vendor/key"
        };

        if (options.base_url !== null && options.base_url !== undefined) {
            this.base_url = new URL(options.base_url);
            this.hostname = this.base_url.hostname || "shaid.smartdevicelink.com";
            this.port = this.base_url.port;
            this.protocol = this.base_url.protocol || "https:";
        } else {
            this.hostname = "shaid.smartdevicelink.com";
            this.protocol = "https:";
        }
        this.version = "v" + options.version;
        this.secret_key = options.secret_key || null;
        this.public_key = options.public_key || null;
        this.sdl_server_version = options.sdl_server_version || null;

        if(isNaN(options.version)){
            throw new Error("'version' must be a valid integer. e.g. 2");
        }

        if(!(this.secret_key && this.public_key)){
            throw new Error("'public_key' and 'secret_key' must be provided");
        }

        return this;
    }

    get entity() {
        return this.entities;
    }

    read(entity, params, callback){
        this.makeRequest("GET", entity, params, callback).end();
    }

    create(entity, params, callback){
        this.makeRequest("POST", entity, params, callback).end(JSON.stringify(params), 'utf8');
    }

    update(entity, params, callback){
        this.makeRequest("PUT", entity, params, callback).end(JSON.stringify(params), 'utf8');
    }

    delete(entity, params, callback){
        this.makeRequest("DELETE", entity, params, callback).end(JSON.stringify(params), 'utf8');
    }

    validateEntity(entity){
        var is_valid = this.entities[entity] ? true : false;
        if(!is_valid){
            throw new Error(entity + " is not a valid entity.");
        }
        return is_valid;
    }

    parseQueries(params) {
        return Object.keys(params).length === 0 ? "" : "?" + Object.entries(params).map((kvPair) => {
            return kvPair[0] + "=" + kvPair[1];
        }).join("&");
    }

    makeRequest(verb, entity, params, callback){
        this.validateEntity(entity);

        const queryString = (verb == "GET") ? this.parseQueries(params) : ''
        const path = "/api/" + this.version + "/" + entity + queryString;
        const options = {
            "method": verb,
            "host": this.hostname,
            "port": this.port,
            "path": path,
            "timeout": 10000,
            "headers": {
                "public_key": this.public_key,
                "secret_key": this.secret_key,
                "sdl_server_version": this.sdl_server_version,
            },
        }

        if (verb != "GET") {
            options.headers["Content-Type"] = "application/json; charset=UTF-8";
        }

        function responseCallback (response) {
            let aggregateResponse = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                // getting response back from SHAID
                aggregateResponse += chunk;
            });
            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    // success
                    callback(null, JSON.parse(aggregateResponse));
                } else if (response.statusCode >= 400 && response.statusCode <= 403) {
                    // handled error
                    callback(response.statusCode, JSON.parse(aggregateResponse));
                } else {
                    // unexpected API error
                    callback(GET(aggregateResponse, "meta.message") || "Unexpected SHAID error", aggregateResponse);
                }
            });
        }

        function errorCallback (err) {
            callback("Network Error", err);
        }

        if (this.protocol === "https:") {
            return https.request(options, responseCallback).on("error", errorCallback);
        } else {
            return http.request(options, responseCallback).on("error", errorCallback);
        }
    }
}

module.exports = shaidkit;