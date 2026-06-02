/**
 * 广汽丰田bz APP
 * scriptVersionNow = "0.0.7"
 * cron 17 18 * * *  gqft.js
 * 23/01/23 积分任务：
 * 23/06/07 修复加密
 * 23/06/14 修复CK时效短 and CK失效快 的问题
 * 23/06/15 修复各种问题 适配IOS 修复青龙版本变量自动转换问题
 * 23/08/29 修改变量为请求头的Authorization
 * 24/03/25 COOKIES格式改 适应一天过期一次的API CK
 * ===== 青龙--配置文件 =====
 * # 项目名称  脚本所需JS依赖 crypto-js jsencrypt 缺一不可
 *  变量文件的名字为 gqft.json  变量文件的名字为 gqft.json  变量文件的名字为 gqft.json
 *  COOKIE改为文件模式 参考https://github.com/smallfawn/QLScriptPublic/blob/main/cookies/gqft.json
 *  只需要填每一项中的 enData和enKey即可 记得必须符合JSON格式 可以自行去验证
 *  本版本为测试版 如有BUG 及时联系 群 1021185005
 * enData和enKey是登录接口返回的响应  其他接口均不可以用 接口地址
 * 怎么抓登录包？ 退出账号! 打开抓包 登录账号 完毕后关闭抓包（短信登录）
 * https://gw.nevapp.gtmc.com.cn/ha/iam/api/sec/oauth/token
 * 例如 
 * [
    {
        "acToken": "",
        "rtToken": "",
        "enData":"axi....",
        "enKey":"Op9/OAvVPbIbb5reyq2TR0YB2PqvHbwq1nOqI6e2lSfWh5DYPV9dSmthwxak/Wp8utQ+ox01mGHL3G3JqNYxreSrGFe9qPHCsoRhD/ei0Q0mYQfr/LCJuWm+YwJKoemGnho6Pz6VHdxcarkVUxpa1j87wmOGr7clxXEhfXCCdM4lDrD1RSBlwLwKNAaLkId/JjrOZyyKnn43Pzuxbfgu0Kg+/8MpJ05L4gI9hqeTev6M63k7oVtyxVLiBYymzzfa7MZHj4M4SfD7owkpX5oLr2Uaps4t+H5KZjia3+Jy/l5/lFXw7am9DBsLBriKKgs1nV8wUC1gIz9L/jcU6IcDBA=="
    },
    {
        "acToken": "",
        "rtToken": "",
        "enData":"axisa....",
        "enKey":"Op9/OAvVPbIbb5reyq2TR0YB2PqvHbwq1nOqI6e2lSfWh5DYPV9dSmthwxak/Wp8utQ+ox01mGHL3G3JqNYxreSrGFe9qPHCsoRhD/ei0Q0mYQfr/LCJuWm+YwJKoemGnho6Pz6VHdxcarkVUxpa1j87wmOGr7clxXEhfXCCdM4lDrD1RSBlwLwKNAaLkId/JjrOZyyKnn43Pzuxbfgu0Kg+/8MpJ05L4gI9hqeTev6M63k7oVtyxVLiBYymzzfa7MZHj4M4SfD7owkpX5oLr2Uaps4t+H5KZjia3+Jy/l5/lFXw7am9DBsLBriKKgs1nV8wUC1gIz9L/jcU6IcDBA=="
    }
]
* 如果提示 TypeError:Cannot read properties of null (reading 'split') 那么则可以使用默认的enKey 
 */

global.self = global;
const $ = new Env("广汽丰田");
//const ckName = "gqft_data";


//-------------------- 一般不动变量区域 -------------------------------------
const { log } = require("console");
const Notify = 1; //0为关闭通知,1为打开通知,默认为1
const notify = $.isNode() ? require("./sendNotify") : "";
let envSplitor = ["&"]; //多账号分隔符
let msg = "";
let userList = [];
let userIdx = 0;
let userCount = 0;
let scriptVersionLatest; //最新版本
let scriptVersionNow = "0.0.6"; //现在版本
window = {};
//---------------------- 自定义变量区域 -----------------------------------
const CryptoJS = require("crypto-js");
const JSEncrypt = require("jsencrypt");
let appId_h5 = "a41022a5-ad1e-eb24-4fb4-7d1b7a7958f2"; //appId
let appKey_h5 = "52ae440d-8fec-5a8b-76ee-58eb6bea62f8"; //appSigSecret
let appId_android = "f31a4469-f9b9-4c10-2e97-bf2100a6d5a0"; //appId
let appKey_android = "29012175-8d3c-b89b-a61d-4ecf65ff2e3c"; //appSigSecret
//---------------------------------------------------------

async function start() {
    //await getVersion("smallfawn/QLScriptPublic/main/gqft.js");
    log('todoList:CK改变了 修复CK时效短 and CK失效快 的问题 修复refreshToken已改变问题\nupdate:IOS适配 尽可能青龙高版本适配')
    log("tips:可能有未知的BUG,如果遇到请截图和发送自己的CK给github lssues或者加群发给管理")
    log(`\n====== 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ======`);
    //await getNotice();
    taskall = [];
    /*for (let user of userList) {
        //taskall.push(await user.getToken());
        await $.wait(1000);
    }
    await Promise.all(taskall);*/
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.decrypt());
            await $.wait(1000);
        }
    }
    await Promise.all(taskall);
    log("\n================== 用户信息 ==================\n");
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.user_info());
            await $.wait(1000);
        }
    }
    await Promise.all(taskall);

    log("\n================== 执行任务 ==================\n");
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.task_signin());
            await $.wait(1000);
        }
    }
    await Promise.all(taskall);
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.art_list());
            await $.wait(1000);
        }
    }
    await Promise.all(taskall);
}

class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        //this.ck = str.split("&")[0];
        //log(this.ck)
        this.ckStatus = true;
        this.nickname = null;
        this.User_encryptData = ""
        this.User_encryptKey = ""
        this.deEnData = ""
        this.deEnDataKey = ""
        this.deEnDataIv = ""
        this.User_Data = ""
        this.enData = str.split("#")[0]
        this.enKey = str.split("#")[1]
        this.User_AccessToken = null;
        this.User_RefreshToken = null
        this.isChange = false
        this.headerGet_h5 = {};
    }
    getNonce(type) {
        return type === "h5"
            ? Array.from({ length: 6 }, () =>
                Math.floor(Math.random() * 36).toString(36)
            ).join("")
            : type === "android"
                ? Math.floor(Math.random() * 900000) + 100000
                : "";
    }
    async decrypt() {
        let key = getRSADecryptResult_android(this.enKey)
        //console.log(key)
        let aesDekey, aesDeiv;
        if (!key) {
            // RSA 解密失败，使用默认 key/iv（脚本注释提到的 fallback）
            aesDekey = 'ajgekbmgfkasefqk';
            aesDeiv = 'cd1d955be8e4c11a';
        } else {
            aesDekey = key.split("@DS@")[0];
            aesDeiv = key.split("@DS@")[1];
        }
        let result = AES_CBC_Decrypt(this.enData, aesDekey, aesDeiv);
        if (result && "body" in result) {
            this.User_AccessToken = result.body.accessToken
            this.User_RefreshToken = result.body.refreshToken
            let data = await readFile()
            // 假设您有一个名为data的数组
            let modifiedData = data.map(item => {
                if (item.enKey == this.enKey) {
                    return { ...item, acToken: result.body.accessToken, rfToken: result.body.refreshToken }; // 修改属性值
                } else {
                    return item; // 不需要修改的项直接返回
                }
            });
            let res = await writeFile(modifiedData)
        }
    }
    getHeadersPost_android() {
        let ts = Date.now()
        let nonce = this.getNonce("android");
        return {
            //'Connection': 'Keep-Alive',
            //'Content-Length': 402,
            operateSystem: "android",
            appVersion: "1.4.4",
            nonce: nonce,
            "Content-Type": "application/json",
            "User-Agent": "okhttp/4.8.1",
            appId: appId_android,
            Accept: "application/json",
            Referer:
                "https://app.nevapp.gtmc.com.cn/h5/pages/mine/task?noAutoSign=true",
            //'Accept-Encoding': 'gzip',
            "timestamp": ts,
            "Authorization": "Bearer " + this.User_AccessToken,
            'sig': CryptoJS.MD5(
                ts +
                this.User_AccessToken +
                nonce +
                appId_android +
                appKey_android
            ).toString()
        };
    }
    getHeadersGet_android() {
        let ts = Date.now()
        let nonce = this.getNonce("android");
        return {
            //'Connection': 'Keep-Alive',
            operateSystem: "android",
            appVersion: "1.4.4",
            nonce: nonce,
            "User-Agent": "okhttp/4.8.1",
            appId: appId_android,
            Accept: "application/json",
            //'Referer': 'https://app.nevapp.gtmc.com.cn/h5/pages/mine/task?noAutoSign=true',
            //'Accept-Encoding': 'gzip',
            "timestamp": ts,
            "Authorization": "Bearer " + this.User_AccessToken,
            'sig': CryptoJS.MD5(
                ts +
                this.User_AccessToken +
                nonce +
                appId_android +
                appKey_android
            ).toString()
        }
    }
    getHeadersPost_h5() {
        let ts = Date.now()
        let nonce = this.getNonce("h5");
        return {
            Connection: "keep-alive",
            //'Content-Length': 402,
            operateSystem: "h5",
            nonce: nonce,
            "Content-Type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 BundleId/com.gtmc.nevapp DSApp/1.4.4 StatusBarHeight/30 BottomBarHeight/0",
            appId: appId_h5,
            Accept: "*/*",
            Origin: "https://app.nevapp.gtmc.com.cn",
            "X-Requested-With": "com.gtmc.nevapp",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer:
                "https://app.nevapp.gtmc.com.cn/h5/pages/mine/task?noAutoSign=true",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "timestamp": ts,
            "Authorization": "Bearer " + this.User_AccessToken,
            'sig': CryptoJS.MD5(
                ts +
                this.User_AccessToken +
                nonce +
                appId_h5 +
                appKey_h5
            ).toString()
        }
    }
    getHeadersGet_h5() {
        let ts = Date.now()
        let nonce = this.getNonce("h5");
        return {
            Connection: "keep-alive",
            operateSystem: "h5",
            nonce: nonce,
            "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 BundleId/com.gtmc.nevapp DSApp/1.4.4 StatusBarHeight/30 BottomBarHeight/0",
            appId: appId_h5,
            Accept: "*/*",
            Origin: "https://app.nevapp.gtmc.com.cn",
            "X-Requested-With": "com.gtmc.nevapp",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer:
                "https://app.nevapp.gtmc.com.cn/h5/pages/mine/task?noAutoSign=true",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "timestamp": ts,
            "Authorization": "Bearer " + this.User_AccessToken,
            'sig': CryptoJS.MD5(
                ts +
                this.User_AccessToken +
                nonce +
                appId_h5 +
                appKey_h5
            ).toString()
        }
    }
    async getToken() {  //初次获取token
        //log(this.ck)
        this.ck = this.ck.replaceAll('/u003d', "="); // 把ASCII码为61的字符替换为等号

        if ('QL_BRANCH' in process.env) {
            //log(`是青龙环境`)
            if (!compareVersion(process.env['QL_BRANCH']) || process.env['QL_BRANCH'] == 'master') { //如果小于返回true !true为false !false为 true
                //log(`版本大于15.0`)
                let regexp = new RegExp('\\\\', 'g');
                this.ck = this.ck.replace(regexp, '/');
            }
        }
        //log(this.ck)

        try {
            this.ck = JSON.parse(this.ck);
        } catch (e) {
            this.ck = this.ck
        }

        this.User_encryptData = this.ck["encryptData"]
        this.User_encryptKey = this.ck["encryptKey"]
        //log(this.User_encryptKey)
        this.deEnData = getRSADecryptResult_android(this.User_encryptKey)
        //log( this.deEnData)
        if (!this.deEnData) {
            this.deEnDataKey = 'ajgekbmgfkasefqk'
            this.deEnDataIv = "cd1d955be8e4c11a"
            this.User_Data = AES_CBC_Decrypt(this.User_encryptData, this.deEnDataKey, this.deEnDataIv)
            this.User_AccessToken = this.User_Data["body"]['accessToken']
            this.User_RefreshToken = this.User_Data["body"]['refreshToken']
            await this.refresh_token()
        } else {
            //log(this.deEnData)
            this.deEnDataKey = this.deEnData.split("@DS@")[0];
            this.deEnDataIv = this.deEnData.split("@DS@")[1];
            this.User_Data = AES_CBC_Decrypt(this.User_encryptData, this.deEnDataKey, this.deEnDataIv)
            this.User_AccessToken = this.User_Data["body"]['accessToken']
            this.User_RefreshToken = this.User_Data["body"]['refreshToken']
            await this.refresh_token()
        }

    }

    async user_info() {
        try {
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/lgn/user/getLoginUserInfo`,
                headers: this.getHeadersGet_h5(),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result && result.header && result.header.code == 10000000) {
                DoubleLog(`账号[${this.index}]  欢迎用户: [${result.body.baseInfo.nickname}]🎉`);
                this.ckStatus = true;
                this.nickname = result.body.baseInfo.nickname
            } else if (result && result.header && result.header.code == 10001007) {
                DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因Token过期，现在即将刷新token！`);
                await this.refresh_token()
                this.ckStatus = false;
                console.log(result);
            } else if (result && result.header && result.header.code == 10009999) {
                DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因refreshToken已改变,请重新获取CK！`);
                this.ckStatus = false;
            } else {
                DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因未知！`);
                this.ckStatus = false;
                if (result) console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }


    /**
     * 签到
     */
    async task_signin() {
        try {
            let YO = `${KO()}@DS@${KO()}`;
            let key = YO.split("@DS@")[0];
            let iv = YO.split("@DS@")[1];
            /*console.log(YO);
                  log(key)
                  log(iv)*/
            let bodydata = {};
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/marketing/lgn/task/sec/signin`,
                headers: this.getHeadersPost_h5(),
                body: JSON.stringify({
                    encryptKey: getRSAEncryptResult(YO),
                    encryptData: AES_CBC_Encrypt(bodydata, key, iv),
                }),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result && "encryptData" in result) {
                let rsaDeData = result.encryptKey;
                let rsaDeResult = getRSADecryptResult(rsaDeData);
                let aesDeData = result.encryptData;
                let aesDekey = rsaDeResult.split("@DS@")[0];
                let aesDeiv = rsaDeResult.split("@DS@")[1];
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv);
                if ((deResult.header.code = "10000000")) {
                    DoubleLog(`账号[${this.index}]  签到: ${deResult.header.message}🎉`);
                } else {
                    DoubleLog(`账号[${this.index}]  签到: ${deResult.header.message}`);
                }
            } else {
                DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因未知！`);
                if (result) console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 阅读
     * @param {*} artId
     */
    async task_read(artId) {
        try {
            let YO = `${KO()}@DS@${KO()}`;
            let key = YO.split("@DS@")[0];
            let iv = YO.split("@DS@")[1];
            /*console.log(YO);
                  log(key)
                  log(iv)*/
            let bodydata = { postId: artId };
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/sec/post/detail`,
                headers: this.getHeadersPost_h5(),
                body: JSON.stringify({
                    encryptKey: getRSAEncryptResult(YO),
                    encryptData: AES_CBC_Encrypt(bodydata, key, iv),
                }),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result && "encryptData" in result) {
                let rsaDeData = result.encryptKey;
                let rsaDeResult = getRSADecryptResult(rsaDeData);
                let aesDeData = result.encryptData;
                let aesDekey = rsaDeResult.split("@DS@")[0];
                let aesDeiv = rsaDeResult.split("@DS@")[1];
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv);
                if ((deResult.header.code = "10000000")) {
                    DoubleLog(
                        `账号[${this.index}]  阅读文章: ${deResult.header.message}🎉`
                    );
                } else {
                    DoubleLog(
                        `账号[${this.index}]  阅读文章: ${deResult.header.message}`
                    );
                }
            } else {
                DoubleLog(`账号[${this.index}]  阅读文章:失败 ❌ 了呢,原因未知！`);
                if (result) console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 点赞帖子
     */
    async task_like(artId) {

        try {
            let YO = `${KO()}@DS@${KO()}`;
            let key = YO.split("@DS@")[0];
            let iv = YO.split("@DS@")[1];
            /*console.log(YO);
                  log(key)
                  log(iv)*/
            let bodydata = { subjectId: artId, subjectType: "POST" };
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/lgn/sec/user/like`,
                headers: this.getHeadersPost_h5(),
                body: JSON.stringify({
                    encryptKey: getRSAEncryptResult(YO),
                    encryptData: AES_CBC_Encrypt(bodydata, key, iv),
                }),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log('点赞得结果',result);
            if (result && "encryptData" in result) {
                let rsaDeData = result.encryptKey;
                let rsaDeResult = getRSADecryptResult(rsaDeData);
                let aesDeData = result.encryptData;
                let aesDekey, aesDeiv;
                if (!rsaDeResult) {
                    aesDekey = 'ajgekbmgfkasefqk';
                    aesDeiv = 'cd1d955be8e4c11a';
                } else {
                    aesDekey = rsaDeResult.split("@DS@")[0];
                    aesDeiv = rsaDeResult.split("@DS@")[1];
                }
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv);
                if (deResult && deResult.header && deResult.header.code == "10000000") {
                    DoubleLog(
                        `账号[${this.index}]  点赞文章: ${deResult.header.message}🎉`
                    );
                } else {
                    let msg = deResult && deResult.header ? deResult.header.message : '解密失败或响应异常';
                    DoubleLog(
                        `账号[${this.index}]  点赞文章: ${msg}`
                    );
                }
            } else {
                DoubleLog(`账号[${this.index}]  点赞文章:失败 ❌ 了呢,原因未知！`);
                if (result) console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 分享
     */
    async task_share(artId) {
        try {
            let YO = `${KO()}@DS@${KO()}`;
            let key = YO.split("@DS@")[0];
            let iv = YO.split("@DS@")[1];
            /*console.log(YO);
                  log(key)
                  log(iv)*/
            let bodydata = { subjectId: artId, subjectType: "POST" };
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/lgn/sec/user/forward`,
                headers: this.getHeadersPost_h5(),
                body: JSON.stringify({
                    encryptKey: getRSAEncryptResult(YO),
                    encryptData: AES_CBC_Encrypt(bodydata, key, iv),
                }),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result && "encryptData" in result) {
                let rsaDeData = result.encryptKey;
                let rsaDeResult = getRSADecryptResult(rsaDeData);
                let aesDeData = result.encryptData;
                let aesDekey = rsaDeResult.split("@DS@")[0];
                let aesDeiv = rsaDeResult.split("@DS@")[1];
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv);
                if ((deResult.header.code = "10000000")) {
                    DoubleLog(
                        `账号[${this.index}]  分享文章: ${deResult.header.message}🎉`
                    );
                } else {
                    DoubleLog(
                        `账号[${this.index}]  分享文章: ${deResult.header.message}`
                    );
                }
            } else {
                DoubleLog(`账号[${this.index}]  分享文章:失败 ❌ 了呢,原因未知！`);
                if (result) console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 帖子列表
     *
     */
    async art_list() {
        try {
            let bodydata = { queryPostType: "NEWEST", pageNo: 1, pageSize: 20 };
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/post/page`,
                headers: this.getHeadersPost_h5(),
                body: JSON.stringify(bodydata),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result && result.header && result.header.code == "10000000") {
                for (let i = 0; i < 10; i++) {
                    DoubleLog(`账号[${this.index}]  文章 [${result.body.list[i].id}]`);
                    let artId = result.body.list[i].id;
                    //DoubleLog('开始浏览')
                    await $.wait(5000);
                    await this.task_read(artId);
                    //DoubleLog('开始点赞')
                    await $.wait(5000);
                    await this.task_like(artId);
                    //DoubleLog('开始分享')
                    await $.wait(5000);
                    await this.task_share(artId);
                }
            } else {
                DoubleLog(`账号[${this.index}] 获取帖子列表:失败 ❌ 了呢,原因未知！`);
                if (result) console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async refresh_token() {
        let headers = this.getHeadersPost_android()
        headers['DeviceId'] = '417d0945-b207-44ea-b185-c5673d268b81'
        //headers["RegistrationID"] = '1a0018970bbcc32a71a'
        try {
            let YO = `${KO()}@DS@${KO()}`
            let key = YO.split('@DS@')[0]
            let iv = YO.split('@DS@')[1]
            //console.log(YO);
            //log(key)
            //log(iv)
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/ha/iam/api/lgn/sec/checkAndUpdateToken`,
                headers: headers,
                body: JSON.stringify({ "encryptKey": getRSAEncryptResult(YO), "encryptData": AES_CBC_Encrypt({ "refreshToken": this.User_RefreshToken }, key, iv) })
            }, result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if ("encryptData" in result) {
                let rsaDeData = result.encryptKey;
                let rsaDeResult = getRSADecryptResult_android(rsaDeData);
                //log(rsaDeResult)
                let aesDeData = result.encryptData;
                let aesDekey = rsaDeResult.split("@DS@")[0];
                let aesDeiv = rsaDeResult.split("@DS@")[1];
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv);
                //log(deResult)
                if (deResult.header.code == "10000000") {
                    // 假设您有一个名为data的数组
                    let data = await readFile()
                    let newData = data.filter(item => item.enKey !== this.enKey);

                    this.User_AccessToken = deResult["body"]["accessToken"]
                    this.User_RefreshToken = deResult["body"]["refreshToken"]

                    newData.push({ acToken: this.User_AccessToken, rfToken: this.User_RefreshToken, enData: result.encryptData, enKey: result.encryptKey })
                    let writeResult = await writeFile(newData)
                    if (writeResult) {
                        console.log(`刷新CK && 写入文件成功`)
                        await this.user_info()
                        await this.task_signin()
                        await this.art_list()
                    } else {
                        console.log(`刷新CK && 写入文件失败`)
                    }
                    this.ckStatus = true
                } else {
                    this.ckStatus = false
                }
            } else {
                this.ckStatus = false
            }
        } catch (e) {
            console.log(e);
        }
    }
}
function readFile() {
    const fs = require('fs');
    let file = fs.existsSync("./gqft.json");
    if (!file) { console.log("./gqft.json" + "文件不存在"); return [] }
    return new Promise((resolve, reject) => {
        fs.readFile('./gqft.json', 'utf8', function (err, data) {
            if (err) {
                reject(err);
            } else {
                try {
                    data = JSON.parse(data);
                } catch (error) {

                }
                resolve(data);
            }
        });
    });
}
function writeFile(data) {
    const fs = require('fs');
    return new Promise((resolve, reject) => {
        fs.writeFile("./gqft.json", JSON.stringify(data, null, 2), (err) => {
            if (err) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

!(async () => {
    if (!(await checkEnv())) return;

    if (userList.length > 0) {
        await start();
    }
    await SendMsg(msg);
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

//********************************************************
// 变量检查与处理
async function checkEnv() {
    let arr = await readFile()
    //console.log(arr)

    if (arr && arr.length <= 0) return console.log("未找到CK")
    let tmp = []

    for (let i of arr) {

        tmp.push(`${i.enData}#${i.enKey}`)
    }
    let userCookie = tmp.join("&");
    if (userCookie) {
        //console.log(userCookie);
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
        userCount = userList.length;
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${userCount}个账号`), true; //true == !0
}
/////////////////////////////////////////////////////////////////////////////////////
function httpRequest(options, method) {
    method = options.method
        ? options.method.toLowerCase()
        : options.body
            ? "post"
            : "get";
    return new Promise((resolve) => {
        $[method](options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${method}请求失败`);
                    $.logErr(err);
                    if (err.response && err.response.body) {
                        console.log("服务器返回:", err.response.body);
                    }
                } else {
                    if (data) {
                        typeof JSON.parse(data) == "object"
                            ? (data = JSON.parse(data))
                            : (data = data);
                        resolve(data);
                    } else {
                        console.log(`请求api返回数据为空，请检查自身原因`);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
/**
 * 判断版本号是否小于 V2.15.0 小于返回true
 * @param {*} version 
 * @returns 
 */
function compareVersion(version) {
    const currentVersion = 'v2.12.2';
    const current = currentVersion.substring(1).split('.');
    const target = version.substring(1).split('.');
    for (let i = 0; i < current.length; i++) {
        const c = parseInt(current[i]);
        const t = parseInt(target[i] || 0);
        if (c > t) {
            return true;
        } else if (c < t) {
            return false;
        }
    }
    return false;
}
/**
 * 16位随机数
 * @returns
 */
function KO() {
    let e = Math.random().toString(36).substr(2);
    for (; e.length < 16;) e += Math.random().toString(36).substr(2);
    return (e = e.substr(0, 16)), e;
}
function AES_CBC_Encrypt(data, key, iv) {
    key = CryptoJS.enc.Utf8.parse(key);
    iv = CryptoJS.enc.Utf8.parse(iv);
    if ("object" == typeof data)
        try {
            data = JSON.stringify(data);
        } catch (r) {
            console.log("encrypt error:", r);
        }
    data = CryptoJS.enc.Utf8.parse(data);
    //console.log(data);
    return CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).ciphertext.toString(CryptoJS.enc.Base64);
}

//逆向参数url https://app.nevapp.gtmc.com.cn/h5/assets/index.a0bf569f.js




function getRSAEncryptResult(data) {
    window = {};
    let crypt = new JSEncrypt();
    let publicKey =
        "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA49jxpFBAoEslNYrHb0wT8nCpGBn3hvjgToNkp7lFpsSeRS7WbHoFJEvmf1U83cHrbTzRFRowPft/FGBw6/6dZc