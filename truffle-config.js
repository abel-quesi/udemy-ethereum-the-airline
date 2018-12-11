const  HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = 'address gesture silver rotate buddy story grab outside vocal cancel strike east';

module.exports = {
  networks: {
    development: {      
      host: '10.240.14.117',
      port: 7545,
      network_id: '*',
      gas: 5000000
    },
    rinkeby: {      
      provider:  function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/5ba67c2d58564a63ad18b6415cd43400",1);
      },
      network_id: 4
    }
  }
}