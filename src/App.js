import React, { Component } from "react";
import {ToastContainer} from 'react-toastr';

import Panel from "./Panel";
import getWeb3 from "./getWeb3";
import AirlineContract from "./airline";
import {AirlineService} from "./airlineService";

const converter = (web3) => {
    return (value) => {
        return web3.utils.fromWei(value.toString(),'ether');
    }
}

export class App extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            flights: [],
            customerFlights: [],
            account: undefined,
            balance : 0,
            loyaltyPoints : 0
        };
    }

    async componentDidMount(){
        this.web3 = await getWeb3();
        this.toEther = converter(this.web3);
        this.airline = await AirlineContract(this.web3.currentProvider);
        this.airlineService = new AirlineService(this.airline);
        var account = (await this.web3.eth.getAccounts())[0];

        let flightPurchased = this.airline.FlightsPurchased();

        flightPurchased.watch((err, result) => {           
            const {cliente, precio, vuelo} = result.args;
            if (cliente === this.state.account) {
                this.container.info('Compraste un vuelo a ' + vuelo + ' con un costo de ' + this.toEther(precio) + ' ETH', 'Info!');
                //console.log('Compraste un vuelo a ' + vuelo + ' con un costo de ' + this.toEther(precio) + ' ETH');
            } else {
                this.container.success('La ultima compra de vuelo fue a ' + vuelo 
                 + ' con un costo de ' + this.toEther(precio) + ' ETH', 'Info!');
            }
        },this);

        this.web3.currentProvider.publicConfigStore.on('update', async(event) => {
            this.setState({
                account: event.selectedAddress.toLowerCase()
            }, () => {
            this.load();
            });
        },this);

        this.setState({
            account: account.toLowerCase()
        }, () =>{
            this.load();
        });
    }

    async buyFlight(flightIndex, flight){  
        await this.airlineService.buyFlight(flightIndex, this.state.account, flight.precio);
    }
    async getBalance(){
        let weiBalance = await this.web3.eth.getBalance(this.state.account);
        this.setState({
            balance : this.toEther(weiBalance)
        });
    }

    async getLoyaltyPoints(){
        let loyaltyPoints = await this.airlineService.getLoyaltyPoints(this.state.account);
        this.setState({
            loyaltyPoints : this.toEther(loyaltyPoints.toNumber())
        });
    }
    async refundLoyaltyPoints(){  
        await this.airlineService.redeemLoyaltyPoints(this.state.account);
    }

    async getFlights(){
        let flights = await this.airlineService.getFlights();
        this.setState({
            flights
        })
    }

    async getCustomerFlights(){
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);
        this.setState({
            customerFlights
        })
    }

    async load(){
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
        this.getLoyaltyPoints();
    }
 
    render() {
        return <React.Fragment>
            <div className="jumbotron">
                <h4 className="display-4">Welcome to the Airline!</h4>
            </div>

            <div className="row">
                <div className="col-sm">
                    <Panel title="Balance">
                        <p><strong>{ this.state.account}</strong></p>
                        <span><strong>Balance :</strong> {this.state.balance} ETH</span>
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Loyalty points - refundable ether">                    
                    <span><strong></strong> {this.state.loyaltyPoints} ETH</span>
                    <button className="btn btn-sm btn-success text-white" onClick= {() => this.refundLoyaltyPoints()} >Reclamar</button>
                    </Panel>
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <Panel title="Available flights">
                        {this.state.flights.map((flight,i) => {
                            return <div key= {i}>
                                <span>{flight.nombre} - costo: {this.toEther(flight.precio)}</span>
                                <button className="btn btn-sm btn-success text-white" onClick= {() => this.buyFlight(i,flight)}>Comprar</button>
                            </div>
                        })}

                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Your flights">
                    {this.state.customerFlights.map((flight,i) => {
                            return <div key= {i}>
                                <span>{flight.nombre} - costo: {this.toEther(flight.precio)}</span>
                            </div>
                        })}

                    </Panel>
                </div>
            </div>
             <ToastContainer
                ref={(ref) => this.container = ref}
                className="toast-top-right"
            />
        </React.Fragment>
    }
}