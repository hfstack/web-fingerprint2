import Fingerprint2 from 'fingerprintjs2';
import { getUrlParameter, GetCookie } from '../lib/tool'
import '../lib/anycookie.js';
import request from '../lib/request';
var TRequest = new request();

// const TdeviceId = AC.get("tdeviceId"); // 本地存储设备id
// const fp = AC.get("fp"); // 指纹id
const fp = ''
const deviceId = getUrlParameter('deviceId'); // url设备id
const slotId = getUrlParameter('slotId');// 广告位id
const id = getUrlParameter('id');// 活动id

// 获取当前状态
const getStatus = function () {
    let status = 0;
    try {
        const cid = GetCookie("TdeviceId") // cookie 存储的设备id
        const lid = localStorage && localStorage.getItem("TdeviceId"); // localstoragy 存储的设备id
        if (!cid && !lid) {
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
const sendRequest = function (result, components) {
    if (!result) {
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
    // swfPath: '/assets/FontList.swf',
    imagesPath: './images/test',
    excludeWindowDump: true,
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
const getIPLocal = function (callback) {
    return callback()
    try {
        // {"code":"0000000","desc":"成功","data":{"id":63982362,"startIpNum":0,"endIpNum":28877260300,"country":"中国","province":"安徽","city":"黄山","district":"","isp":"铁通","code":341000},"success":true} ip
        TRequest.httpGetAsync('/common/ip', function (res) {
            res = JSON.parse(res);
            let location = null;
            if (res.code === '0000000') {
                location = res.data.province + '/' + res.data.city
            }
            callback && callback({ location })
        });
    } catch (e) {
        console.log(e)
        callback && callback()
    }
}
var syncModules = [
    {
        name: "literal_colors",
        detect: function (options) {
            var result = { };
            var colors = [
                'ActiveBorder', 'ActiveCaption', 'AppWorkspace', 'Background', 'ButtonFace', 'ButtonHighlight',
                'ButtonShadow', 'ButtonText', 'CaptionText', 'GrayText', 'Highlight', 'HighlightText', 'InactiveBorder',
                'InactiveCaption', 'InactiveCaptionText', 'InfoBackground', 'InfoText', 'Menu', 'MenuText', 'Scrollbar',
                'ThreeDDarkShadow', 'ThreeDFace', 'ThreeDHighlight', 'ThreeDLightShadow', 'ThreeDShadow',
                'Window', 'WindowFrame', 'WindowText'
            ];

            colors.forEach(function (color) {
                var span = document.createElement('span');
                span.setAttribute('style', 'background-color: ' + color);
                document.body.appendChild(span);

                var style = window.getComputedStyle ? window.getComputedStyle(span) : span.currentStyle;
                result[color] = style.backgroundColor;

                document.body.removeChild(span);
            });

            return {
                result: result,
                raw: stringifyObject(result)
            };
        }
    },
    {
        name: "activex_objects",
        detect: function (options) {
            var componentConstructor = window.ActiveXObject || window.GeckoActiveXObject || null;

            if (!componentConstructor)
                return emptyDetection;

            var result = [];
            var components = [
                "Agent.Control.1", "Agent.Control.2", "Alttiff.AlternaTIFF ActiveX.1", "Alttiff.AlternaTIFF ActiveX.1",
                "ComCtl2.Animation.1", "MSScriptControl.ScriptControl.1", "Adobe.SVGCtl", "IPIX.ActiveXCtrl.5", "AxMetaStream.MetaStreamCtl.1",
                "Autodesk.MGMap.1", "Autodesk.MGMap.1", "Wfica.WficaCtl.1", "Citrix.ICAClient", "Microsoft.XMLDOM", "Msxml2.DOMDocument",
                "Msxml2.DOMDocument.2.6", "Msxml2.DOMDocument.3.0", "Msxml2.DOMDocument.4.0", "JavaSoft.JavaBeansBridge.1", "Messenger.MsgrObject",
                "SealedMedia.UnsealerPlugin.1", "Cycore.Cult3D", "Outc.TC.1", "OPUCatalog.OPUCatalog.1", "IUCtl.Update.1", "DANSKESIKKER.DanskeSikkerCtrl.1",
                "MediaPlayer.MediaPlayer.1", "WMPlayer.OCX.7", "{22D6F312-B0F6-11D0-94AB-0080C74C7E95}"
            ];
            var canCreate = function (component) {
                try {
                    return new componentConstructor(component);
                } catch (e) {
                    return false;
                }
            };

            components.forEach(function (component) {
                if (canCreate(component)) result.push(component);
            });

            if (window.GeckoActiveXObject)
                result.push("GeckoActiveX");

            result.sort();

            return {
                result: result,
                raw: stringifyArray(result)
            };
        }
    },
    {
        name: "ms_components",
        detect: function (options) {
            var div = document.createElement("div");
            div.innerHTML = "<div style='behavior:url(#default#clientCaps)' ID='tempCompChecker' ></div>";
            document.body.appendChild(div);

            if (('undefined' === typeof tempCompChecker) || ('undefined' === typeof tempCompChecker.isComponentInstalled)) {
                document.body.removeChild(div);
                return emptyDetection;
            }

            var result = [];
            var components = [
                ["AOL ART Image Format Support", "{47F67D00-9E55-11D1-BAEF-00C04FC2D130}"],
                ["Address Book", "{7790769C-0471-11D2-AF11-00C04FA35D02}"],
                ["Arabic Text Display Support", "{76C19B38-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Chinese (Simplified) Text Display Support", "{76C19B34-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Chinese (Traditional) Text Display Support", "{76C19B33-F0C8-11CF-87CC-0020AFEECF20}"],
                ["DirectAnimation Java Classes", "{4F216970-C90C-11D1-B5C7-0000F8051515}"],
                ["DirectAnimation", "{283807B5-2C60-11D0-A31D-00AA00B92C03}"],
                ["DirectShow", "{44BBA848-CC51-11CF-AAFA-00AA00B6015C}"],
                ["Dynamic HTML Data Binding for Java", "{4F216970-C90C-11D1-B5C7-0000F8051515}"],
                ["Dynamic HTML Data Binding", "{9381D8F2-0288-11D0-9501-00AA00B911A5}"],
                ["Hebrew Text Display Support", "{76C19B36-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Internet Connection Wizard", "{5A8D6EE0-3E18-11D0-821E-444553540000}"],
                ["Internet Explorer Web Browser", "{89820200-ECBD-11CF-8B85-00AA005B4383}"],
                ["Internet Explorer Browsing Enhancements", "{630B1DA0-B465-11D1-9948-00C04F98BBC9}"],
                ["Internet Explorer Classes for Java", "{08B0E5C0-4FCB-11CF-AAA5-00401C608555}"],
                ["Internet Explorer Help Engine", "{DE5AED00-A4BF-11D1-9948-00C04F98BBC9}"],
                ["Internet Explorer Help", "{45EA75A0-A269-11D1-B5BF-0000F8051515}"],
                ["Internet Explorer Web Browser", "{89820200-ECBD-11CF-8B85-00AA005B4383}"],
                ["Japanese Text Display Support", "{76C19B30-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Korean Text Display Support", "{76C19B31-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Language Auto-Selection", "{76C19B50-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Macromedia Flash", "{D27CDB6E-AE6D-11CF-96B8-444553540000}"],
                ["Macromedia Shockwave Director", "{2A202491-F00D-11CF-87CC-0020AFEECF20}"],
                ["Microsoft virtual machine", "{08B0E5C0-4FCB-11CF-AAA5-00401C608500}"],
                ["NetMeeting NT", "{44BBA842-CC51-11CF-AAFA-00AA00B6015B}"],
                ["Offline Browsing Pack", "{3AF36230-A269-11D1-B5BF-0000F8051515}"],
                ["Outlook Express", "{44BBA840-CC51-11CF-AAFA-00AA00B6015C}"],
                ["Pan-European Text Display Support", "{76C19B32-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Task Scheduler", "{CC2A9BA0-3BDD-11D0-821E-444553540000}"],
                ["Thai Text Display Support", "{76C19B35-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Uniscribe", "{3BF42070-B3B1-11D1-B5C5-0000F8051515}"],
                ["VRML 2.0 Viewer", "{90A7533D-88FE-11D0-9DBE-0000C0411FC3}"],
                ["Vector Graphics Rendering (VML)", "{10072CEC-8CC1-11D1-986E-00A0C955B42F}"],
                ["Vietnamese Text Display Support", "{76C19B37-F0C8-11CF-87CC-0020AFEECF20}"],
                ["Visual Basic Scripting Support", "{4F645220-306D-11D2-995D-00C04F98BBC9}"],
                ["Wallet", "{1CDEE860-E95B-11CF-B1B0-00AA00BBAD66}"],
                ["Web Folders", "{73FA19D0-2D75-11D2-995D-00C04F98BBC9}"],
                ["Windows Desktop Update NT", "{89820200-ECBD-11CF-8B85-00AA005B4340}"],
                ["Windows Media Player RealNetwork Support", "{23064720-C4F8-11D1-994D-00C04F98BBC9}"],
                ["Windows Media Player", "{22D6F312-B0F6-11D0-94AB-0080C74C7E95}"],
                ["DirectAnimation Java Classes", "{4F216970-C90C-11D1-B5C7-0000F8051515}"],
                ["DirectAnimation", "{283807B5-2C60-11D0-A31D-00AA00B92C03}"],
                ["DirectShow", "{44BBA848-CC51-11CF-AAFA-00AA00B6015C}"],
                ["MediaPlayer9", "{6BF52A52-394A-11d3-B153-00C04F79FAA6}"],
                ["MediaPlayer6", "{22D6F312-B0F6-11D0-94AB-0080C74C7E95}"]
            ];
            var componentExists = function (cid) {
                return tempCompChecker.isComponentInstalled(cid, "ComponentID");
            };

            components.forEach(function (info) {
                if (componentExists(info[1])) result.push(info[0]);
            });

            document.body.removeChild(div);
            result.sort();

            return {
                result: result,
                raw: stringifyArray(result)
            };
        }
    },
    {
        name: "navigator_dump",
        detect: function (options) {
            if (typeof navigator === "undefined")
                return emptyDetection;

            var dump = membersOf(navigator);
            return {
                result: dump,
                raw: stringifyMembers(dump)
            };
        }
    },
    {
        name: "toolbar_dump",
        detect: function (options) {
            if (typeof toolbar === "undefined")
                return emptyDetection;

            var dump = membersOf(toolbar);
            return {
                result: dump,
                raw: stringifyMembers(dump)
            };
        }
    },
    {
        name: "crypto_dump",
        detect: function (options) {
            if (typeof crypto === "undefined")
                return emptyDetection;

            var dump = membersOf(crypto);
            return {
                result: dump,
                raw: stringifyMembers(dump)
            };
        }
    },
    {
        name: "window_dump",
        detect: function (options) {
            if (typeof window === "undefined")
                return emptyDetection;

            var dump = membersOf(window);
            return {
                result: dump,
                raw: stringifyMembers(dump)
            };
        }
    },
    {
        name: "document_dump",
        detect: function (options) {
            if (typeof document === "undefined")
                return emptyDetection;

            var dump = membersOf(document);
            return {
                result: dump,
                raw: stringifyMembers(dump)
            };
        }
    },
    {
        name: "style_dump",
        detect: function (options) {
            var div = document.createElement("div");
            var result = keysOf(div.style);
            result.sort();
            return {
                result: result,
                raw: stringifyArray(result)
            };
        }
    },
    {
        name: "error_messages",
        detect: function (options) {
            // We use eval to support IE6. Otherwise the file won't be interpreted
            var offendingFunctions = [
                function () {
                    // Accessing property of undefined object
                    eval("var something; var whatever = something.else;");
                },
                function () {
                    // Treating non-functions like functions
                    eval("var number = 42; number();");
                },
                function () {
                    // Using r-values instead of l-values
                    eval("var f = function () { return 0; }; f() = 1;");
                },
                function () {
                    // Serializing a circular reference
                    eval("var a = { }; var b = { a: a }; a.b = b; JSON.stringify(a);");
                },
                function () {
                    // Unexpected tokens
                    eval("var a = 1[");
                },
                function () {
                    // Infinitely recursive call
                    eval("var f = function () { f(); }; f();");
                }
            ];
            var diagnose = function (offendingFunction) {
                try {
                    offendingFunction();
                } catch (e) {
                    return errorOf(e);
                }
            };
            var result = offendingFunctions.map(function (f) {
                return diagnose(f);
            });

            return {
                result: result,
                raw: stringifyArray(result)
            };
        }
    },
    {
        name: "silverlight",
        detect: function (options) {
            var result = { installed: false, supported: false, versions: [] };
            var releasedVersions = [
                "5.1.41212", "5.1.41105", "5.1.40728", "5.1.40416", "5.1.30514",
                "5.1.30214", "5.1.20913", "5.1.20513", "5.1.20125", "5.1.10411", "5.0.61118", "5.0.60818",
                "5.0.60401", "4.1.10329", "4.1.10111", "4.0.60831", "4.0.60531", "4.0.60310", "4.0.60129",
                "4.0.51204", "4.0.50917", "4.0.50826", "4.0.50524", "4.0.50401", "3.0.50611", "3.0.50106",
                "3.0.40818", "3.0.40723", "3.0.40624", "2.0.40115", "2.0.31005", "1.0.30715", "1.0.30401",
                "1.0.30109", "1.0.21115", "1.0.20816"
            ];

            if (typeof Silverlight !== "undefined") {
                if (typeof Silverlight.isInstalled === "function") {
                    var installedVersions = releasedVersions.filter(Silverlight.isInstalled);
                    result.installed = (installedVersions.length > 0);
                    result.versions = installedVersions;
                }

                if (typeof Silverlight.supportedUserAgent === "function")
                    result.supported = Silverlight.supportedUserAgent();
            } else {
                try {
                    result.installed = navigator.plugins["Silverlight Plug-In"] ? true : false;
                } catch(whatever) { }
            }

            return {
                result: result,
                raw: stringifyObject(result)
            };
        }
    }
];

var asyncModules = [
    {
        name: "images_formats",
        detect: function (options, done) {
            var counter = 0;
            var result = [];
            var extensions = [
                ".bmp", ".fli", ".gif", ".ico", ".jpg", ".mng", ".pbm", ".pcx", ".pgm", ".png",
                ".ppm", ".tga", ".tif", ".xbm"
            ];
            var checkProgress = function () {
                if (++counter == extensions.length) {
                    done({
                        result: result,
                        raw: stringifyArray(result)
                    });
                }
            };

            extensions.forEach(function (ext) {
                var img = document.createElement("img");
                img.setAttribute("src", (options.imagesPath || "images/test") + ext);
                img.onload = function () {
                    result.push(ext);
                    document.body.removeChild(img);
                    checkProgress();
                };
                img.onerror = function () {
                    document.body.removeChild(img);
                    checkProgress();
                };
                document.body.appendChild(img);
            });
        }
    }
];

function snakeToPascal(str) {
    return str.split("_")
        .map(function (chunk) {
            if (chunk.length < 2)
                return chunk.charAt(0).toUpperCase();
            else
                return chunk.charAt(0).toUpperCase() + chunk.substring(1).toLowerCase();
        })
        .join("");
}

function stringifyArray(array) {
    return array.join(';');
}

function errorOf(e) {
    var error = "";

    if ('string' == typeof e)
        error = e;
    else if (e.message && ('string' == typeof e.message))
        error = e.message;
    else if (e.description && ('string' == typeof e.description))
        error = e.description;
    else if (e.toString && ('function' == typeof e.toString))
        error = e.toString();

    return error;
}

const getFingerprint = (done) => {
    Fingerprint2.get(defaultOptions, function (components) {
        // var values = components.map(function (component) { return component.value })
        // var murmur = Fingerprint2.x64hash128(values.join(''), 31)
        // AC.set("fp", murmur);
        // sendRequest(murmur, components);
        const options = defaultOptions
        getIPLocal(function (data) {
            if (data && data.location) {
                components.push({
                    key: 'location',
                    value: data.location
                })
            }
            var temp = "";

            // Execute all enabled synchronous modules
            syncModules.filter(function (syncModule) {
                return !options["exclude" + snakeToPascal(syncModule.name)];
            }).forEach(function (syncModule) {
                try {
                    var detection = syncModule.detect(options);
                    temp += detection.raw;
                    components.push({ key: syncModule.name, value: detection.result });
                } catch (e) {
                    var error = errorOf(e);
                    temp += error;
                    components.push({ key: syncModule.name, value: error });
                }
            });

            // This function simply calls the done callback with the actual
            // result of the detections
            var finalize = function () {
                var values = components.map(function (component) { return component.value })
                var murmur = Fingerprint2.x64hash128(values.join(''), 31)
                document.getElementById('result').innerHTML = murmur + '<br>' + Fingerprint2.x64hash128(temp, 31)
                // AC.set("fp", murmur);
                // sendRequest(murmur, components);
                // done(result + fp2.x64hash128(temp, 31), components);
            };

            var enabledAsyncModules = asyncModules.filter(function (asyncModule) {
                return !options["exclude" + snakeToPascal(asyncModule.name)];
            });

            if (enabledAsyncModules.length == 0) {
                finalize();
            } else {
                // Call all asynchronous modules sequentially through a sort of continuation
                var index = 0;
                var continuation = function (detection) {
                    temp += detection.raw;
                    components.push({ key: enabledAsyncModules[index].name, value: detection.result });

                    if (++index == enabledAsyncModules.length)
                        return finalize();

                    try {
                        enabledAsyncModules[index].detect(options, continuation);
                    } catch (e) {
                        var error = errorOf(e);
                        continuation({ result: error, raw: error });
                    }
                };

                try {
                    enabledAsyncModules[index].detect(options, continuation);
                } catch (e) {
                    var error = errorOf(e);
                    continuation({ result: error, raw: error });
                }
            }
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