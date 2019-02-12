/**
 * TRequest prototype
 * @type {{}}
 */
function TRequestModel() {
}

/**
 * Generate guid/uuid with least duplicate ratio
 * @returns {string} 24 bit length
 */
TRequestModel.prototype.guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

/**
 * Async HTTP GET AJAX request
 * @param url
 * @param callback
 */
TRequestModel.prototype.httpGetAsync = function (url, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(xmlHttp.responseText);
    }
  };
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
};

/**
 * Send HTTP GET request by creating an image
 * @param url
 * @param callback
 */
TRequestModel.prototype.imgGet = function (url, callback) {
  var i = document.createElement('img');
  i.src = url;
  callback();
};

/**
 * CORS request
 * @param url
 * @param method
 * @returns {*}
 */
TRequestModel.prototype.makeCORSRequest = function (url, method) {
  if (typeof XMLHttpRequest === "undefined") {
    return null;
  }

  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest !== "undefined") {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }

  return xhr;
};
module.exports = TRequestModel