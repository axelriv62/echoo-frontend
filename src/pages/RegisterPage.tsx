import { useState } from 'react';
import { useNavigate } from "react-router";
import { register } from "../hooks/auth.ts";

/**
 * RegisterPage component allows users to create a new account by providing a username and password.
 * It handles form submission, displays success or error messages, and redirects to the login page upon successful registration.
 */
function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!formData.username.trim() || !formData.password.trim()) {
      setMessage({ type: 'error', text: "Veuillez remplir tous les champs" });
      return;
    }

    setLoading(true);
    const result = await register({ username: formData.username.trim(), password: formData.password });
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setTimeout(() => navigate('/login'), 2000);
    }
    setLoading(false);
  };

  return (
      <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-3xl font-bold text-white text-center">S'inscrire</h2>
            </div>

            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                    placeholder="robert.duchmol"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                    placeholder="••••••••"
                />
              </div>

              {message && (
                  <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                      message.type === 'success'
                          ? 'bg-green-50 border border-green-200 text-green-700'
                          : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message.text}
                  </div>
              )}

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </form>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Déjà inscrit ?{" "}
                <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition">
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
  );
}

export default RegisterPage;
