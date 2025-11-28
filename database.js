// database.js - Supabase PostgreSQL Database
const { createClient } = require('@supabase/supabase-js');

// Vaši Supabase podaci
const supabaseUrl = 'https://itlejzwfxnestwttxzgw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bGVqendmeG5lc3R3dHR4emd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTQzOTEsImV4cCI6MjA3OTg5MDM5MX0.Rp_bLFrcExOyvYN6g6MyxaLFVOU-bs6JFEsxlHG4UD0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllMessages() {
    try {
        console.log('Dohvatam poruke iz Supabase...');
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase greška:', error);
            return [];
        }
        
        console.log(`Pronađeno ${data?.length || 0} poruka`);
        return data || [];
    } catch (error) {
        console.error('Greška konekcije sa bazom:', error);
        return [];
    }
}

async function addMessage(name, message) {
    try {
        console.log('Čuvam poruku u Supabase...');
        const { data, error } = await supabase
            .from('messages')
            .insert([
                { 
                    name: name.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
                    message: message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                }
            ])
            .select();
        
        if (error) {
            console.error('Supabase insert greška:', error);
            throw error;
        }
        
        console.log('Poruka uspešno sačuvana. ID:', data[0].id);
        return { id: data[0].id };
        
    } catch (error) {
        console.error('Greška pri čuvanju poruke:', error);
        throw error;
    }
}

async function getMessageCount() {
    try {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.error('Supabase count greška:', error);
            return 0;
        }
        
        return count;
    } catch (error) {
        console.error('Count greška:', error);
        return 0;
    }
}

async function clearAllMessages() {
    try {
        const { error } = await supabase
            .from('messages')
            .delete()
            .neq('id', 0);
        
        if (error) {
            console.error('Supabase delete greška:', error);
            throw error;
        }
        
        console.log('Sve poruke obrisane iz Supabase');
        return true;
    } catch (error) {
        console.error('Greška pri brisanju poruka:', error);
        throw error;
    }
}

module.exports = {
    getAllMessages,
    addMessage,
    getMessageCount,
    clearAllMessages
};
