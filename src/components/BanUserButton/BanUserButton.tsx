import { useState, type MouseEvent } from "react";
import { banUser } from "../../services/users.ts";

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

const BanUserButton = ({
    userId,
    reason = "Violation des regles de la communaute",
    bannedAt,
    unbannedAt = null,
    initialIsBanned = false,
    onBanSuccess,
    className,
}: BanUserButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isBanned, setIsBanned] = useState(initialIsBanned);
    const [error, setError] = useState<string | null>(null);

    const handleBan = async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (isLoading || isBanned) {
            return;
        }

        setIsLoading(true);
        setError(null);

        const payload = {
            userId,
            reason,
            bannedAt: bannedAt ?? new Date().toISOString(),
            unbannedAt,
        };

        const result = await banUser(payload);

        if (result.success) {
            setIsBanned(true);
            if (onBanSuccess) {
                await onBanSuccess();
            }
            // notify other parts of the app that banned users changed
            try {
                window.dispatchEvent(new Event("bannedUsersChanged"));
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
                onClick={handleBan}
                disabled={isLoading || isBanned}
                className={className ?? `w-full rounded-full text-xs font-semibold py-1.5 px-3 transition ${isBanned ? "bg-[#ef4444]/10 text-[#ef4444]" : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border-[#ef4444] hover:text-[#ef4444]"} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
                {isLoading ? "Mise a jour..." : isBanned ? "Banni" : "Bannir"}
            </button>
            {error && <p className="mt-1 text-[11px] text-[#ef4444]">{error}</p>}
        </div>
    );
};

export default BanUserButton;

