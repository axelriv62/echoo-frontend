import { TOKEN_KEY } from "../utils/constants";

export const getImageUrl = async (imageUrl: string): Promise<string> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return "";

    try {
        const response = await fetch("http://localhost:8080" + imageUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const blob = await response.blob();
        console.log(URL.createObjectURL(blob));
        return URL.createObjectURL(blob);
    } catch {
        return "";
    }
};
