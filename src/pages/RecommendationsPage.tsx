import RecommendedUsers from "../components/suggested_user/RecommendedUsers";
import RecommendedPosts from "../components/suggested_post/RecommendedPosts";

/**
 * DEPRECATED: This page is no longer used as the recommendations are now integrated into the home page.
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
