'use strict';

var REQUEST = require("request"),
    GET = require("lodash.get");

class shaidkit {
    constructor(options = {}){
        this.entities = {
            "application": "application",
            "category": "category",
            "country": "country",
            "permission": "permission",
            "vendor": "vendor"
        };
        this.base_url = options.base_url || "https://shaid.smartdevicelink.com";
        this.version = "v" + options.version;
        this.secret_key = options.secret_key || null;
        this.public_key = options.public_key || null;

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
        this.makeRequest("GET", entity, params, callback);
    }

    create(entity, params, callback){
        this.makeRequest("POST", entity, params, callback);
    }

    update(entity, params, callback){
        this.makeRequest("PUT", entity, params, callback);
    }

    delete(entity, params, callback){
        this.makeRequest("DELETE", entity, params, callback);
    }

    validateEntity(entity){
        var is_valid = this.entities[entity] ? true : false;
        if(!is_valid){
            throw new Error(entity + " is not a valid entity.");
        }
        return is_valid;
    }

    makeRequest(verb, entity, params, callback){
        this.validateEntity(entity);

        REQUEST({
            "method": verb,
            "uri": this.base_url + "/api/" + this.version + "/" + entity,
            "timeout": 10000,
            "headers": {
                "public_key": this.public_key,
                "secret_key": this.secret_key
            },
            "qs": verb == "GET" ? params : null,
            "json": params
        }, function(err, response, body){
            if(err){
                // network error
                callback("Network Error", err);
            }else if(response.statusCode >= 200 && response.statusCode < 300){
                // success
                callback(null, body);
            }else if(response.statusCode >= 400 && response.statusCode <= 403){
                // handled error
                callback(response.statusCode, body);
            }else{
                // unexpected API error
                callback(GET(body, "meta.message") || "Unexpected SHAID error", body);
            }
        });
    }

}

module.exports = shaidkit;
