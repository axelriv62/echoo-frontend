import { useNavigate } from "react-router";

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#a237ff]/10 to-[#a237ff]/5 p-4">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Page non trouvée</h2>
                <p className="text-gray-600 mb-6">Désolé, la page que vous recherchez n'existe pas.</p>
                <button
                    onClick={() => navigate("/")}
                    className="rounded-lg bg-[#a237ff] hover:bg-[#8a1fb8] text-white font-semibold py-2 px-6 transition duration-200"
                >
                    Retour à l'accueil
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;
