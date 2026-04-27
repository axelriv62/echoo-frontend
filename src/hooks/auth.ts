import {API_URL} from '../utils/constants'

export const signin = async (username: string, password: string) => {
    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: 'POST',
            body: JSON.stringify(
                {username, password}
            )
        }
    )

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.token);
    } else {
        alert("login/password incorrect")
    }
}

