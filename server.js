const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API rute
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await db.getAllMessages();
        res.json(messages);
    } catch (error) {
        console.error('Greška pri dohvaćanju poruka:', error);
        res.status(500).json({ error: 'Greška pri dohvaćanju poruka' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { name, message } = req.body;
        
        if (!name || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Ime i poruka su obavezni' 
            });
        }
        
        // Osnovna zaštita od XSS napada
        const sanitizedName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const sanitizedMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        const result = await db.addMessage(sanitizedName, sanitizedMessage);
        res.json({ success: true, id: result.id });
    } catch (error) {
        console.error('Greška pri dodavanju poruke:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Greška pri dodavanju poruke' 
        });
    }
});

// Serviraj frontend za sve rute osim API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server pokrenut na portu ${PORT}`);
});