'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const http = require('https');
const axios = require("axios")
var unirest = require("unirest");
// let errorResposne = {
//   results: []
// };
const server = express();
server.use(bodyParser.json());
server.post('/covid19India', function (req, res) {
  var reply = "Sorry What?"
  var output = ""
  if (req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.state) {
    axios({
      url: 'https://covidstat.info/graphql',
      method: 'post',
      data: {
        query: `
        query {
          country(name: "India") {
            states {
              state
              cases
              deaths
              recovered
              tests
              todayCases
              todayDeaths
              todayRecovered
              active
            }
          }
        }`
      }
    }).then((result) => {
      output = result.data
      // console.log(result.data)
      function findObjectByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
          if (array[i][key] === value) {
            return array[i];
          }
          // console.log(array[i][key])
        }
        return null;
      }
      var obj = findObjectByKey(output.data.country.states, 'state', req.body.queryResult.parameters.state);
      reply = `${obj.state} currently have ${obj.cases} total cases among which ${obj.cases - (obj.deaths + obj.recovered)} are active.`
      var speechResponse = {
        google: {
          expectUserResponse: true,
          richResponse: {
            items: [
              {
                simpleResponse: {
                  textToSpeech: reply
                }
              }
            ]
          }
        }
      };

      return res.json({
        payload: speechResponse,
        //data: speechResponse,
        fulfillmentText: reply,
        speech: reply,
        displayText: reply,
        source: "webhook-covid19-info"
      });
    }).catch((error)=>{
      var speechResponse = {
        google: {
          expectUserResponse: true,
          richResponse: {
            items: [
              {
                simpleResponse: {
                  textToSpeech: reply
                }
              }
            ]
          }
        }
      };
      return res.json({
        payload: speechResponse,
        //data: speechResponse,
        fulfillmentText: reply,
        speech: reply,
        displayText: reply,
        source: "webhook-covid19-info"
      })
    });
  }

});

server.listen(process.env.PORT || 8000, function () {
  console.log("Server up and listening");
});
