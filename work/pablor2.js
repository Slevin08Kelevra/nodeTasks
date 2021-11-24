const request = require('request')

const reposUrl = "https://bitbucket.biscrum.com/rest/api/1.0/projects/edpp/repos"
const pullsUrl = reposUrl + "/TARGET_REPO/pull-requests?state=merged"
const pullActivitiesUrl = reposUrl + "/TARGET_REPO/pull-requests/PULL_NUMBER/activities"
const startDate = new Date(2021, 10, 15).getTime()
let countPulls = 0

// simple countdown latch
function CDL(completion) {
    this.count = 0
    this.increase = function () {
        this.count++;
    }
    this.release = function () {
        if (--this.count < 1) completion();
    };
}

function doRequest(url, func) {
    var username = "pablo.paparini.ext@boehringer-ingelheim.com",
        password = "Alvaro01Costarica",
        url = url,
        auth = "Basic " + Buffer.from(username + ":" + password).toString("base64");

    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            func(body)
        }
    );
}

let notSameDay = 0
let membersLastApp = []
membersLastApp.pablo = { count: 0, timeAux: 0, delaySum: 0 }
membersLastApp.jordi = { count: 0, timeAux: 0, delaySum: 0 }
membersLastApp.alvaro = { count: 0, timeAux: 0, delaySum: 0 }
membersLastApp.jonathan = { count: 0, timeAux: 0, delaySum: 0 }
let approvalsStatistics = []

var latch = new CDL(function () {
    console.log(membersLastApp)
    //console.log(approvalsStatistics)
    const sum = approvalsStatistics.reduce((a, b) => {
        return {time: a.time + b.time}
    });
    const avg = (sum.time / approvalsStatistics.length) || 0;
    const max = approvalsStatistics.reduce((prev, current) => {
        return (prev.time > current.time) ? prev : current
    })
    console.log()
    console.log("AVG: " + secondsToDhms(avg / 1000))
    console.log("MAX: " + secondsToDhms(max.time / 1000) + " in PR: (" + max.pr + ")")
    console.log()
})

function getExtracActivity(title) {
    const extracActivity = (body) => {
        let acts = JSON.parse(body)
        let haveNeeded = acts.values.filter(act => {
            return act.action.match('MERGED|APPROVED|OPENED')
        })
        if (haveNeeded.length > 0) console.log(title)
        let lastApproverChecked = false
        let membersLastAppTemp
        let membersLastApprovals = []
        acts.values?.forEach(act => {
            if (act.action.match('MERGED|APPROVED|OPENED')) {
                let approver = act.user.name.split(".")[0];
                if (act.action === 'APPROVED' && !lastApproverChecked) {
                    lastApproverChecked = true
                    membersLastApp[approver].count++
                    membersLastApp[approver].timeAux = act.createdDate
                    membersLastAppTemp = membersLastApp[approver]
                }
                if (act.action === 'APPROVED') {
                    if (!membersLastApprovals[approver]) {
                        membersLastApprovals[approver] = act.createdDate
                    }
                }
                if (act.action === 'OPENED') {
                    membersLastAppTemp.delaySum += membersLastAppTemp.timeAux - act.createdDate
                    delete membersLastAppTemp

                    for (const mla in membersLastApprovals) {
                        let obj = {time: membersLastApprovals[mla] - act.createdDate, pr: title}
                        approvalsStatistics.push(obj)
                    }
                }

                console.log("    " + act.action + "  " + act.user.name.split(".")[0] + "  " + new Date(act.createdDate).toISOString().replace('T', ' ') + "  " + act.createdDate)
            }
        });
        latch.release()
    }
    return extracActivity
}

function getFilterPulls(repoName) {
    const filterPulls = (body) => {
        let pulls = JSON.parse(body)
        pulls.values.forEach(pull => {
            if (pull.createdDate >= startDate) {
                latch.increase()
                let urlAux = pullActivitiesUrl.replace("TARGET_REPO", repoName).replace("PULL_NUMBER", pull.id)
                doRequest(urlAux, getExtracActivity(pull.title))
            }
        })
        latch.release()
    }

    return filterPulls
}

const extracRepos = (body) => {
    let repos = JSON.parse(body)
    repos.values.forEach(repo => {
        latch.increase()
        doRequest(pullsUrl.replace("TARGET_REPO", repo.name), getFilterPulls(repo.name))
    });
}

doRequest(reposUrl, extracRepos)


function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}