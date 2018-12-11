const Airline = artifacts.require("Airline");

let instance;


beforeEach(async () => {
    instance = await Airline.new();
});

contract("Airline", accounts => {

    it('deberia tener vuelos disponibles', async () => {
        let total = await instance.totalVuelos();
        assert(total > 0);
    });

    it('deberia permitir a los clientes comprar un vuelo si estos proveen un valor', async () => {
        let vuelo = await instance.vuelos(0);
        const nombreVuelo = vuelo[0], precio = vuelo[1];
        await instance.comprarVuelo(0, { from: accounts[0], value: precio });
        const vueloCliente = await instance.clienteVuelos(accounts[0], 0);
        const totalVuelosCliente = await instance.clienteTotalVuelos(accounts[0]);

        assert(vueloCliente[0], nombreVuelo);
        assert(vueloCliente[1], precio);
        assert(totalVuelosCliente, 1);
    });

    it('deberia no permitir a los clientes comprar un vuelo con menor valor', async () => {
        let vuelo = await instance.vuelos(0);
        precio = vuelo.precio - 5000;
        try {
            await instance.comprarVuelo(0, { from: accounts[0], value: precio });
        } catch (e) { return; }
        assert.fail();
    });

    it('deberia retornar el balance real de la aerolinea', async () => {
        let vuelo = await instance.vuelos(0);
        const precio = vuelo[1];
        let vuelo2 = await instance.vuelos(1);
        const precio2 = vuelo2[1];

        await instance.comprarVuelo(0, { from: accounts[0], value: precio });
        await instance.comprarVuelo(1, { from: accounts[0], value: precio2 });

        let nuevoBalanceAerolinea = await instance.getAirlineBalance();
        let precioTotal = parseInt(precio) + parseInt(precio2);
        assert.equal(parseInt(nuevoBalanceAerolinea), precioTotal);
    });

    it('deberia permitir a los cliente canjear sus puntos de lealtad', async () => {
        let vuelo = await instance.vuelos(0);
        const precio = vuelo[1];

        await instance.comprarVuelo(0, { from: accounts[0], value: precio });

        let nuevoBalanceAerolinea = await instance.getAirlineBalance();

        const balance = await web3.eth.getBalance(accounts[0]);
        try {
            await instance.amortizarPuntosLealtad({ from: accounts[0] });
        } catch (e) { return; }
        // assert.fail();
        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const cliente = await instance.clientes(accounts[0]);
        const puntosLealtad = cliente.puntosLealtad;


        assert.equal(puntosLealtad, 0);

        assert(balance < finalBalance);

    });
});