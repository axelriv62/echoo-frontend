import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { signin } from "../services/auth.ts";

/**
 * LoginPage component allows users to log in by providing their username and password.
 * It handles form submission, displays success or error messages, and redirects to the home page upon successful login.
 * @param setToken - A function to set the authentication token in the parent component's state
 */
const LoginPage = ({ setToken }: { setToken: (token: string | null) => void }) => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const stateMessage = (location.state as { message?: string } | null)?.message;
        if (!stateMessage) {
            return;
        }

        Promise.resolve().then(() => {
            setMessage({ type: 'success', text: stateMessage });
        });
    }, [location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!formData.username.trim() || !formData.password.trim()) {
            setMessage({ type: 'error', text: "Veuillez remplir tous les champs" });
            return;
        }

        setLoading(true);
        const result = await signin({ username: formData.username.trim(), password: formData.password.trim() });
        setMessage({ type: result.success ? 'success' : 'error', text: result.message });

        if (result.success && result.token) {
            setToken(result.token);
            setTimeout(() => navigate("/"));
        }

        setLoading(false);
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a237ff]/5 to-[#000000]/5 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#e5e7eb]">
                    <div className="bg-gradient-to-r from-[#a237ff] to-[#8a1fb8] px-8 py-8">
                        <h1 className="text-3xl font-bold text-white text-center">Se connecter</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-[#000000] mb-2">
                                Nom d'utilisateur
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                disabled={loading}
                                className="input-field"
                                placeholder="robert.duchmol"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[#000000] mb-2">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={loading}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        {message && (
                            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                                message.type === 'success'
                                    ? 'bg-[#10b981]/10 border border-[#10b981] text-[#10b981]'
                                    : 'bg-[#ef4444]/10 border border-[#ef4444] text-[#ef4444]'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? "Connexion en cours..." : "Se connecter"}
                        </button>
                    </form>

                    <div className="px-8 py-6 bg-[#fafafa] border-t border-[#e5e7eb]">
                        <p className="text-center text-[#000000]">
                            Pas encore inscrit ?{" "}
                            <a href="/register" className="font-semibold text-[#a237ff] hover:text-[#8a1fb8] transition">
                                S'inscrire
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;
