import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

function CommentItem({ comment, onDelete }) {
    const { user: currentUser } = useAuthStore();
    const isMine = currentUser && comment.user_id === currentUser.id;

    const avatarUrl = comment.user?.profile_image // Correct field name? Backend sends 'profile_image' usually in raw, but include maps to model.
        ? `${API_BASE_URL}${comment.user.profile_image}`
        : null;

    // Check backend service: `attributes: ['id', 'name', 'profile_image', 'email']`
    // Wait, does sequelize return snake_case for attributes if defined in array? 
    // It returns as defined in model attribute mapping OR as alias.
    // User model usually maps `profile_image` (DB) to `profileImage` (Camel).
    // I should check `user.controller.js` or `createComment` response.
    // Step 246: `include: { model: User, ..., attributes: ['id', ... 'profile_image'] }`
    // If `profile_image` is valid column name, it returns it.

    // Safe accessor:
    const userParams = comment.user || {};
    const userImage = userParams.profile_image || userParams.profileImage;
    const safeAvatarUrl = userImage ? `${API_BASE_URL}${userImage}` : null;

    return (
        <div className="flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {safeAvatarUrl ? (
                    <img src={safeAvatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                        {userParams.name?.charAt(0) || "?"}
                    </div>
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-gray-900">{userParams.name || "Unknown"}</span>
                    <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</div>
            </div>
            {isMine && (
                <button
                    onClick={() => onDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                    title="Delete comment"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
}

export default function CommentList({ comments = [], onDelete }) {
    if (comments.length === 0) {
        return <div className="text-sm text-gray-500 italic">No comments yet.</div>;
    }

    return (
        <div className="space-y-4">
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onDelete={onDelete} />
            ))}
        </div>
    );
}
