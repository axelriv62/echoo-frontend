import RecommendedUsers from "../components/suggested_user/RecommendedUsers";

const RecommendationsPage = ({ token }: { token: string | null; setToken: (token: string | null) => void }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 flex justify-center">
                <RecommendedUsers token={token} />
            </div>
        </div>
    );
};

export default RecommendationsPage;
