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

    if (msg.author.bot) {
        return;
    }

    if (msg.channel.name !== '로동') {
        return;
    }

    try {
        if (currentMessage === WORKING_BOT_START_WORD) {
            msg.reply(MessageScript.workingBot.start);
            return;
        }

        const history = await fetchHistory(client, msg.channelId); 
        
        if (history[0].startsWith("Error:")) {
            throw Error(RESTART_MESSAGE);
        }

        if (history[0] === WORKING_BOT_START_WORD) {
            const [level, startExp] = currentMessage.split('/');
            firstStepRequestValidate(+level, +startExp)
            msg.reply(MessageScript.workingBot.end)
            return
        }

        if (history[1] === WORKING_BOT_START_WORD) {
            const endExp = +currentMessage.trim();
            const [level, startExp] = history[0].split('/');
            secondStepRequestValidate(+endExp)

            const totalExp =  Math.round((endExp - startExp) * 10000) / 10000;
            const workingValue = Math.round((totalExp / (WorkingValueData[level] / 2)) * 100) / 100;
            const totalPrice = WorkingValueData.moneyPerHour * workingValue;
            const replyMessage = `총 획득 경험치: ${totalExp} \n` + `환산 비율: ${workingValue}`
            + `\n계산식: 환산 비율 * 3000원`    
            + `\n :money_with_wings: 금액: ${Math.round((totalPrice / 100) * 100)}`
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
    const history = (await channel.messages.fetch({ limit: 5 }))
        .filter(msg => !msg.author.bot || (msg.author.bot && msg.content.startsWith("Error:")))
        .map(msg => msg.content);

    history.shift();

    return history;
}


function firstStepRequestValidate(level, startExp) {
    if (isNaN(level)) {
        throw Error("레벨은 숫자로 입력해주세요." + FAIL_MESSAGE + RESTART_MESSAGE)
    }

    if (isNaN(startExp)) {
        throw Error("경험치는 숫자로 입력해주세요." + FAIL_MESSAGE + RESTART_MESSAGE)
    }

    if (level < 258 && level > 275) {
        throw Error("레벨 입력 범위는 258 ~ 275 입니다." + FAIL_MESSAGE + RESTART_MESSAGE)
    }

    if (startExp < 0 && startExp > 100) {
        throw Error("경험치 입력 범위는 0 ~ 100 입니다." + FAIL_MESSAGE + RESTART_MESSAGE)
    }
}

function secondStepRequestValidate(endExp) {
    if (isNaN(endExp)) {
        throw Error("경험치는 숫자로 입력해주세요." + RESTART_MESSAGE)
    }

    if (endExp < 0 && endExp > 100) {
        throw Error("경험치 입력 범위는 0 ~ 100 입니다." + RESTART_MESSAGE)
    }
}