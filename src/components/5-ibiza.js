const crawler = require('crawler-request');

const convertTextToDate = require("./convert-text-to-date");



async function do_request(userCode) {

    const url = "https://certificadosviajeweb.eivissa.es/ValidadorCSV/viewFile?codigo=" + userCode;

    const response = await crawler(url);
    //crawler(url).then(function(response){
        // handle response
        //console.log(response);
        const lines = await response.text.split('\n');


        const nombre = lines[6].split(' ');
        nombre.shift();
        const date = lines[17];
        const formattedDate = convertTextToDate(date);

        //console.log(nombre.join(' '));
        //console.log(lines[7].split(' ')[4]);
        //console.log(formattedDate);

        return {name: nombre.join(' '), id: lines[7].split(' ')[4], date: formattedDate};
    //});

}

//do_request("Nzc4NDMwNjlZMTcxMzc4MTA2ODAyNw==")

module.exports = do_request;
