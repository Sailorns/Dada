const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Test ruta za proveru baze
app.get('/api/test-db', async (req, res) => {
    try {
        const messages = await db.getAllMessages();
        res.json({
            status: 'SUPABASE CONNECTED',
            database: 'PostgreSQL',
            messageCount: messages.length,
            messages: messages,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            status: 'DATABASE ERROR',
            error: error.message
        });
    }
});

// API rute za poruke
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await db.getAllMessages();
        console.log(`Vraćeno ${messages.length} poruka iz Supabase`);
        res.json(messages);
    } catch (error) {
        console.error('Greška pri dohvatanju poruka:', error);
        res.status(500).json({ error: 'Greška pri dohvatanju poruka' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { name, message } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ 
                success: false, 
                error: 'Ime je obavezno' 
            });
        }
        
        if (!message || !message.trim()) {
            return res.status(400).json({ 
                success: false, 
                error: 'Poruka je obavezna' 
            });
        }
        
        // Snimi poruku
        const result = await db.addMessage(name.trim(), message.trim());
        
        res.json({ 
            success: true, 
            id: result.id,
            message: 'Poruka je uspešno poslata! 🎉'
        });
        
    } catch (error) {
        console.error('Greška pri dodavanju poruke:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Greška pri dodavanju poruke: ' + error.message 
        });
    }
});

// ADMIN RUTE
app.get('/admin', async (req, res) => {
    try {
        const messages = await db.getAllMessages();
        const messageCount = await db.getMessageCount();
        
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Admin - Sve poruke</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    background: #f5f5f5;
                }
                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #e74c3c; text-align: center; }
                .stats {
                    background: #2ecc71;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    text-align: center;
                }
                .message { 
                    border: 1px solid #ddd; 
                    padding: 20px; 
                    margin: 15px 0; 
                    border-radius: 8px;
                    background: white;
                }
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 10px; 
                    border-bottom: 1px solid #f0f0f0;
                    padding-bottom: 10px;
                }
                .name { font-weight: bold; color: #e74c3c; }
                .date { color: #777; font-size: 0.9em; }
                .content { line-height: 1.6; }
                .btn {
                    background: #e74c3c;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📋 Admin Panel - SUPABASE</h1>
                <div class="stats">
                    💾 Baza: Supabase PostgreSQL<br>
                    📊 Ukupno poruka: <strong>${messageCount}</strong>
                </div>
                <a href="/" class="btn">← Nazad na aplikaciju</a>
                <a href="/api/test-db" class="btn" style="background: #3498db;">🧪 Test Baze</a>
        `;
        
        if (messages.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>📭 Nema poruka</h3>
                    <p>Još niko nije ostavio poruku za rođendan.</p>
                </div>
            `;
        } else {
            messages.forEach(msg => {
                html += `
                <div class="message">
                    <div class="header">
                        <span class="name">👤 ${msg.name}</span>
                        <span class="date">📅 ${new Date(msg.created_at).toLocaleString('sr-RS')}</span>
                    </div>
                    <div class="content">💬 ${msg.message}</div>
                </div>
                `;
            });
        }
        
        html += `</div></body></html>`;
        res.send(html);
    } catch (error) {
        res.status(500).send('Greška pri učitavanju poruka: ' + error.message);
    }
});

// Serviraj frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server pokrenut na portu ${PORT}`);
    console.log(`💾 Baza: Supabase PostgreSQL`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log(`📱 Aplikacija: http://localhost:${PORT}`);
    console.log(`👨‍💼 Admin: http://localhost:${PORT}/admin`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test-db`);
});
