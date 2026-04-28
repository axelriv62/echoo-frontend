import type { Post } from "../../utils/types.ts";
import {Button} from "@mui/material";

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const profileImage = post.user.imageProfile || '/src/assets/no-profile-picture.jpg';

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
                <img
                    src={profileImage}
                    alt={post.user.username}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/no-profile-picture.jpg';
                    }}
                />
                <span className="text-sm font-semibold text-gray-700">{post.user.username}</span>
                {post.page && <span className="text-sm text-gray-500">{post.page.name}</span>}
            </div>

            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-700 mb-4">{post.description}</p>

            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {post.topics?.map((topic) => (
                        <span key={topic.id} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {topic.name}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    <Button>👍 {post.nbLikes}</Button>
                    <Button>👎 {post.nbDislikes}</Button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
