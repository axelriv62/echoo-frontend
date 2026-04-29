import { useState } from "react";
import { useNavigate } from "react-router";
import { TOKEN_KEY, ROLES_KEY, ID_KEY } from "../../utils/constants";
import {disable} from "../../services/auth.ts";

interface DeactivateAccountButtonProps {
    token: string | null;
    setToken: (token: string | null) => void;
}

const DeactivateAccountButton = ({ token, setToken }: DeactivateAccountButtonProps) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleDeactivate = async () => {
        setIsLoading(true);
        try {
            const result = await disable();
            if (result.success) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(ROLES_KEY);
                localStorage.removeItem(ID_KEY);
                setToken(null);
                navigate("/login");
            } else {
                alert(result.message || "Erreur lors de la désactivation");
            }
        } finally {
            setIsLoading(false);
            setShowConfirmModal(false);
        }
    };

    if (!token) return null;

    return (
        <>
            <div className="mt-2 w-full" onClick={(event) => event.stopPropagation()}>
                <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isLoading}
                    className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold py-1.5 px-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Désactiver le compte
                </button>
            </div>

            {showConfirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => !isLoading && setShowConfirmModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Désactiver votre compte ?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Cette action désactivera votre compte. Vous pourrez le réactiver ultérieurement.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isLoading}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleDeactivate}
                                disabled={isLoading}
                                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                            >
                                {isLoading ? "Désactivation..." : "Désactiver"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeactivateAccountButton;
