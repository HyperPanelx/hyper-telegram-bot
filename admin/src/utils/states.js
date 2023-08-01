

const oneQuestion = {
    key:null,
    first:false
}


const twoQuestion = {
  key:null,
  first:false,
  second:false,
}
const threeQuestion = {
    key:null,
    first:false,
    second:false,
    third:false,
}

const fourQuestion = {
    key:null,
    first:false,
    second:false,
    third:false,
    fourth:false
}

const resetAllStates = () => {
    oneQuestion.first=false
    oneQuestion.key=null

    twoQuestion.key=null
    twoQuestion.first=false
    twoQuestion.second=false

    threeQuestion.key=null
    threeQuestion.first=false
    threeQuestion.second=false
    threeQuestion.third=false

    fourQuestion.key=null
    fourQuestion.first=false
    fourQuestion.second=false
    fourQuestion.third=false
    fourQuestion.fourth=false

}

module.exports={
    oneQuestion,
    twoQuestion,
    threeQuestion,
    fourQuestion,
    resetAllStates
}