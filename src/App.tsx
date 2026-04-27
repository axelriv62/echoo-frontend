import { Routes, Route } from "react-router";
import './App.css'

function HOME() {
  return (
      <div>
        <h2>Bienvenue sur Echoo</h2>
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
       <Route path="*" element={<ERROR />} />
    </Routes>
  )
}

export default App
