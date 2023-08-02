

const oneAnswer = {}
const getOneAnswersState = (chatId) => {
    let userData = oneAnswer[chatId];
    if (!userData) {
        userData = {
            first:''
        }
        oneAnswer[chatId] = userData
    }
    return userData
}


const twoAnswers = {}
const getTwoAnswersState = (chatId) => {
    let userData = twoAnswers[chatId];
    if (!userData) {
        userData = {
            first:'',
            second:'',
        }
        twoAnswers[chatId] = userData
    }
    return userData
}

const threeAnswers = {}

const getThreeAnswersState = (chatId) => {
    let userData = threeAnswers[chatId];
    if (!userData) {
        userData = {
            first:'',
            second:'',
            third:'',
        }
        threeAnswers[chatId] = userData
    }
    return userData
}

const fourAnswers = {}

const getFourAnswersState = (chatId) => {
    let userData = fourAnswers[chatId];
    if (!userData) {
        userData = {
            first:'',
            second:'',
            third:'',
            fourth:''
        }
        fourAnswers[chatId] = userData
    }
    return userData
}

const resetAllAnswers = (chatId) => {
    const oneAnswerState=getOneAnswersState(chatId);
    oneAnswerState.first=''


    const twoAnswerState=getTwoAnswersState(chatId);
    twoAnswerState.first=''
    twoAnswerState.second=''

    const threeAnswerState=getThreeAnswersState(chatId);
    threeAnswerState.first=''
    threeAnswerState.second=''
    threeAnswerState.third=''

    const fourAnswerState=getFourAnswersState(chatId);
    fourAnswerState.first=''
    fourAnswerState.second=''
    fourAnswerState.third=''
    fourAnswerState.fourth=''
}

module.exports={
    resetAllAnswers,getFourAnswersState,getOneAnswersState,getThreeAnswersState,getTwoAnswersState
}