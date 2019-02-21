import Fingerprint2 from 'fingerprintjs2';
import { getUrlParameter } from '../lib/tool'
import '../lib/anycookie.js';
import request from '../lib/request';
var TRequest = new request();
const uid = AC.get("tguid")
var sendRequest = function(result, components) {
    if(!result) {
        console.error('请填写指纹');
        return;
    }
    try {
        let cp = []
        const unclude = ['canvas', 'fonts', 'webgl'];
        const deviceId = getUrlParameter('deviceId');
        const slotId = getUrlParameter('slotId');
        const id = getUrlParameter('id');
        let params = {
            timestamp: Date.now()
        };
        let url = `/statistics/activityPagePerf?type=fingerprint&id=${id}&sId=${slotId}&deviceId=${deviceId}&fp=${result}`
        if (components && Array.isArray(components)) {
            for(let item of components) {
               if(unclude.indexOf(item.key) === -1) {
                  cp.push(item);
               }
            }
            cp = JSON.stringify(cp);
            params.cp = cp
        }
        TRequest.httpPostAsync(url, params, function (val) {
            console.log('Tracking request has sent with fingerprint: ', result);
        });
        
    } catch (e) {
        console.log(e);
    }
}
var defaultOptions = {
    preprocessor: null,
    audio: {
        timeout: 1000,
        // 在iOS 11上，音频上下文只能用于响应用户交互。我们要求用户在iOS 11上显式启用音频指纹https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
        excludeIOS11: true
    },
    fonts: {
        swfContainerId: 'fingerprintjs2',
        swfPath: '',
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
    },
    NOT_AVAILABLE: 'not available',
    ERROR: 'error',
    EXCLUDED: 'excluded'
}
const getIPLocal = function(callback) {
    try {
        // {"code":"0000000","desc":"成功","data":{"id":63982362,"startIpNum":0,"endIpNum":28877260300,"country":"中国","province":"安徽","city":"黄山","district":"","isp":"铁通","code":341000},"success":true} ip
        TRequest.httpGetAsync('/common/ip', function (res) {
            res = JSON.parse(res);
            let location = null;
            if(res.code === '0000000') {
                location =  res.data.province + '/' + res.data.city
            }
            callback && callback({location})
        });
    } catch(e) {
        console.log(e)
        callback && callback()
    }
}
const getFingerprint = () => {
    requestIdleCallback(function () {
        Fingerprint2.get(defaultOptions, function (components) {
            getIPLocal(function(data) {
                if (data && data.location) {
                    components.push({
                        key: 'location',
                        value: data.location
                    })
                }
                var values = components.map(function (component) { return component.value })
                var murmur = Fingerprint2.x64hash128(values.join(''), 31)
                AC.set("tguid", murmur);
                sendRequest(murmur, components);
                console.log(murmur)
                console.log(components, 1)
            })
            
        }) 
    })
}
// if (!uid) {
    if (window.requestIdleCallback) {
        getFingerprint()
    } else {
        setTimeout(function () {
            getFingerprint()
        }, 500)
    }
// } else {
//     sendRequest(uid);
//     console.log('get', uid);
// }