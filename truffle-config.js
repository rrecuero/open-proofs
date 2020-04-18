//const HDWalletProvider = require('truffle-hdwallet-provider')
//const fs = require("fs")
//const { join } = require('path')

// First read in the secrets.json to get our mnemonic
/*
let secrets;
let mnemonic;

let filename = process.env.SECRET_FILE;
if (filename == "") {
  filename = "secrets.json";
}
if (fs.existsSync(filename)) {
  secrets = JSON.parse(fs.readFileSync(filename, "utf8"));
  mnemonic = secrets.mnemonic;
} else {
  console.log("No secrets.json found. If you are trying to publish EPM " +
    "this will fail. Otherwise, you can ignore this message!");
  mnemonic = "";
}
*/

 module.exports = {
   networks: {
     development: {
       host: "localhost",
       port: 8545,
       network_id: "*" // Match any network id
     }
   },
   rinkeby: {
     network_id: 4,
     provider: function() {
       return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/', 0, 10)
     },
     gasPrice: 15000000001,
     skipDryRun: true
   },
   mainnet: {
     network_id: 1,
     provider: function() {
       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/', 0, 10)
     },
     gasPrice: 15000000001,
     skipDryRun: true
   }
 };
