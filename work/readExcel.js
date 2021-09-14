const { time } = require('console');
var Excel = require('exceljs');

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "ip",
    user: " ",
    password: " ",
    database: " "
});

var wb = new Excel.Workbook();
var path = require('path');
var filePath2 = path.resolve('C:\\Users\\paparini\\OneDrive - Boehringer Ingelheim\\Desktop\\Nueva carpeta\\realdeal\\pasteValueAsText.xlsx');
var filePath = path.resolve('C:\\Users\\paparini\\OneDrive - Boehringer Ingelheim\\Desktop\\Nueva carpeta\\realdeal\\template4read.xlsx');
const fieldsData = []
const sqlFields = []
const sqlValues = []
var splitedFields
var sql

wb.xlsx.readFile(filePath).then(function () {

    var sh = wb.getWorksheet("Hoja 1");

    /* const nameCol = sh.getColumn('B');

    nameCol.eachCell(function(cell, rowNumber) {
        console.log(cell.value)
      }); */

    /* console.log(sh.rowCount);
    //Get all the rows data [1st and 2nd column]*/
    for (i = 3; i <= sh.rowCount; i++) {
        var fieldInfo = {}
        //console.log(sh.getRow(i).getCell('C').value);
        fieldInfo.name = sh.getRow(i).getCell('B').value?.trim()
        fieldInfo.column = sh.getRow(i).getCell('C').value?.toUpperCase().trim()
        fieldInfo.type = sh.getRow(i).getCell('D').value?.trim()
        fieldInfo.desc = sh.getRow(i).getCell('E').value?.trim()
        fieldsData.push(fieldInfo)
        if (fieldInfo.name && fieldInfo.name != '' && fieldInfo.column.trim().length < 3)
            sqlFields.push(fieldInfo.name)
    }

    sqlFields.push('published_at')
    splitedFields = sqlFields.join(', ').replace(", is,", ", `is`,")

    //console.log(fieldsData[0].desc)
});

wb.xlsx.readFile(filePath2).then(function () {

    var sh = wb.getWorksheet("Sheet1");

    for (let raw = 18; raw <= 22; raw++) {
        var sqlLine = []

        for (col = 0; col < fieldsData.length; col++) {
            if (fieldsData[col].column && fieldsData[col].column.trim().length < 3) {
                var colName = fieldsData[col].column.trim()
                var value = sh.getRow(raw).getCell(colName).value


                if (value && typeof value === 'string' && value.includes('DIV/0')) {
                    value = 0
                } else if (fieldsData[col].type.includes('%')) {
                    if (colName.match(/^(?:BB|BD|BE)$/)) {
                        value = parseFloat(value.replace("%", "")).toFixed(9)
                    } else {
                        value = parseFloat(value.replace("%", "")).toFixed(2)
                    }
                } else if (colName.match(/^(?:C)$/)) {
                    value = parseFloat(value).toFixed(2);
                } else if (colName.match(/^(?:J|K)$/)) {
                    value = parseFloat(value).toFixed(1);
                } else if (colName.match(/^(?:M)$/)) {
                    value = (value === 'Respondent') ? 1 : 0
                } else if (fieldsData[col].type === 'boolean') {
                    value = (value.match(/^(?:Yes|yes)$/)) ? 1 : 0
                } else if (colName.match(/^(?:DF|DI|DL|DO|DR|DU|DX|EA|ED)$/)) {
                    value = parseFloat(value.replace(",", "")).toFixed(2)
                }

                sqlLine.push(value)
                //console.log(colName + " " + value)
            }

        }
        sqlLine.push('2021-08-09 15:58:40')
        sqlValues.push(sqlLine)
    }

    /* console.log(sqlFields.join(', '));

    sqlValues.forEach(ich => {
       console.log(ich.join(', '))
    }) */

    //console.log(`INSERT INTO scores (${splitedFields}) VALUES ?`)
    var itemsPerLoop = 2
    var start = 0
    var times = sqlValues.length / itemsPerLoop


    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        sql = `INSERT INTO scores (${splitedFields}) VALUES ?`;
        insertBatch(0, times, start, itemsPerLoop, 0)
    });

});

function insertBatch(index, times, start, itemsPerLoop, totalInserted) {
    if (index < times) {
        var partial = sqlValues.slice(start, start + itemsPerLoop)
        start += itemsPerLoop


        con.query(sql, [partial], function (err, result) {
            if (err) throw err;
            console.log("Partial Number of records inserted: " + result.affectedRows);
            totalInserted += result.affectedRows
            console.log("Total Number of records inserted: " + totalInserted);
            insertBatch(++index, times, start, itemsPerLoop, totalInserted)
        });


        /* console.log('-----')
        partial.forEach(ich => {
            console.log(ich.join(', '))
        }) */

    }
}

