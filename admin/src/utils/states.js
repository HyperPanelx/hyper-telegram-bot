

const oneQuestion = {}
const getOneQuestionState = (chatId) => {
    let userData = oneQuestion[chatId];
    if (!userData) {
        userData = {
            key:null,
            first:false
        }
        oneQuestion[chatId] = userData
    }
    return userData
}


const twoQuestion = {}

const getTwoQuestionState = (chatId) => {
    let userData = twoQuestion[chatId];
    if (!userData) {
        userData = {
            key:null,
            first:false,
            second:false,
        }
        twoQuestion[chatId] = userData
    }
    return userData
}

const threeQuestion = {}
const getThreeQuestionState = (chatId) => {
    let userData = threeQuestion[chatId];
    if (!userData) {
        userData = {
            key:null,
            first:false,
            second:false,
            third:false,
        }
        threeQuestion[chatId] = userData
    }
    return userData
}

const fourQuestion = {}

const getFourQuestionState = (chatId) => {
    let userData = fourQuestion[chatId];
    if (!userData) {
        userData = {
            key:null,
            first:false,
            second:false,
            third:false,
            fourth:false
        }
        fourQuestion[chatId] = userData
    }
    return userData
}

const fiveQuestion = {}

const getFiveQuestionState = (chatId) => {
    let userData = fiveQuestion[chatId];
    if (!userData) {
        userData = {
            key:null,
            first:false,
            second:false,
            third:false,
            fourth:false,
            fifth:false
        }
        fiveQuestion[chatId] = userData
    }
    return userData
}

const resetAllStates = (chatId) => {
    const oneQuestionState = getOneQuestionState(chatId)
    oneQuestionState.key=null
    oneQuestionState.first=null

    const twoQuestionState=getTwoQuestionState(chatId);
    twoQuestionState.key=null
    twoQuestionState.first=false
    twoQuestionState.second=false

    const threeQuestionState=getThreeQuestionState(chatId)
    threeQuestionState.key=null
    threeQuestionState.first=false
    threeQuestionState.second=false
    threeQuestionState.third=false

    const fourQuestionState=getFourQuestionState(chatId)
    fourQuestionState.key=null
    fourQuestionState.first=false
    fourQuestionState.second=false
    fourQuestionState.third=false
    fourQuestionState.fourth=false

    const fiveQuestionState=getFiveQuestionState(chatId)
    fiveQuestionState.key=null
    fiveQuestionState.first=false
    fiveQuestionState.second=false
    fiveQuestionState.third=false
    fiveQuestionState.fourth=false
    fiveQuestionState.fifth=false

}

module.exports={
    resetAllStates,getFourQuestionState,getTwoQuestionState,getOneQuestionState,getThreeQuestionState,getFiveQuestionState
}