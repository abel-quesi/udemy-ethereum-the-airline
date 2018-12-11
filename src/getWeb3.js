import  Web3 from 'web3';
import { resolve } from 'url';
import { rejects } from 'assert';

const getWeb3 = () => {
    return new Promise( (resolve, reject) => {
        window.addEventListener('load', function() {
            let web3 = window.web3;
            if (typeof web3 != undefined){
                 web3 = new Web3(web3.currentProvider);
                 resolve(web3);
            } else {
                console.error ("No se encontro el provider, por favor instale Metamask");
                reject();
            }
        });
    });
};

export default getWeb3;