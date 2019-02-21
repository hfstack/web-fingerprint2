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
function postDataFormat(obj){
  if(typeof obj != "object" ) {
    console.log("输入的参数必须是对象");
    return;
  }
  // 不支持FormData的浏览器的处理 
  var arr = new Array();
  var i = 0;
  for(var attr in obj) {
      arr[i] = encodeURIComponent(attr) + "=" + encodeURIComponent(obj[attr]);
      i++;
  }
  return arr.join("&");
}
/**
 * Async HTTP GET AJAX request
 * @param url
 * @param callback
 */
TRequestModel.prototype.httpGetAsync = function (url, callback) {
  try {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        callback(xmlHttp.responseText);
      }
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  } catch(e) {
    callback(e)
  }
};
/**
 * Async HTTP POST AJAX request
 * @param url
 * @param callback
 */
TRequestModel.prototype.httpPostAsync = function (url, data, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(xmlHttp.responseText);
    }
  };
  xmlHttp.open("POST", url, true);
  xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xmlHttp.setRequestHeader('Accept', 'application/json');

  xmlHttp.send(postDataFormat(data));
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
export default TRequestModel