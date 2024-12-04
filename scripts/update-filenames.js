const fs = require('fs');
const { parse } = require('csv-parse/sync');

const updateCsv = (filename) => {
  const data = fs.readFileSync(`data/${filename}`, 'utf-8');
  const rows = data.split('\n');
  
  const updatedRows = rows.map(row => {
    if (!row) return row;
    return row.replace(/\.png/g, '.jpg');
  });

  fs.writeFileSync(`data/${filename}_updated.csv`, updatedRows.join('\n'));
  console.log(`${filename} updated`);
};

updateCsv('Aiheet.csv');
updateCsv('Laulut.csv');