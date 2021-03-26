const request = require('request')

function req(){
    request.post(
        'http://192.168.1.130:8095/send',
        {
          json: {
            message: 'amazon servers status',
          },
        },
        (error, res, body) => {
          if (error) {
            console.error(error)
            return
          }
          console.log(`statusCode: ${res.statusCode}`)
          console.log(body)
        }
      )
}

//req()
//req()