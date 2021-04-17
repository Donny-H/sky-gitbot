require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios').default;

let latestEventID 

axios.defaults.headers = {
    'Authorization': `token ${process.env.GITHUB_ACCESS_TOKEN}`
}

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

axios.get('https://api.github.com/orgs/skycoin/events')
  .then(function (response) {
    latestEventID = response.data[0].id;
    console.log(`Initial ID is ${latestEventID}`)
  })


bot.on('message', (msg) => {
    console.log(msg)
  });

// reponse texts should be refactored into varibles for cleanliness but I still cbf
setInterval(function setLatestEvent() {
        axios({
            method: 'get',
            url: 'https://api.github.com/orgs/skycoin/events', 
            params: {per_page: 4}
        })
        .then(response => {
            if (response.data[0].id === latestEventID){
                console.log(`No new data. Latest ID is ${latestEventID}`)
            } else if (response.data[0].id != latestEventID && response.data[0].type == 'PushEvent') {
                latestEventID = response.data[0].id;
                bot.sendMessage(process.env.CHAT_ID, `${response.data[0].actor.display_login} pushed to repo ${response.data[0].repo.name} with ${response.data[0].payload.size} commits! \n\nMessage: ${response.data[0].payload.commits[0].message} \n\nLink: https://github.com/${response.data[0].repo.name}/commits/${response.data[0].payload.commits[0].sha}`);
                console.log(`${response.data[0].actor.display_login} pushed to repo ${response.data[0].repo.name} with ${response.data[0].payload.size} commits! Message: ${response.data[0].payload.commits[0].message} Link: https://github.com/${response.data[0].repo.name}/commits/${response.data[0].payload.commits[0].sha}`);
            } else if (response.data[0].id != latestEventID && response.data[0].type == 'PullRequestEvent'){
                latestEventID = response.data[0].id;
                bot.sendMessage(process.env.CHAT_ID, `${response.data[0].actor.display_login} ${response.data[0].payload.action} a pull request on repo: ${response.data[0].repo.name}. \n\nLink: ${response.data[0].payload.pull_request.html_url}`);
                console.log(`${response.data[0].actor.display_login} ${response.data[0].payload.action} a pull request on repo: ${response.data[0].repo.name}. Link: ${response.data[0].payload.pull_request.html_url}`);
            } else if (response.data[0].id != latestEventID && response.data[0].type == 'PullRequestReviewEvent') {
                latestEventID = response.data[0].id;
                bot.sendMessage(process.env.CHAT_ID, `${response.data[0].actor.display_login} reviewed a pull request! \n\nLink: \n\n${response.data[0].payload.review.html_url}`);
                console.log(`${response.data[0].actor.display_login} reviewed a pull request! Link: ${response.data[0].payload.review.html_url}`);
            } else if (response.data[0].id != latestEventID){
                latestEventID = response.data[0].id;
                console.log(`Unspecified event: the new id is ${latestEventID}. Type was ${response.data[0].type}`);
            }
        })
        .catch(e => {
            console.log(response.data)
        })
    }, 
2000)

