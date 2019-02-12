import Fingerprint2 from 'fingerprintjs2';
import { getUrlParameter } from '../lib/tool'
import '../lib/anycookie.js';
import request from '../lib/request';
var TRequest = new request();
const uid = AC.get("uid")
var sendRequest = function(result, components) {
    if(!result) {
        console.error('请填写指纹');
        return;
    }
    try {
        let cp = []
        const unclude = ['canvas', 'fonts', 'webgl'];
        const selectSlotId = [252815];
        const deviceId = getUrlParameter('deviceId');
        const slotId = getUrlParameter('slotId');
        const id = getUrlParameter('id');
        let url = `/statistics/activityPagePerf?type=12&id=${id}&slotId=${slotId}&deviceId=${deviceId}&fp=${result}`
        if (selectSlotId.indexOf(slotId) === -1) {
            return;
        }
        if (Array.isArray(components)) {
            for(let item of components) {
               if(unclude.indexOf(item.key) === -1) {
                  cp.push(item);
               }
            }
            cp = JSON.stringify(cp);
            url += '&cp=' + cp;
        }
        TRequest.httpGetAsync(url, function () {
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
        swfPath: 'flash/compiled/FontList.swf',
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
        userAgent: true
    },
    NOT_AVAILABLE: 'not available',
    ERROR: 'error',
    EXCLUDED: 'excluded'
}
if (!uid) {
    if (window.requestIdleCallback) {
            requestIdleCallback(function () {
                Fingerprint2.get(function (components) {
                    Fingerprint2.getV18(defaultOptions, function (result, components) {
                        AC.set("uid", result);
                        console.log('set', result);
                        console.log(components);
                        sendRequest(result, components);
                    })
                })
            })
        } else {
            setTimeout(function () {
                Fingerprint2.get(function (components) {
                    Fingerprint2.getV18(defaultOptions, function (result, components) {
                        console.log(result);//结果是哈希指纹
                        console.log(components, 2);//组件是{key：'foo'的数组，值：'组件值'}
                        sendRequest(result, components);
                    })
                })  
            }, 500)
        }
} else {
    sendRequest(uid);
    console.log('get', uid);
}