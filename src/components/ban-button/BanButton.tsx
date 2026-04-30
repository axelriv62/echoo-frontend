import { useState, useEffect, type MouseEvent } from "react";
import { banUser, unbanUser } from "../../services/users.ts";

/**
 * Props for the BanButton component.
 */
type BanUserButtonProps = {
    userId: string;
    token?: string | null;
    reason?: string;
    bannedAt?: string;
    unbannedAt?: string | null;
    initialIsBanned?: boolean;
    onBanSuccess?: () => void | Promise<void>;
    className?: string;
};

/**
 * BanButton
 *
 * Small control used to ban or unban a user. The component shows a loading
 * state while the request is in progress and displays a small error message
 * when the API returns an error. It also emits a global event
 * ('bannedUsersChanged') to notify other parts of the app when the state
 * changes.
 */
const BanButton = ({
    userId,
    reason = "Violation des regles de la communaute",
    bannedAt,
    unbannedAt = null,
    initialIsBanned = false,
    onBanSuccess,
    className,
}: BanUserButtonProps) => {
    // Loading indicator for network requests
    const [isLoading, setIsLoading] = useState(false);
    // Local banned state (controlled by parent initialIsBanned)
    const [isBanned, setIsBanned] = useState(initialIsBanned);
    // Error message string displayed under the button
    const [error, setError] = useState<string | null>(null);

    // Keep local isBanned in sync if parent changes the initial value
    useEffect(() => {
        setIsBanned(initialIsBanned);
    }, [initialIsBanned]);

    /**
     * Toggle ban state. Stops event propagation to avoid triggering parent
     * click handlers. Debounces via isLoading guard. Calls provided
     * onBanSuccess callback when the operation succeeds.
     */
    const handleBanToggle = async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (isLoading) {
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = isBanned
            ? await unbanUser({ userId })
            : await banUser({
                userId,
                reason,
                bannedAt: bannedAt ?? new Date().toISOString(),
                unbannedAt,
            });

        if (result.success) {
            // Toggle local state and notify parent if a callback exists
            setIsBanned((previous) => !previous);
            if (onBanSuccess) {
                await onBanSuccess();
            }
            // Notify other parts of the app that banned users changed
            try {
                window.dispatchEvent(new Event("bannedUsersChanged"));
            } catch {
                // Silently ignore environments that disallow dispatching
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
                onClick={handleBanToggle}
                disabled={isLoading}
                className={className ?? `w-full rounded-full text-xs font-semibold py-1.5 px-3 transition ${isBanned ? "bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20" : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border-[#ef4444] hover:text-[#ef4444]"} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
                {isLoading ? "Mise a jour..." : isBanned ? "Debannir" : "Bannir"}
            </button>
            {error && <p className="mt-1 text-[11px] text-[#ef4444]">{error}</p>}
        </div>
    );
};

export default BanButton;
