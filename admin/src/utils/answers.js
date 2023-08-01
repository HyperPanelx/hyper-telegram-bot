

const oneAnswer = {
    first:''
}


const twoAnswers = {
    first:'',
    second:'',
}

const threeAnswers = {
    first:'',
    second:'',
    third:'',
}

const fourAnswers = {
    first:'',
    second:'',
    third:'',
    fourth:''
}

const resetAllAnswers = () => {
    oneAnswer.first=''


    twoAnswers.first=''
    twoAnswers.second=''


    threeAnswers.first=''
    threeAnswers.second=''
    threeAnswers.third=''

    fourAnswers.first=''
    fourAnswers.second=''
    fourAnswers.third=''
    fourAnswers.fourth=''

}

module.exports={
    oneAnswer,
    twoAnswers,
    threeAnswers,
    fourAnswers,
    resetAllAnswers
}