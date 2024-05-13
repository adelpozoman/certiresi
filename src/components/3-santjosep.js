const crawler = require('crawler-request');

const dateRegex = /\d{2}\/\d{2}\/\d{4}/;


async function do_request(argument){
    const url = "http://www.santjosepdesatalaia.es/validarcsv.aspx?csv=" + argument;
    return crawler(url).then(function(response){
        // handle response
        //console.log(response);
        const lines = response.text.split('\n');

        const name = lines[6].trimStart();
        const id = lines[34];
        const date = lines[37].match(dateRegex);

        //console.log(name);
        //console.log(id)
        //console.log(date[0]);

        return {name, id, date};
    });
}


//do_request("176522553375331524954755935810");

module.exports = do_request;
