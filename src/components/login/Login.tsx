import { useState } from "react";
import { signin } from "../../hooks/auth";
import AuthButton from "../AuthButton";

interface AuthFormProps {
    token: string | null;
    setToken: (token: string | null) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ token, setToken }) => {
    const [user, setUser] = useState({ name: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await signin(user.name, user.password);
            const storedToken = localStorage.getItem("authToken");
            setToken(storedToken);
            setIsLoggedIn(true);
        } catch {
            setIsLoggedIn(false);
            alert("Identifiants invalides");
        } finally {
            setLoading(false);
        }
    };

    if (isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md text-center">
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Bienvenue {user.name} 👋
                    </h1>
                    <p className="mt-2 text-slate-600">Connexion réussie.</p>
                    <div className="mt-4 flex justify-center">
                        <AuthButton
                            token={token}
                            setToken={setToken}
                            onLogout={() => setIsLoggedIn(false)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md space-y-4"
            >
                <h1 className="text-xl font-semibold text-slate-800">Connexion</h1>

                {token && (
                    <p className="text-xs text-emerald-600 break-all">
                        Token: {token}
                    </p>
                )}

                <div>
                    <label htmlFor="name" className="mb-1 block text-sm text-slate-700">
                        Nom d’utilisateur
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ex: bylel"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="mb-1 block text-sm text-slate-700">
                        Mot de passe
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? "Connexion..." : "Se connecter"}
                </button>
            </form>
        </div>
    );
};

export default AuthForm;