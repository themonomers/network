ROUTER_LOG_SPREADSHEET_ID = 'abc123';

function ingestLog() {
  var data = Sheets.Spreadsheets.Values.get(ROUTER_LOG_SPREADSHEET_ID, 'raw!A:A').values;

  var type;
  var source;
  var port;
  var time;
  var inputs = [];
  var open_row = findOpenRow(ROUTER_LOG_SPREADSHEET_ID, 'data','A:A');

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

      Logger.log('type: ' + type + ' | source: ' + source + ' | port: ' + port + ' | time: ' + time);
 
      inputs.push({range: 'data!A' + open_row, values: [[time.toLocaleDateString()]]});
      inputs.push({range: 'data!B' + open_row, values: [[source]]});
      inputs.push({range: 'data!C' + open_row, values: [[port]]});
      inputs.push({range: 'data!D' + open_row, values: [[type]]});

      open_row++;
    }
  }

  // batch write data to sheet
  Sheets.Spreadsheets.Values.batchUpdate({valueInputOption: 'USER_ENTERED', data: inputs}, ROUTER_LOG_SPREADSHEET_ID);

  // copy efficiency formulas down
  SpreadsheetApp.openById(
    ROUTER_LOG_SPREADSHEET_ID
  ).getRange(
    'data!E2:F2'
  ).copyTo(
    SpreadsheetApp.openById(
      ROUTER_LOG_SPREADSHEET_ID
    ).getRange(
      'data!E' + (open_row - data.length) + ':F' + (open_row - 1)
    )
  );
}

function findOpenRow(sheetId, sheetName, range) {
  var values = Sheets.Spreadsheets.Values.get(sheetId, sheetName + '!' + range).values;
  if (!values) {
    return 1;
  }
  return values.length + 1;
}
