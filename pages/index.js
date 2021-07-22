import React, { Component } from "react";
import factory from "../ethereum/factory";


class CampaignIndex extends Component {
  // Define as static, allowing to call without rendering component.
  static async getInitialProps() {
    // const campaigns = [ "0xED981E62911bf66e8557a24e817EF19846e1C5db" ];
    const campaigns = await factory.methods.getDeployedCampaigns().call();
    return { campaigns }; // Equivalent to return { campaigns: campaigns };
  }

  render() {
    return (
      <div>{this.props.campaigns}</div>
    );
  }
}

export default CampaignIndex;
