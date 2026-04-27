import {useState} from 'react';
import {useRegister} from "../hooks/auth.ts";

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { register, loading, error, successMessage } = useRegister();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValidationError(null);

    if (!username.trim() || !password.trim()) {
      setValidationError('Le username et le password sont obligatoires.');
      return;
    }

    await register({
      username: username.trim(),
      password,
    });
  };

  return (
    <section className="auth-container">
      <h2>S'inscrire</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={loading}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {"S'inscrire"}
        </button>
      </form>

      {validationError ? <p className="auth-message auth-error">{validationError}</p> : null}
      {error ? <p className="auth-message auth-error">{error}</p> : null}
      {successMessage ? <p className="auth-message auth-success">{successMessage}</p> : null}
    </section>
  );
}

export default RegisterPage;

