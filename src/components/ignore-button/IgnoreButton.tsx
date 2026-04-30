import { useState, type MouseEvent } from "react";
import { toggleIgnoreUser } from "../../services/users.ts";

/**
 * Props for the IgnoreButton component.
 */
type IgnoreUserButtonProps = {
    userId: string;
    token?: string | null;
    initialIsIgnored?: boolean;
    onIgnoreSuccess?: () => void | Promise<void>;
    className?: string;
};

/**
 * IgnoreButton
 *
 * Toggles ignoring/unignoring a user. Maintains local loading/error state
 * and dispatches a global event ('ignoredUsersChanged') on success so other
 * parts of the app can react.
 */
const IgnoreButton = ({
    userId,
    initialIsIgnored = false,
    onIgnoreSuccess,
    className,
}: IgnoreUserButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isIgnored, setIsIgnored] = useState(initialIsIgnored);
    const [error, setError] = useState<string | null>(null);

    const handleIgnoreToggle = async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (isLoading) {
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await toggleIgnoreUser(userId);

        if (result.success) {
            setIsIgnored((previous) => !previous);
            if (onIgnoreSuccess) {
                await onIgnoreSuccess();
            }
            // notify other parts of the app that ignored users changed
            try {
                window.dispatchEvent(new Event('ignoredUsersChanged'));
            } catch {
                // ignore
            }
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="mt-2 w-full" onClick={(event) => event.stopPropagation()}>
            <button
                type="button"
                onClick={handleIgnoreToggle}
                disabled={isLoading}
                className={className ?? `w-full rounded-full text-xs font-semibold py-1.5 px-3 transition ${isIgnored ? "bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20" : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border-[#ef4444] hover:text-[#ef4444]"} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
                {isLoading ? "Mise a jour..." : isIgnored ? "Ne plus ignorer" : "Ignorer"}
            </button>
            {error && <p className="mt-1 text-[11px] text-[#ef4444]">{error}</p>}
        </div>
    );
};

export default IgnoreButton;


