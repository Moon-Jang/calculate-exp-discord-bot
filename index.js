const AppCinfig = require("./AppConfig.js")
const MessageScript = require("./MessageScript.js")
const { Client } = require('discord.js');
const WorkingValueData = require("./WorkingValueData.js");
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] })

const WORKING_BOT_START_WORD = "$정산";
const FAIL_MESSAGE = "\n 입력에 실패하셨습니다. \n";
const RESTART_MESSAGE =  "`" + WORKING_BOT_START_WORD + "`" + "을 입력하여 재시작해주세요."

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (msg) => {
    const currentMessage = msg.content;
    const permitChannel = ['로동', '테스트']

    if (msg.author.bot) {
        return;
    }

    if (!permitChannel.includes(msg.channel.name)) {
        return;
    }

    try {
        if (currentMessage === WORKING_BOT_START_WORD) {
            msg.reply(MessageScript.workingBot.welcome);
            return;
        }

        const history = await fetchHistory(client, msg.channelId); 
        
        if (history[0].startsWith("Error:")) {
            throw Error(RESTART_MESSAGE);
        }

        if (history[0] === WORKING_BOT_START_WORD) {
            const level = +currentMessage.trim();
            zeroStepRequestValidate(level)
            msg.reply(MessageScript.workingBot.startExp)
            return
        }

        if (history[1] === WORKING_BOT_START_WORD) {
            const startExp = +currentMessage.trim();
            firstStepRequestValidate(startExp)
            msg.reply(MessageScript.workingBot.endExp)
            return
        }

        if (history[2] === WORKING_BOT_START_WORD) {
            const level = +history[1];
            const startExp = +history[0];
            const endExp = +currentMessage.trim();
            
            secondStepRequestValidate(+endExp)
            
            const t = endExp - startExp < 0 ?
                        (100 + endExp) - startExp : endExp - startExp;
            const totalExp =  Math.round((t) * 10000) / 10000;
            const workingValue = Math.round(totalExp / WorkingValueData[level] * 100) / 100;
            const totalPrice = Math.round((WorkingValueData.moneyPerHour * workingValue) / 100) * 100;
            const replyMessage = MessageScript.workingBot.result(totalExp, workingValue, totalPrice)
            
            msg.reply(replyMessage)
            return
        }

        throw Error("알수 없는 명령어 입니다. \n" + RESTART_MESSAGE)
    } catch (e) {
        msg.reply(e.toString());
    }

})

client.login(AppCinfig.workingBot.token);

async function fetchHistory(client, channelId) {
    const channel = client.channels.cache.get(channelId)
    const history = (await channel.messages.fetch({ limit: 7 }))
        .filter(msg => !msg.author.bot || (msg.author.bot && msg.content.startsWith("Error:")))
        .map(msg => msg.content);

    history.shift();

    return history;
}


function zeroStepRequestValidate(level) {
    if (isNaN(level)) {
        throw Error("레벨은 숫자로 입력해주세요." + FAIL_MESSAGE + RESTART_MESSAGE)
    }
    if (level < 258 || level > 275) {
        throw Error("레벨 입력 범위는 258 ~ 275 입니다." + FAIL_MESSAGE + RESTART_MESSAGE)
    }
}

function firstStepRequestValidate(startExp) {
    if (isNaN(startExp)) {
        throw Error("경험치는 숫자로 입력해주세요." + FAIL_MESSAGE + RESTART_MESSAGE)
    }

    if (startExp < 0 || startExp > 100) {
        throw Error("경험치 입력 범위는 0 ~ 100 입니다." + FAIL_MESSAGE + RESTART_MESSAGE)
    }
}

function secondStepRequestValidate(endExp) {
    if (isNaN(endExp)) {
        throw Error("경험치는 숫자로 입력해주세요." + FAIL_MESSAGE + RESTART_MESSAGE)
    }

    if (endExp < 0 || endExp > 100) {
        throw Error("경험치 입력 범위는 0 ~ 100 입니다." + FAIL_MESSAGE + RESTART_MESSAGE)
    }
}