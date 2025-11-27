document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('messageForm');
    const messagesList = document.getElementById('messagesList');
    
    // Učitaj postojeće poruke
    loadMessages();
    
    // Pošalji novu poruku
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        
        fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Očisti formu
                form.reset();
                
                // Prikaži poruku o uspjehu
                showSuccessMessage('Vaša čestitka je uspješno poslana!');
                
                // Ponovno učitaj poruke
                loadMessages();
            } else {
                alert('Došlo je do greške: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Greška:', error);
            alert('Došlo je do greške prilikom slanja poruke.');
        });
    });
    
    function loadMessages() {
        fetch('/api/messages')
            .then(response => response.json())
            .then(messages => {
                displayMessages(messages);
            })
            .catch(error => {
                console.error('Greška pri učitavanju poruka:', error);
            });
    }
    
    function displayMessages(messages) {
        messagesList.innerHTML = '';
        
        if (messages.length === 0) {
            messagesList.innerHTML = '<p>Još nema čestitki. Budite prvi!</p>';
            return;
        }
        
        // Sortiraj poruke po datumu (najnovije prvo)
        messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        messages.forEach(msg => {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';
            
            const messageHeader = document.createElement('div');
            messageHeader.className = 'message-header';
            
            const messageAuthor = document.createElement('div');
            messageAuthor.className = 'message-author';
            messageAuthor.textContent = msg.name;
            
            const messageDate = document.createElement('div');
            messageDate.className = 'message-date';
            messageDate.textContent = formatDate(msg.created_at);
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.textContent = msg.message;
            
            messageHeader.appendChild(messageAuthor);
            messageHeader.appendChild(messageDate);
            messageCard.appendChild(messageHeader);
            messageCard.appendChild(messageContent);
            
            messagesList.appendChild(messageCard);
        });
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('hr-HR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function showSuccessMessage(text) {
        // Ukloni postojeću poruku o uspjehu ako postoji
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = text;
        successDiv.style.display = 'block';
        
        form.parentNode.insertBefore(successDiv, form);
        
        // Sakrij poruku nakon 3 sekunde
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
});