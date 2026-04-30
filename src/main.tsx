import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router"
import App from './App.tsx'
import './index.css'
import { TOKEN_KEY } from './utils/constants'
import NavBar from "./components/nav-bar/NavBar.tsx";

// Load the saved auth token once so the app can restore the user's session.
export function Root() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

    return (
        <StrictMode>
            <BrowserRouter>
                {/* Show the navigation bar only when the user is authenticated. */}
                {token && <NavBar />}
                <App token={token} setToken={setToken} />
            </BrowserRouter>
        </StrictMode>
    );
}

createRoot(document.getElementById('root')!).render(<Root />);
