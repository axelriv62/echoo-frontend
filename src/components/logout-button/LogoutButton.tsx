import { useState } from "react";
import { useNavigate } from "react-router";
import { TOKEN_KEY, ROLES_KEY, ID_KEY } from "../../utils/constants";

interface LogoutButtonProps {
    token: string | null;
    setToken: (token: string | null) => void;
}

const LogoutButton = ({ token, setToken }: LogoutButtonProps) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        setIsLoading(true);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLES_KEY);
        localStorage.removeItem(ID_KEY);
        setToken(null);
        navigate("/login");
    };

    if (!token) return null;

    return (
        <div className="w-full" onClick={(event) => event.stopPropagation()}>
            <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Déconnexion..." : "Se déconnecter"}
            </button>
        </div>
    );
};

export default LogoutButton;
