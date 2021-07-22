import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x6981C2E63C9BA164B6aaeE2536156a8FAd8F23A0"
);

export default instance;
