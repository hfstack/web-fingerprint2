// AnyCookie (C) 2016 by Yieme. See: github.com/yieme/anycookie. License: MIT
(function(WINDOW, DOCUMENT, COOKIE, LENGTH, SUBSTRING, NAMESPACE, options, cookieDomain, i, host, anycookie, UNDEFINED) {
    WINDOW[NAMESPACE] = WINDOW[NAMESPACE] || [];
    anycookie         = WINDOW[NAMESPACE];
  
    // get value from param-like string (eg, "x=y&name=VALUE")
    function getFromStr(name, text, nameEQ, ca, c, i) {
      if (typeof text !== "string") {
        return;
      }
      nameEQ = name + "="
      ca = text.split(/[;&]/)
      for (i = 0; i < ca[LENGTH]; i++) {
        c = ca[i];
        while (c.charAt(0) === " ") {
          c = c[SUBSTRING](1, c[LENGTH]);
        }
        if (c.indexOf(nameEQ) === 0) {
          return c[SUBSTRING](nameEQ[LENGTH], c[LENGTH]);
        }
      }
    };
  
    anycookie.push(WINDOW.localStorage)
    anycookie.push(WINDOW.sessionStorage)
    anycookie.push({ // adapted from github.com/jgallen23/cookie-monster
      setItem: function(name, value, date, type, valueToUse) {
        date = new Date()
        type = typeof(value)
        date.setTime(date.getTime() + 1e11); // 1e8 is approximately 3 years
        valueToUse = (type === "object"  && type !== "undefined") ? JSON.stringify({v:value}) : value
        DOCUMENT[COOKIE] = name + "=" + encodeURIComponent(valueToUse) + "; expires=" + date.toUTCString() + "; path=/" // ; secure
      },
      getItem: function(name) {
        var nameEQ = name + "=",
            ca = DOCUMENT[COOKIE].split(';'),
            value = '',
            firstChar = '',
            parsed={};
        for (var i = 0; i < ca[LENGTH]; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c[SUBSTRING](1, c[LENGTH]);
          if (c.indexOf(nameEQ) === 0) {
            value = decodeURIComponent(c[SUBSTRING](nameEQ[LENGTH], c[LENGTH]));
            firstChar = value[SUBSTRING](0, 1);
            if(firstChar=="{"){
              try {
                parsed = JSON.parse(value);
                if("v" in parsed) return parsed.v;
              } catch(e) {
                return value;
              }
            }
            if (value=="undefined") return UNDEFINED;
            return value;
          }
        }
        return null
      }
    });
  
    // high level get/set operations against all data stores
    anycookie.get = function(name, result) {
      for(i=0; i<anycookie[LENGTH]; i++) {
        result = anycookie[i]
        if (result) {
          try {
            result = result.getItem(name)
          } catch(e) {}
          if (result) {
            anycookie.set(name, result)
            return result
          }
        }
      }
    }
  
    anycookie.set = function(name, value) {
      for(i=0; i<anycookie[LENGTH]; i++) {
        var result = anycookie[i]
        if (result) {
          try {
            result.setItem(name, value)
          } catch(e) {}
        }
      }
    }
  
  })(window, document, 'cookie', 'length', 'substring', 'AC')
  