const crawler = require('crawler-request');


function convertTextDateToDDMMYYYY(textDate) {
    // Define month names mapping
    const monthNames = {
        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05',
        'junio': '06', 'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10',
        'noviembre': '11', 'diciembre': '12'
    };

    // Extract day, month, and year using regular expression
    const [, day, monthName, year] = textDate.match(/(\d{1,2}) de (\w+) de (\d{4})/);

    // Get numerical representation of the month
    const month = monthNames[monthName.toLowerCase()];

    // Format the date as DD/MM/YYYY
    const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;

    return formattedDate;
}


async function do_request(userCode) {

    const url = "https://certificadosviajeweb.eivissa.es/ValidadorCSV/viewFile?codigo=" + userCode;

    const response = await crawler(url);
    //crawler(url).then(function(response){
        // handle response
        //console.log(response);
        const lines = response.text.split('\n');


        const nombre = lines[6].split(' ');
        nombre.shift();
        const date = lines[17];
        const formattedDate = convertTextDateToDDMMYYYY(date);

        //console.log(nombre.join(' '));
        //console.log(lines[7].split(' ')[4]);
        //console.log(formattedDate);

        return {name: nombre.join(' '), id: lines[7].split(' ')[4], date: formattedDate};
    //});

}

//do_request("Nzc4NDMwNjlZMTcxMzc4MTA2ODAyNw==")

module.exports = do_request;
