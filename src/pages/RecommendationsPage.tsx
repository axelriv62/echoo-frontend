import { useNavigate } from "react-router";
import RecommendedUsers from "../components/suggested_user/RecommendedUsers";

const RecommendationsPage = () => {
    useNavigate();
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 flex justify-center">
                <RecommendedUsers />
            </div>
        </div>
    );
};

export default RecommendationsPage;
