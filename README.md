# venzee-error-handler

Handle Venzee-specific errors as well as HTTP errors.

Inspired by [api-error-handler]() and [statuses](). Hat tip to Jonathan Ong.

The bulk of our Venzee custom errors will be in the 460+ space. There are no status codes registered in the `460-499` error space, and the `4xx` series of codes handle client errors. So when there's something wrong with the requests we receive, we'll likely return `4xx` responses.

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

```
User.checkEmail = function(next) {
  user.find({ where: { email: 'foo@example.com' }}, function(err, results) {
    if (err) {
  	  err.status = 461; // Email Already In Use
	  return next(err);
    } else {
	  return next();
    }
  });
};
```

-----
**For accessing the complete list of error codes & strings:**

```
var status = require('venzee-error-handler').venzeeStatus;

// assuming req.statusCode is 460
if (status(req.statusCode)) {
  var str = status[req.statusCode];
  console.log(str); // Entity Already Exists
}

var code = status['Email Already In Use'];
console.log(code); // 461
```
