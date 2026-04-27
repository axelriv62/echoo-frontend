import { useState } from 'react';
import { Routes, Route } from "react-router";
import './App.css'
import { deactivate } from './hooks/auth';
import RegisterPage from './pages/RegisterPage'

function HOME() {
    const [token, setToken] = useState('');

    const handleDeactivate = async () => {
        if (!token) {
            alert('Veuillez entrer un token');
            return;
        }
        localStorage.setItem('authToken', token);
        await deactivate();
    };

    return (
        <div>
            <h2>Bienvenue sur Echoo</h2>
            <input
                type="text"
                placeholder="Entrez votre token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
            />
            <button onClick={handleDeactivate}>
                Désactiver mon compte
            </button>
            <p>Ceci est la page d'accueil.</p>
        </div>
    );
}

function ERROR() {
    return (
        <div>
            <h2>404 - Page non trouvée</h2>
            <p>La page que vous recherchez n'existe pas.</p>
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HOME />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<ERROR />} />
        </Routes>
    )
}

export default App
