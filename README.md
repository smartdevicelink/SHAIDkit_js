# SHAIDkit.js
### A JavaScript wrapper for the SmartDeviceLink SHAID API

## Installation
```sh
npm install shaidkit --save
```

## Usage
```js
var shaidkit = require("shaidkit");

var shaid = new shaidkit({
    "version": 2, // we recommend the most recent API version
    "public_key": "public key here", // use your public_key
    "secret_key": "secret key here" // use your secret_key
});

shaid.read(
    shaid.entity.application,
    {
        "limit": 2
    },
    function(err, result){
        console.log(err);
        console.log(result);
    }
);
```

## Entities
The object type you wish to perform a CRUD (create, read, update, delete) operation on.

Entities should be declared in your SHAIDkit calls via the `shaidkit.entity.[entity name]` enumeration helper.

| Entity Name |
| ------ |
| application |
| category |
| country |
| permission |
| vendor |

## Methods
When using SHAIDkit, you specify the CRUD operation you wish to perform by accessing the corresponding method.

| Method | Description |
| ------ | ----------- |
| read() | Retrieves records of the given `entity` |
| create() | Creates one or more records of the given `entity` |
| update() | Updates one or more records of the given `entity` |
| delete() | Deletes one or more records of the given `entity` |

Each method *requires* the following parameters:
| Parameter | Description |
| ------ | ----------- |
| `entity` | The `entity` you are attempting to operate on |
| `{parameters}` | Creates one or more records of the given `entity` |
| `callback()` | A callback function in the form of callback(error, result) |

Entities are not guaranteed to support all methods. Please consult the [SHAID API Documentation](https://smartdevicelink.com/en/docs/shaid) for more information and the available parameters for each supported operation.

## License
