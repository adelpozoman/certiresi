function convertTextToDate(textDate) {
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

module.exports = convertTextToDate;

