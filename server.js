const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// API rute
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await db.getAllMessages();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Greska pri dohvatanju poruka' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { name, message } = req.body;
        if (!name || !message) {
            return res.status(400).json({ success: false, error: 'Ime i poruka su obavezni' });
        }
        const result = await db.addMessage(name, message);
        res.json({ success: true, id: result.id });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Greska pri dodavanju poruke' });
    }
});

app.listen(PORT, () => {
    console.log(`Server pokrenut na portu ${PORT}`);
});
