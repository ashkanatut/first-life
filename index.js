'use strict';

const port = 3000;

const express = require('express');
const bodyParser = require('body-parser');
const {
    dialogflow,    
    Permission
} = require('actions-on-google');

const { text } = require('body-parser');  
const app = dialogflow();

//intent handlers
app.intent('Default Welcome Intent', conv => {  
    console.log(conv.body.originalDetectIntentRequest.source);
    conv.ask('Benvenuto, sono il tuo assistente personale. Posso consigliarti dove mangiare e dove comprare prodotti tipici piemontesi. Inoltre posso darti informazioni sui luoghi in cui si producono. Basta specificare la categoria o la descrizione di un prodotto.');    
});

app.intent('cosa_comprare', conv => {    
    console.log(conv.parameters.prodotti);
    conv.ask(`Puoi acquistare la “Crema contadina e la “Robiola d’Alba”. Vuoi sapere dove acquistarli?'.`);    
});

app.intent('cosa_produce', conv => {   
    const params = conv.parameters; 
    conv.ask(`L”azienda ${params.azienda} produce il Fior di Robiola e la Ricotta di capra.`);    
});

app.intent('dettaglio', conv => {   
    const params = conv.parameters; 
    console.log(params.categoria);    
    conv.ask(`La “ ${params.categoria} ” è un formaggio prodotto da latte intero; la salatura avviene in salamoia (soluzione acquosa salina, più o meno concentrata). Il formaggio si presenta con pasta chiusa, morbida e spalmabile. Vuoi sapere dove viene prodotto?`);    
});

app.intent('dove_comprare_mangiare', conv => {   
    const params = conv.parameters; 
    console.log(params.categoria, params.prodotti, params.attivita);
    if(params.attivita == 'comprare'){
        if(params.categoria == 1 && params.prodotti != 1){
            conv.ask(`La “ ${params.prodotti} ” puoi comprarla presso il punto vendita “ La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero + 390122902201 ”.`);   
        }else if(params.categoria != 1 && params.prodotti == 1){
            conv.ask(`La “ ${params.categoria} ” puoi comprarla presso il punto vendita “ La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero + 390122902201 ”.`);   
        }else if(params.categoria != 1 && params.prodotti != 1){
            conv.ask(`La “ ${params.categoria} ” puoi comprarla presso il punto vendita “ La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero + 390122902201 ”.`);   
        }else {
            conv.ask('non sono riuscito a capire, potresti ripetere?');
        }
    } else if(params.attivita == 'mangiare'){
        if(params.categoria == 1 && params.prodotti != 1){
            conv.ask(`La "${params.prodotti}" puoi mangiarla presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`);   
        }else if(params.categoria != 1 && params.prodotti == 1){
            conv.ask(`La "${params.categoria}" puoi mangiarla presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`);   
        }else if(params.categoria != 1 && params.prodotti != 1){
            conv.ask(`La "${params.categoria}" puoi mangiarla presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`);   
        }else {
            conv.ask('non sono riuscito a capire, potresti ripetere?');
        }
    } else{
        conv.ask('non sono riuscito a capire, potresti ripetere?');
    }
        
});

app.intent('dove_sono_prodotti', conv => {   
    const params = conv.parameters; 
    console.log(params.categoria);
    conv.ask(`"${params.categoria}" si produce in Azienda Agricola Bermond Daniele, Fraz. San Sicario, 1 Cesana Torinese (TO)`);
});

app.intent('dintorni_req', conv => { 
    const source = conv.body.originalDetectIntentRequest.source;   
    const params = conv.parameters;  
    console.log(params, source);
    conv.contexts.set('dintorni-dove-ctx', 5, {attivita: params.attivita, prodotti: params.prodotti, categoria: params.categoria});

    let context = '';
    let permissions = '';
    if(source == 'google'){
        if (conv.user.verification === 'VERIFIED') {
            permissions = 'DEVICE_PRECISE_LOCATION';
            context = 'Per sapere la tua posizione';  
        } else{
            conv.close('Non sei verificato');
        }
        const options = {
            context,
            permissions,
        };
        conv.ask(new Permission(options));
    }else{
        conv.close('mi puoi dare il codice postale della tua posizione?');
    }
       
});

app.intent('dintorni_res', (conv, params, confirmationGranted) => {     
    const {location} = conv.device;   
    const ctx = conv.contexts.get('dintorni-dove-ctx');
    let parameters = ctx.parameters;
    console.log(parameters);
    let text1 = ``;
    let text2 = ``;
    if(parameters.attivita == "mangiare"){
        if(parameters.categoria != 1){
            text1 = `Puoi mangiare "${parameters.categoria}", vicino a tua posizione`;
            text2 = `presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`;
        } else if(parameters.categoria == 1 && parameters.prodotti != 1){
            text1 = `Puoi mangiare "${parameters.prodotti}", vicino a tua posizione`;
            text2 = `presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`;
        }else if(parameters.categoria == 1 && parameters.prodotti == 1){
            text1 = `Puoi mangiare "Piramide" e "Ricotta di Capra", vicino a tua posizione`;
            text2 = `presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`;
        }else{
            conv.ask('non sono riuscito a capire, potresti ripetere');
        }
    } else if(parameters.attivita == "comprare"){
        if(parameters.categoria != 1){
            text1 = `Puoi comprare "${parameters.categoria}", vicino a tua posizione`;
            text2 = `presso il punto vendita “La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero +390122902201”.`;
        } else if(parameters.categoria == 1 && parameters.prodotti != 1){
            text1 = `Puoi comprare "${parameters.prodotti}", vicino a tua posizione`;
            text2 = `presso il punto vendita “La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero +390122902201”.`;
        }else if(parameters.categoria == 1 && parameters.prodotti == 1){
            text1 = `Puoi comprare "Ricotta" e "Rabiola d'Alba", vicino a tua posizione`;
            text2 = `presso il punto vendita “La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero +390122902201”.`;
        }else{
            conv.ask('non sono riuscito a capire, potresti ripetere');
        }
    } else{
        conv.ask('non sono riuscito a capire, potresti ripetere');
    }

    if (confirmationGranted && location) {
        conv.ask(text1 + `, ${location.city}` + `, ${location.zipCode}, ` + text2);
    } else {
    conv.ask(`non sono riuscito a capire la tua posizione.`);
    }
});

app.intent('dintorni_get_cap', conv => {       
    const ctx = conv.contexts.get('dintorni-dove-ctx');
    let parameters = ctx.parameters;    
    let params = conv.parameters;
    console.log(parameters, params.zipCode);
    let text1 = ``;
    let text2 = ``;
    if(parameters.attivita == "mangiare"){
        if(parameters.categoria != 1){
            text1 = `Puoi mangiare "${parameters.categoria}", vicino a tua posizione`;
            text2 = `presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`;
        } else if(parameters.categoria == 1 && parameters.prodotti != 1){
            text1 = `Puoi mangiare "${parameters.prodotti}", vicino a tua posizione`;
            text2 = `presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`;
        }else if(parameters.categoria == 1 && parameters.prodotti == 1){
            text1 = `Puoi mangiare "Piramide" e "Ricotta di Capra", vicino a tua posizione`;
            text2 = `presso il ristorante “Raggio di Sole Chalet, Localita' che si trova a Sestriere (provincia di Torino) in via Monte Banchetta. Puoi contattarli al numero +39012276982”.`;
        }else{
            conv.ask('non sono riuscito a capire, potresti ripetere');
        }
    } else if(parameters.attivita == "comprare"){
        if(parameters.categoria != 1){
            text1 = `Puoi comprare "${parameters.categoria}", vicino a tua posizione`;
            text2 = `presso il punto vendita “La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero +390122902201”.`;
        } else if(parameters.categoria == 1 && parameters.prodotti != 1){
            text1 = `Puoi comprare "${parameters.prodotti}", vicino a tua posizione`;
            text2 = `presso il punto vendita “La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero +390122902201”.`;
        }else if(parameters.categoria == 1 && parameters.prodotti == 1){
            text1 = `Puoi comprare "Ricotta" e "Rabiola d'Alba", vicino a tua posizione`;
            text2 = `presso il punto vendita “La Scursa Di Avato Francesco” che si trova a Bardonecchia (provincia di Torino) in Via Giovanni Giolitti. Puoi contattarli al numero +390122902201”.`;
        }else{
            conv.ask('non sono riuscito a capire, potresti ripetere');
        }
    } else{
        conv.ask('non sono riuscito a capire, potresti ripetere');
    }
    
    conv.ask(text1 + `, Torino` + `, ${params.zipCode}, ` + text2);
    
});
//end of handlers

//deploy function on local host
const expressApp = express().use(bodyParser.json()); 
expressApp.post('/fulfillment', app); 
expressApp.listen(port, function () {
    console.log('FirstLife CHATBOT Running at ...' + port);
});