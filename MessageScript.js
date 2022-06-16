const calculateStartMessage = 
`오늘 하루도 열심히 일하셨군요! :smiley:
정산을 시작합니다. \n\n`

const levelAndStartExpMessage = 
`:flag_white: 시작 레벨과 시작 경험치를 입력해주세요.
EX) 258/5.234`

const endExpMessage = 
`:flag_white: 종료 경험치를 입력해주세요.
EX) 13.599
`

const MessageScript = {
    workingBot: {
        start: calculateStartMessage + levelAndStartExpMessage,
        end: endExpMessage
    }
}


module.exports = MessageScript