import { useState } from 'react';
import { useNavigate } from "react-router";
import { register } from "../services/auth.ts";

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
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a237ff]/5 to-[#000000]/5 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#e5e7eb]">
            <div className="bg-gradient-to-r from-[#a237ff] to-[#8a1fb8] px-8 py-8">
              <h2 className="text-3xl font-bold text-white text-center">S'inscrire</h2>
            </div>

            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-[#000000] mb-2">
                  Nom d'utilisateur
                </label>
                <input
                    id="username"
                    type="text"
                    autoComplete="username"
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
                    autoComplete="new-password"
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
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </form>

            <div className="px-8 py-6 bg-[#fafafa] border-t border-[#e5e7eb]">
              <p className="text-center text-[#000000]">
                Déjà inscrit ?{" "}
                <a href="/login" className="font-semibold text-[#a237ff] hover:text-[#8a1fb8] transition">
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
