const fs = require('fs');
const program = require('commander');
const Web3 = require('web3');
const WebTorrent = require("webtorrent-hybrid");
const colors = require("colors");

var config = {
  "provider":"wss://mainnet.infura.io/ws",
  "address": "0x85be36FA32D11BA6070F60A0119F1Fc5b0d25D1D",
  "abi":[{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"title","type":"string"},{"name":"description","type":"string"}],"name":"updateVideo","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"names","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"removeVideo","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"magnet","type":"string"},{"name":"title","type":"string"},{"name":"description","type":"string"}],"name":"create","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"creators","outputs":[{"name":"addr","type":"address"},{"name":"name","type":"string"},{"name":"avatar","type":"string"},{"name":"bio","type":"string"},{"name":"coinhive","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"},{"name":"avatar","type":"string"},{"name":"bio","type":"string"},{"name":"coinhive","type":"string"}],"name":"profile","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"videos","outputs":[{"name":"magnet","type":"string"},{"name":"title","type":"string"},{"name":"description","type":"string"},{"name":"date","type":"uint256"},{"name":"tips","type":"uint256"},{"name":"creator","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"tip","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Tip","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"magnet","type":"string"},{"indexed":false,"name":"creator","type":"address"},{"indexed":false,"name":"title","type":"string"},{"indexed":false,"name":"description","type":"string"},{"indexed":false,"name":"date","type":"uint256"}],"name":"Upload","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"name","type":"string"},{"indexed":false,"name":"avatar","type":"string"},{"indexed":false,"name":"bio","type":"string"},{"indexed":false,"name":"coinhive","type":"string"}],"name":"Registration","type":"event"}]
}

var seed = function(data){

  var web3 = new Web3(new Web3.providers.WebsocketProvider(config.provider));
  var Decentube = new web3.eth.Contract(config.abi, config.address);
  var client = new WebTorrent();

  //Seed all existing videos
  fs.readdir("./videos", (err, files) => {
    files.forEach(file => {
      client.seed('./videos/'+file);
      console.log(("Seeding " + file + " from the videos folder").blue)
    });
  })

  if(data.id){ //If looking for a specific video id
    //Seed video
  }else if(data.user){ //If looking for a specific user's videos
    Decentube.methods.names(web3.utils.soliditySha3(data.user)).call(function(error, namesResult){
      if(namesResult != "0x0000000000000000000000000000000000000000"){
        console.log(("User " + data.user+ " was found! Seeding his videos.").green);
        Decentube.events.Upload({
          fromBlock:4678985 //Block number of the contract deployment
        }, function(error, event){
            if(event.returnValues.creator === namesResult && client.get(event.returnValues.magnet) === null){
              console.log(("Found video: "+event.returnValues.title + " (https://decentube.com/#/v/" + event.returnValues.id + ")").blue);
              client.add(event.returnValues.magnet, {path:"./videos"}, function(torrent){
                console.log(("STARTED downloading "+ event.returnValues.title + " (https://decentube.com/#/v/" + event.returnValues.id + ")").green)
                torrent.on("done", function(){
                  console.log(("FINISHED downloading "+ event.returnValues.title + " (https://decentube.com/#/v/" + event.returnValues.id + ")").green)
                })
              })
            }
        })
      }else{
        console.log("The user you have entered does not exist. Please remember that usernames are case sensitive".red);
      }
    })
  }else{ //If looking for all videos
    console.log("Seeding all videos".green)
  }
}

program
  .option('-a, --all', 'Seed all videos by every Decentube creator'.rainbow)
  .option('-u, --user [username]', 'Seed all videos by one Decentube creator')
  .option('-v, --video [id]', 'Seed a single video')

program.on('--help', function(){
  console.log('  Go to the Github repo for more information: https://github.com/Lamarkaz/decentube-node');
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

if (program.all) {
  seed({});
}

if (program.user) {
  if(program.user === true){
    console.log("Please enter a user name".blue);
  }else if(program.user.length < 2 || program.user.length > 16){
    console.log("The username length you have entered is not valid".red);
  }else{
    seed({user:program.user});
  }
}

if (program.video) {
  var id = parseInt(program.video);
  if(program.video === true){
    console.log("Please enter a video ID".blue);
  }else if(typeof id != 'number' || id % 1 != 0 || id === 0){
    console.log("The ID you have entered is not valid".red);
  }else{
    seed({id:id});
  }
}
