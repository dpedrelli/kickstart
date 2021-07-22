const assert = require("assert");
// Test network.
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts; // Ethereum accounts on Ganache network.
let factory; // Deployed instance of CampaignFactory.
let campaignAddress;
let campaign;

beforeEach(async () => {
    // Get accounts.
    accounts = await web3.eth.getAccounts();
    // Deploy CampaignFactory
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
      .deploy({data: compiledFactory.bytecode})
      .send({from: accounts[0], gas: "1000000"});
    // Deploy a campaign.
    await factory.methods.createCampaign("100").send({
      from: accounts[1],
      gas: "1000000"
    });

    // Get campaign created.
    // ES-2016 - take first element from array and assign to campaignAddress.
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call({from: accounts[0]});
    campaign = await new web3.eth.Contract(
      JSON.parse(compiledCampaign.interface),
      campaignAddress
    );
});

describe("Campaigns", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.methods.getManager().call();
    assert.equal(accounts[1], manager);
  });

  it("allows people to conribute and mark as contributor", async () => {
    await campaign.methods.contribute().send({
      from: accounts[2],
      value: "200"
    });

    const isContributor = await campaign.methods.getIsContributor(accounts[2]).call();
    assert(isContributor);
  });

  it("requires a minimum contribution", async () => {
    let success = false;
    try {
      await campaign.methods.contribute().send({
        from: accounts[2],
        value: "99"
      });
      success = false;
      //assert(false); // assert(false) is caught by the catch {} block.
    } catch (e) {
      assert(e);
      success = true;
    }
    assert(success);

    try {
      await campaign.methods.contribute().send({
        from: accounts[2],
        value: "100"
      });
      assert(true);
    } catch (e) {
      assert(false);
    }
  });

  it("allows only a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("Buy batteries", "100", accounts[3])
      .send({
        from: accounts[1],
        gas: "1000000"
      });

    const request = await campaign.methods.requests(0).call();
    assert.equal("Buy batteries", request.description)
    const requestCount = await campaign.methods.getNumberOfRequests().call();
    assert(1, requestCount);

    let success = false;
    try {
      await campaign.methods
        .createRequest("Buy batteries", "100", accounts[3])
        .send({
          from: accounts[0],
          gas: "1000000"
        });
    } catch (e) {
      assert(e);
      success = true;
    }
    assert(success);
  });

  it("processes request", async () => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[2],
        value: web3.utils.toWei("10", "ether")
      });

      await campaign.methods
        .createRequest("Buy batteries", web3.utils.toWei("5", "ether"), accounts[3])
        .send({
          from: accounts[1],
          gas: "1000000"
        });

      await campaign.methods.approveRequest(0).send({
        from: accounts[2],
        gas: "1000000"
      });

      let initialBalance = await web3.eth.getBalance(accounts[3]);
      initialBalance = web3.utils.fromWei(initialBalance, "ether");
      initialBalance = parseFloat(initialBalance);
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[1],
        gas: "1000000"
      });
      let finalBalance = await web3.eth.getBalance(accounts[3]);
      finalBalance = web3.utils.fromWei(finalBalance, "ether");
      finalBalance = parseFloat(finalBalance);

      assert.equal(finalBalance, initialBalance + 5);
    } catch (e) {
      assert(false);
    }
  });

  // it("", async () => {
  //
  // });
});
