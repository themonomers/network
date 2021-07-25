function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Custom Menu')
    .addItem('Ingest Log', 'ingestLog')
    .addToUi();
}

function ingestLog() {
  var data = SpreadsheetApp.getActiveSpreadsheet().getRange('raw!A:A').getValues();

  var type;
  var source;
  var port;
  var time;
  var inputs = [];
  var open_row = findOpenRow('data');
  var first_open_row = open_row;

  for (var i = data.length; i >= 0; i--) {
    type = new String(data[i]).split(']', 1)[0].substring(1);
    if (type.indexOf('Attack') > 0) {
      source = new String(data[i]).split('from source: ')[1].split(',')[0];
      
      if (new String(data[i]).indexOf('port') > 0) {
        port = new String(data[i]).split('port ')[1].split(',')[0];
        time = new Date(new String(data[i]).split(',')[3] + ', ' + new String(data[i]).split(',')[4] + ' -0700');
      } else {
        port = '';
        time = new Date(new String(data[i]).split(',')[2] + ', ' + new String(data[i]).split(',')[3] + ' -0700');
      }

      inputs.push([time.toLocaleDateString(), source, port, type]);

      open_row++;
    }
  }

  // batch write data to sheet
  SpreadsheetApp.getActiveSpreadsheet().getRange('data!A' + first_open_row + ':D' + (open_row - 1)).setValues(inputs);

  // copy formulas for 2 octet, 3 octet, and whois hyperlink down
  SpreadsheetApp.getActiveSpreadsheet().getRange(
    'data!E2:G2'
  ).copyTo(
    SpreadsheetApp.getActiveSpreadsheet().getRange(
      'data!E' + (first_open_row) + ':G' + (open_row - 1)
    )
  );
}

function findOpenRow(sheetName) {
  var values = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getDataRange().getValues();
  if (!values) {
    return 1;
  }
  return values.length + 1;
}
