# venzee-error-handler

Handle Venzee-specific errors as well as HTTP errors.

The bulk of our Venzee custom errors will be in the 4xx HTTP status code space, and in the 400xxxx space for our internal 4xx conditions.

## Installation
`npm install venzee/venzee-error-handler --save`

## Usage

**For use as Express middleware:**

```
// in your server.js file or main application file
var errorHandler = require('venzee-error-handler');
...
api.use(errorHandler());
```

-----
Pass the error along to the middleware like this:

```js
User.checkEmail = function(next) {
  user.find({ where: { email: 'foo@example.com' }}, function(err, results) {
    if (err) {
  	  err.id = 'EmailAlreadyInUse';
	  return next(err);
    } else {
	  return next();
    }
  });
};
```

This will return a payload like this:

```json
{
	"status": 400,
	"@context": "/contexts/Error.jsonld",
	"@id": "/errors/EmailAlreadyInUse",
	"code": 4000001,
	"message": "The email address you provided is already in use.",
	"stack": "..." // only in non-production environments
}
```


-----
**Adding new error codes**

    grunt new

You'll be prompted for an error code string, and a human-friendly message. The code will be added to `lib/codes.json`, with the next-available 400* series code number.


## Options

 * `logger` name of a logger module to pass in. Will be handed directly to `require()`. Default: `venzee-logger`
 * `codes` `require()`-friendly path to your own error codes. Default: `./lib/codes.json`

