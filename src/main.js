import Fingerprint2 from 'fingerprintjs2';
import { getUrlParameter, GetCookie } from '../lib/tool'
import '../lib/anycookie.js';
import request from '../lib/request';
var TRequest = new request();

// const TdeviceId = AC.get("tdeviceId"); // 本地存储设备id
const fp = AC.get("fp"); // 指纹id
const deviceId = getUrlParameter('deviceId'); // url设备id
const slotId = getUrlParameter('slotId');// 广告位id
const id = getUrlParameter('id');// 活动id

// 获取当前状态
const getStatus = function() {
    let status = 0;
    try {
        const cid = GetCookie("TdeviceId") // cookie 存储的设备id
        const lid = localStorage && localStorage.getItem("TdeviceId"); // localstoragy 存储的设备id
        if(!cid && !lid) {
            // 用户第一次进入
            status = 1;
            AC.set("TdeviceId", deviceId);
        } else if (cid && lid) {
            // 第二次进来且没有清缓存
            // cookie和localstoragy 都不清理
            // 2 当前的本地存储和实际一致 3 当前的本地存储和不一致
            status = lid === deviceId ? 2 : 3;
        } else if (lid && !cid) {
            // localstoragy 不清 cookie清理
            status = lid === deviceId ? 4 : 5;
        }
    } catch (err) {
       console.log(err)
       return status;
    }
    return status;
}
// 请求
const sendRequest = function(result, components) {
    if(!result) {
        console.error('请填写指纹');
        return;
    }
    const status = getStatus();
    try {
        let url = `/statistics/activityPagePerf?type=fingerprint&id=${id}&sId=${slotId}&deviceId=${deviceId}&fp=${result}&status=${status}`
        TRequest.httpGetAsync(url, function (val) {
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
        extendedJsFonts: false
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
    Fingerprint2.get(defaultOptions, function (components) {
        // var values = components.map(function (component) { return component.value })
        // var murmur = Fingerprint2.x64hash128(values.join(''), 31)
        // AC.set("fp", murmur);
        // sendRequest(murmur, components);
        getIPLocal(function(data) {
            if (data && data.location) {
                components.push({
                    key: 'location',
                    value: data.location
                })
            }
            var values = components.map(function (component) { return component.value })
            var murmur = Fingerprint2.x64hash128(values.join(''), 31)
            AC.set("fp", murmur);
            sendRequest(murmur, components);
        })
        
    }) 
    
}
if (!fp) {
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
    console.log('get', fp);
    sendRequest(fp);
}