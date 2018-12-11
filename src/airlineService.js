
export class AirlineService {
    constructor(contract) {
        this.contract = contract;
    }

    async buyFlight(flightIndex, from, value) {
        return await this.contract.buyFlight(flightIndex, { from, value });
    }

    async getCustomerFlights(from) {
        let total = await this.contract.customerTotalFlights(from);
        let customerFlights = [];
        for (var i = 0; i < total; i++) {
            let customerFlight = await this.contract.customerFlights(from, i);
            customerFlights.push(customerFlight);
        }
        return this.mapFlights(customerFlights);
    }

    async getFlights() {
        let total = await this.getTotalFlights();
        let flights = [];
        for (var i = 0; i < total; i++) {
            let flight = await this.contract.flights(i);
            flights.push(flight);
        }
        return this.mapFlights(flights);
    }

     getLoyaltyPoints(from) {
        /*let customer = await this.contract.clientes(from);
        return customer[0].toNumber();*/
        return this.contract.getRefundableEther({from});
    }

    async redeemLoyaltyPoints(from) {
        return await this.contract.redeemLoyaltyPoints({ from });
    }

    async getTotalFlights() {
        return (await this.contract.totalFlights()).toNumber();
    }

    mapFlights(flights) {
        return flights.map(flight => {
            return {
                nombre: flight[0],
                precio: flight[1].toNumber()
            }
        });
    }    
    
    

    
}