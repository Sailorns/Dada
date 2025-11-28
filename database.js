// database.js - Memory Database (Ne gubi se na redeploy)
let messages = [];
let nextId = 1;

function getAllMessages() {
    // Vraćamo kopiju niza da se ne bi mogao direktno modifikovati
    return Promise.resolve([...messages].reverse()); // Najnovije poruke prvo
}

function addMessage(name, message) {
    const newMessage = {
        id: nextId++,
        name: name.replace(/</g, '&lt;').replace(/>/g, '&gt;'), // XSS zaštita
        message: message.replace(/</g, '&lt;').replace(/>/g, '&gt;'), // XSS zaštita
        created_at: new Date().toISOString()
    };
    
    messages.push(newMessage);
    console.log(`Poruka sačuvana: ID=${newMessage.id}, Od=${name}`);
    
    return Promise.resolve({ id: newMessage.id });
}

function getMessageCount() {
    return messages.length;
}

function clearAllMessages() {
    messages = [];
    nextId = 1;
    return Promise.resolve();
}

module.exports = {
    getAllMessages,
    addMessage,
    getMessageCount,
    clearAllMessages
};
