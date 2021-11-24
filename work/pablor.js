var request = require('request'),
    username = "pablo.paparini.ext@boehringer-ingelheim.com",
    password = "Alvaro01Costarica",
    url = "https://bitbucket.biscrum.com/rest/audit/1.0/projects/EDPP/events?from=2021-10-23&limit=10000&start=0",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

request(
    {
        url : url,
        headers : {
            "Authorization" : auth
        }
    },
    function (error, response, body) {
        let b = JSON.parse(body)
        
        // month -1 to get actual month
        let startDate = new Date(2021, 10, 15).getTime()
        const participants = ['pablo', 'alvaro', 'jordi', 'jonathan']
        
        let reqOpened = b.values.filter(value => {
            return value.action.toLowerCase() == "pull request opened" && value.timestamp >= startDate
        }).map(req => {
            let details = JSON.parse(req.details)
            return {id: details.id, time: req.timestamp, member: req.user.name}
        })

        let reqMerged = b.values.filter(value => {
            return value.action.toLowerCase() == "pull request merged" && value.timestamp >= startDate
        }).map(req => {
            return {id: JSON.parse(req.details).id, time: req.timestamp}
        })

        let appByPart = b.values.filter(value => {
            return value.action.toLowerCase() == "pull request approved by participant" && value.timestamp >= startDate
        }).map(req => {
            let details = JSON.parse(req.details)
            return {id: details.id, time: req.timestamp, member: details.participant}
        })

        //if all pr are closed same day
        reqMerged.filter(prMerged => {
            let openedTime = reqOpened.find(req => req.id == prMerged.id)
        })

        reqMerged.forEach(merged => {
            let openedTime = reqOpened.find(req => req.id == merged.id)
            //let diff = merged.time - openedTime.time
            //console.log(diff)
            if (merged.time - openedTime.time > 86400){ // one day in seconds
               let mergeApprovals = appByPart.filter(approved => {
                   return approved.id == merged.id
               })
            
            let mergeApprovers = mergeApprovals.map(m => m.member)
            let missing = participants.filter(participant => {
                return mergeApprovers.toString().includes(participant)
            })

            //faltaria chequear si alguien no aprobo, y si no falta nadie  sumar puntos al quien sea el último. 

            }
        });
        //const unique = [...new Set(appByPart.map(item => item.member))]

        
        //console.log(unique)
    }
);