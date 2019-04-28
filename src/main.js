import Fingerprint2 from 'fingerprintjs2';
import { getUrlParameter } from '../lib/tool'
import UAParser from '../lib/uapase';
import request from '../lib/request';
import '../lib/anycookie.js';
// import '../lib/evercookie'
const TRequest = new request();
const uuidkey = 'uuid5';
const fpkey = 'fp5';

const baseUrl = '//finger.dui88.com'
const deviceId = getUrlParameter('deviceId') || ''; // url设备id
const slotId = getUrlParameter('slotId') || '';// 广告位id
const getFP = () => {
    const uuid = AC.get(uuidkey)
    if(uuid) {
        AC.set(`_coll_${uuidkey}`, uuid);
    }
    return AC.get(fpkey) || '';
}
const appId = (window.CFG && window.CFG.appId) || '';
const params = {
    fingerprint: getFP(),
    uuid: AC.get(`_coll_${uuidkey}`) || deviceId,
    deviceId,
    sid: slotId,
    appId: appId || 0,
    status: ''
}
// evercookie
// const ec = new evercookie({
//     lso: false,
//     silverlight: false,
//     java: false,
//     history: false,
//     pngCookieName: false,
//     etagCookieName: false,
//     cacheCookieName: false,
//     hsts: false
// });
// 用户添加请求
const sendRequest = function () {
    try {
        TRequest.httpPostAsync(`${baseUrl}/fingerprint/userAdd`, params);
        TRequest.httpPostAsync(`${baseUrl}/fingerprint/UVCount`, params);
    } catch (e) {
        console.log(e);
    }
}
// 用户添加请求
const userFind = (fp) => {
    return new Promise((resolve, reject) => {
        TRequest.httpPostAsync(`${baseUrl}/fingerprint/userFind`, Object.assign({}, params, {fingerprint: fp}) , (res) => {
            res = JSON.parse(res);
            if (res && res.code === 0) {
                const uuid = res.data.uuid || deviceId;
                AC.set(`_coll_${uuidkey}`, uuid);
                TRequest.httpPostAsync(`${baseUrl}/fingerprint/UVCount`, Object.assign({}, params, {uuid, fingerprint: fp}), function (val) {
                    console.log('Tracking request has sent with fingerprint: ', fp);
                    resolve(res)
                });
            } else {
                reject(res)
            }
        })
    })
    
}
const defaultOptions = {
    preprocessor: function(key, value) {
        if (key == "userAgent") {
          var parser = new UAParser(value); // https://github.com/faisalman/ua-parser-js
          var userAgentMinusVersion = parser.getOS().name + ' ' + parser.getDevice().vendor + ' ' + parser.getDevice().model
          return userAgentMinusVersion
        }
        return value
    },
    audio: {
        timeout: 1000,
        // 在iOS 11上，音频上下文只能用于响应用户交互。我们要求用户在iOS 11上显式启用音频指纹https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
        excludeIOS11: true
    },
    fonts: {
        swfContainerId: 'fingerprintjs2',
        userDefinedFonts: [],
        extendedJsFonts: true
    },
    screen: {
        // 当用户旋转移动设备时确保指纹一致
        detectScreenOrientation: true
    },
    plugins: {
        sortPluginsFor: [/palemoon/i], //浏览器随机插件顺序。可以提供应该对插件进行排序的用户代理正则表的列表。
        excludeIE: true // 跳过IE插件枚举/检测
    },
    extraComponents: [],
    excludes: {
        // Unreliable on Windows, see https://github.com/Valve/fingerprintjs2/issues/375
        'enumerateDevices': true,
        // 取决于浏览器缩放
        'pixelRatio': true,
        //取决于某些浏览器的隐身模式 
        'doNotTrack': true,
        // 已经使用JS字体
        'fontsFlash': true,
        'colorDepth': true,
        'deviceMemory': true,
        'timezone': true,
        'openDatabase': true,
        'canvas': true,
        'webgl': true,
        'audio': true,
        'language': true
    },
    NOT_AVAILABLE: 'not available',
    ERROR: 'error',
    EXCLUDED: 'excluded'
}
const getIPLocal = function (callback) {
    try {
        // {"code":"0000000","desc":"成功","data":{"id":63982362,"startIpNum":0,"endIpNum":28877260300,"country":"中国","province":"安徽","city":"黄山","district":"","isp":"铁通","code":341000},"success":true}
        TRequest.httpGetAsync('/common/ip', function (res) {
            res = JSON.parse(res);
            let location = null;
            if (res.code === '0000000') {
                location = (res.data.province || res.data.region || '') + '/' + res.data.city
            }
            callback && callback(null, { location })
        });
    } catch (e) {
        console.log(e)
        callback && callback(e)
    }
}

const getFingerprint = (done) => {
    Fingerprint2.get(defaultOptions, function (components) {
        getIPLocal(function (err, data) {
            if(err) {
                console.log(err)
                return;
            }
            if (data && data.location) {
                components.push({
                    key: 'location',
                    value: data.location
                })
            }
            const values = components.map(function (component) { return component.value })
            const murmur = Fingerprint2.x64hash128(values.join(''), 31)

            AC.set(fpkey, murmur);
            AC.set(`_coll_${uuidkey}`, deviceId);
            userFind(murmur)
        })

    })

}
if (!getFP()) {
    if (window.requestIdleCallback) {
        requestIdleCallback(function () {
            getFingerprint()
        })
    } else {
        setTimeout(function () {
            getFingerprint()
        }, 500)
    }
} else {
    sendRequest();
}