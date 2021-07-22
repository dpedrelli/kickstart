pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] private deployedCampaigns;
    address private owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function CampaignFactory() public {
    //constructor() public {
        owner = msg.sender;
    }

    function createCampaign(uint _minimumContribution) public {
        address newCampaign = new Campaign(_minimumContribution, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view onlyOwner returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) voters;
    }

    address private manager;
    uint private minimumContribution;
    mapping(address => bool) private constributors;
    uint private contributorsCount;
    Request[] public requests;

    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint _minimumContribution, address creator) public {
    //constructor(uint _minimumContribution, address creator) public {
        manager = creator; // Pass address.  msg.sender will be the CampaignFactory deploying this contract, not the user/origin.
        minimumContribution = _minimumContribution;
    }

    function getManager() public view returns (address) {
        return manager;
    }

    function getIsContributor(address contributor) public view returns (bool) {
      return constributors[contributor];
    }

    function getMinimumContribution() public view returns (uint) {
        return minimumContribution;
    }

//    function getRequests() public view returns (Request[]) {
//        return requests;
//    }
//    function getRequest(uint index) public view returns (Request) {
//        return requests[index];
//    }
    function getNumberOfRequests() public view returns (uint) {
        return requests.length;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution);
        constributors[msg.sender] = true;
        contributorsCount++;
    }

    function createRequest(string description, uint value, address recipient) public onlyManager {
        //require(msg.sender == manager);

        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        require(constributors[msg.sender]);

        Request storage request = requests[index];
        require(!request.voters[msg.sender]);

        request.approvalCount++;
        request.voters[msg.sender] = true;
    }

    function finalizeRequest(uint index) public onlyManager {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.approvalCount > (contributorsCount / 2));

        request.recipient.transfer(request.value);

        request.complete = true;
    }
}
