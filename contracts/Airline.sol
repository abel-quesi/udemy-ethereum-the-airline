pragma solidity ^0.5.0;

contract Airline {
    address public owner;
    struct Customer {
        uint loyaltyPoints;
        uint totalFlights;
    }

    struct Flight {
        string name;
        uint price;
    }

    Flight[] public  flights;

    uint etherPerPoint = 0.5 ether;


    mapping(address => Customer)  public customers;
    mapping(address => Flight[])  public customerFlights;
    mapping(address => uint)  public customerTotalFlights;

    event FlightsPurchased (address indexed customer, uint price, string flight);
    
    constructor()  public {
        owner = msg.sender;
        flights.push(Flight("Tokio", 4 ether));
        flights.push(Flight("Alemania", 3 ether));
        flights.push(Flight("Madrid", 3 ether));
    }

    function buyFlight(uint indexFlight) public payable {
        Flight memory flight = flights[indexFlight];
        require(msg.value == flight.price, "No hay suficiente ether");

        Customer storage customer = customers[msg.sender];
        customer.loyaltyPoints += 5;
        customer.totalFlights += 1;

        customerFlights[msg.sender].push(flight);
        customerTotalFlights[msg.sender] += 1;

        emit FlightsPurchased(msg.sender, flight.price, flight.name);
    }

    function totalFlights() public view returns(uint) {
        return flights.length;
    }

    function redeemLoyaltyPoints() public {
        Customer storage customer = customers[msg.sender];
        uint etherToRefund = customer.loyaltyPoints * etherPerPoint;
        require(address(this).balance > etherToRefund, "No hay suficiente ether en el contrato para devolver");
        msg.sender.transfer(etherToRefund);
        customer.loyaltyPoints = 0;
    }

    function getRefundableEther() public view returns(uint) {
        Customer memory customer = customers[msg.sender];
        return  customer.loyaltyPoints * etherPerPoint;
    }

    function getAirlineBalance() public isOwner view returns (uint) {
        return address(this).balance;                
    }

    modifier isOwner() {
        require(msg.sender == owner, "No es el propietario");
        _;
    }
}