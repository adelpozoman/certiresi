const crawler = require('crawler-request');

const convertTextToDate = require("./convert-text-to-date");


async function do_request(argument){
    const url = "https://www.santaeularia.com:4455/validarcsv.aspx?csv=" + argument;
    return crawler(url).then(function(response){
        // handle response
        console.log(response);
        const lines = response.text.split('\n');

        const name = lines[7].trimStart();
        const id = lines[36];
        const date = convertTextToDate(lines[34].split(',')[1].trim());

        //console.log(name);
        //console.log(id)
        //console.log(date);

        return {name, id, date};
    });
}


//do_request("");

module.exports = do_request;