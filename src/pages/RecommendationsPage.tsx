import RecommendedUsers from "../components/recommended-users/RecommendedUsers";
import RecommendedPosts from "../components/recommended-posts/RecommendedPosts";

/**
 * Deprecated recommendations page kept for legacy routing support.
 */
const RecommendationsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 space-y-6">
                <RecommendedUsers />
                <RecommendedPosts />
            </div>
        </div>
    );
};

export default RecommendationsPage;
