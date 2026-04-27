import { useState } from 'react';
import { API_URL } from '../utils/constants';

export const signin = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.token);
    } else {
        alert("login/password incorrect");
    }
}


type RegisterPayload = {
	username: string;
	password: string;
};

export function useRegister() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const register = async ({ username, password }: RegisterPayload) => {
		setLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const response = await fetch(`${API_URL}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				setError("Échec de l'inscription");
				return false;
			}

			setSuccessMessage('Inscription réussie');
			return true;
		} catch {
			setError('Erreur de réseau');
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { register, loading, error, successMessage };
}
