const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const recordsFile = 'records.json';

// Load records from the JSON file
function loadRecords() {
    if (fs.existsSync(recordsFile)) {
        const data = fs.readFileSync(recordsFile);
        return JSON.parse(data);
    }
    return [];
}

// Save records to the JSON file
function saveRecords(records) {
    fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2));
}

app.get('/records', (req, res) => {
    const records = loadRecords();
    res.json(records);
});

app.post('/records', (req, res) => {
    const newRecord = req.body;
    const records = loadRecords();
    records.push(newRecord);
    saveRecords(records);
    res.status(201).send('Record added');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
