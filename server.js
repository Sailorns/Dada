const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API rute za poruke
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await db.getAllMessages();
        console.log(`Vraćeno ${messages.length} poruka`);
        res.json(messages);
    } catch (error) {
        console.error('Greška pri dohvatanju poruka:', error);
        res.status(500).json({ error: 'Greška pri dohvatanju poruka' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { name, message } = req.body;
        
        // Validacija
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
        
        if (name.length > 50) {
            return res.status(400).json({ 
                success: false, 
                error: 'Ime može imati najviše 50 karaktera' 
            });
        }
        
        if (message.length > 500) {
            return res.status(400).json({ 
                success: false, 
                error: 'Poruka može imati najviše 500 karaktera' 
            });
        }
        
        // Snimi poruku
        const result = await db.addMessage(name.trim(), message.trim());
        
        res.json({ 
            success: true, 
            id: result.id,
            message: 'Poruka je uspešno poslata!'
        });
        
    } catch (error) {
        console.error('Greška pri dodavanju poruke:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Greška pri dodavanju poruke' 
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
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
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
                h1 { 
                    color: #e74c3c; 
                    text-align: center;
                    margin-bottom: 30px;
                }
                .stats {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    text-align: center;
                    font-size: 18px;
                }
                .message { 
                    border: 1px solid #e0e0e0; 
                    padding: 20px; 
                    margin: 15px 0; 
                    border-radius: 8px;
                    background: white;
                }
                .message:hover {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 10px; 
                    border-bottom: 1px solid #f0f0f0;
                    padding-bottom: 10px;
                }
                .name { 
                    font-weight: bold; 
                    color: #e74c3c; 
                    font-size: 1.1em;
                }
                .date { 
                    color: #777; 
                    font-size: 0.9em; 
                }
                .content { 
                    line-height: 1.6; 
                    font-size: 1em;
                }
                .no-messages {
                    text-align: center;
                    color: #666;
                    font-style: italic;
                    padding: 40px;
                    background: #f9f9f9;
                    border-radius: 5px;
                }
                .admin-actions {
                    text-align: center;
                    margin: 20px 0;
                }
                .btn {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    margin: 0 10px;
                }
                .btn:hover {
                    background: #c0392b;
                }
                .btn-clear {
                    background: #95a5a6;
                }
                .btn-clear:hover {
                    background: #7f8c8d;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📋 Admin Panel - Sve poruke</h1>
                <div class="stats">
                    Ukupno poruka: <strong>${messageCount}</strong>
                </div>
                <div class="admin-actions">
                    <a href="/" class="btn">← Nazad na aplikaciju</a>
                    <button onclick="clearAllMessages()" class="btn btn-clear">🗑️ Obriši sve poruke</button>
                </div>
        `;
        
        if (messages.length === 0) {
            html += `
                <div class="no-messages">
                    <h3>📭 Nema poruka</h3>
                    <p>Još niko nije ostavio poruku za rođendan.</p>
                </div>
            `;
        } else {
            messages.forEach(msg => {
                const date = new Date(msg.created_at);
                const formattedDate = date.toLocaleDateString('sr-RS', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                html += `
                <div class="message">
                    <div class="header">
                        <span class="name">👤 ${msg.name}</span>
                        <span class="date">📅 ${formattedDate}</span>
                    </div>
                    <div class="content">💬 ${msg.message}</div>
                </div>
                `;
            });
        }
        
        html += `
            </div>
            <script>
                async function clearAllMessages() {
                    if (confirm('Da li ste sigurni da želite da obrišete SVE poruke?')) {
                        try {
                            const response = await fetch('/api/admin/clear', { method: 'POST' });
                            const result = await response.json();
                            if (result.success) {
                                alert('Sve poruke su obrisane!');
                                location.reload();
                            } else {
                                alert('Greška pri brisanju: ' + result.error);
                            }
                        } catch (error) {
                            alert('Greška pri brisanju poruka');
                        }
                    }
                }
            </script>
        </body>
        </html>
        `;
        
        res.send(html);
    } catch (error) {
        res.status(500).send('Greška pri učitavanju poruka');
    }
});

// API za brisanje svih poruka
app.post('/api/admin/clear', async (req, res) => {
    try {
        await db.clearAllMessages();
        console.log('Sve poruke obrisane');
        res.json({ success: true, message: 'Sve poruke su obrisane' });
    } catch (error) {
        console.error('Greška pri brisanju poruka:', error);
        res.status(500).json({ success: false, error: 'Greška pri brisanju poruka' });
    }
});

// Debug ruta za proveru stanja
app.get('/api/debug', async (req, res) => {
    try {
        const messages = await db.getAllMessages();
        const messageCount = await db.getMessageCount();
        
        res.json({
            status: 'OK',
            server: 'Running',
            database: 'Memory',
            messageCount: messageCount,
            messages: messages,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            status: 'ERROR',
            error: error.message
        });
    }
});

// Serviraj frontend za sve ostale rute
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pokretanje servera
app.listen(PORT, () => {
    console.log(`🎉 Server pokrenut na portu ${PORT}`);
    console.log(`📱 Aplikacija: http://localhost:${PORT}`);
    console.log(`🔧 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`🐛 Debug info: http://localhost:${PORT}/api/debug`);
});
