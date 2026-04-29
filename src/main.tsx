import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router"
import App from './App.tsx'
import './index.css'
import { TOKEN_KEY } from './utils/constants'
import NavBar from "./components/nav-bar/nav-bar.tsx";

function Root() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

    return (
        <StrictMode>
            <BrowserRouter>
                {token && <NavBar />}
                <App token={token} setToken={setToken} />
            </BrowserRouter>
        </StrictMode>
    );
}

createRoot(document.getElementById('root')!).render(<Root />);
