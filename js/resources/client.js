var request = require('request');

var _ = require('underscore'),
  qs = require('querystring'),
  logfmt = require('../log');

function Client(options) {
  options = options || {};
  this.network = options.network || 'mainnet';
  this.version = options.version || 'v1';
  this.debug = options.debug || false;
}

// Options:
// - method {String}: HTTP method to use
// - uri {Array[String]}: API Endpoint
// - body {Array|Object}: JSON request body
// - headers {Object}: Headers you want to set
Client.prototype.request = function(options, callback) {
  var self = this;
  var network = this.network;
  var version = this.version;

  options = options || {};
  var requestUrl = _requestUrl(network, version, options)
  var r = _requestObject(requestUrl, options)

  // Making request
  var t = this.time()
  request(r, function(err, response, body) {
    if (err) return callback(err)

    var code = response.statusCode;
    // don't log headers
    delete r.headers
    t.log(_.extend(r, {
      err: err ? err.message : 'null',
      code: code
    }))

    // assign error message if 400
    if (!err && code >= 400) {
      err = new Error(body.message)
    }

    body.code = code;

    var resource = _resource(body, options);

    callback(err, body, resource)
  })
};

function _requestUrl(network, version, options) {
  // Building URL
  var baseUrl = 'https://' + network + '.helloblock.io/' + version + '/'
  query = '';
  if (options.params) {
    if (options.options) {
      options.params = _.extend(options.params, options.options)
    }

    var query = '?' + qs.stringify(options.params)
  }

  return baseUrl + options.uri.join('/') + query
}

function _requestObject(requestUrl, options) {
  // Building request object
  var body = JSON.stringify(options.body) || '{}'
  var r = {
    method: options.method,
    uri: requestUrl,
    body: body,
    headers: {
      'content-type': 'application/json'
    },
    json: true
  }
  return r
}

function _resource(body, options) {
  var resource = {};
  if (body['data']) {
    resource = body['data']
    if (options.resource) resource = resource[options.resource];
  }
  return resource
}

Client.prototype.log = function(args) {
  var self = this;
  if (self.debug) {
    logfmt.log(args);
  }
}

Client.prototype.time = function() {
  var self = this;
  if (self.debug) {
    return logfmt.time();
  };

  return {
    log: function() {}
  }
}

module.exports = {
  Client: Client
}
