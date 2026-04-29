import RecommendedUsers from "../components/suggested_user/RecommendedUsers";
import RecommendedPosts from "../components/suggested_post/RecommendedPosts";

const RecommendationsPage = ({ token }: { token: string | null; setToken: (token: string | null) => void }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 space-y-6">
                <RecommendedUsers token={token} />
                <RecommendedPosts token={token} />
            </div>
        </div>
    );
};

export default RecommendationsPage;
