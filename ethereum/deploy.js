const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
// const { interface, bytecode } = require("./compile");
const compiledFactory = require("./build/CampaignFactory.json");

const provider = new HDWalletProvider(
  '***',
  'https://rinkeby.infura.io/v3/346788aed0b74c9192e1eb596d394a42' // Infura is an actual node on network.
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  // const result = await new web3.eth.Contract(JSON.parse(interface))
  //   .deploy({ data: '0x' + bytecode })
  //   .send({ gas: "1000000", from: accounts[0] });
  const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: '0x' + compiledFactory.bytecode })
    .send({ gas: "1000000", from: accounts[0] });

  console.log("Contract deployed to", result.options.address);
  // Deployed address: 0x6981C2E63C9BA164B6aaeE2536156a8FAd8F23A0
};
deploy();
