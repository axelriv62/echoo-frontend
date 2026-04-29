import { useState, useEffect } from 'react';
import { getTopics, createTopic, deleteTopic } from '../../services/topics.ts';
import type { Topic } from '../../utils/types';
import {ROLES_KEY} from "../../utils/constants.ts";

interface TopicsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTopicIds: string[];
    onTopicsChange: (topicIds: string[]) => void;
    onTopicsUpdated: () => void;
}

const TopicsModal = ({
                         isOpen,
                         onClose,
                         selectedTopicIds,
                         onTopicsChange,
                         onTopicsUpdated,
                     }: TopicsModalProps) => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const storedRoles = JSON.parse(localStorage.getItem(ROLES_KEY) ?? '[]') as string[];
    const isAdmin = storedRoles.includes('ROLE_ADMIN')

    useEffect(() => {
        if (isOpen) {
            loadTopics();
        }
    }, [isOpen]);

    const loadTopics = async () => {
        setLoading(true);
        const result = await getTopics();

        if (result.success) {
            setTopics(result.topics);
            setError(null);
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const handleAddTopic = async () => {
        if (!isAdmin) {
            setError("Accès refusé : action réservée aux administrateurs");
            return;
        }

        if (!newTopicName.trim()) {
            setError('Le nom du topic ne peut pas être vide');
            setSuccess(null);
            return;
        }

        setIsAddingTopic(true);
        setError(null);
        setSuccess(null);

        const result = await createTopic(newTopicName.trim());

        if (result.success) {
            setNewTopicName('');
            setSuccess(result.message);
            await loadTopics();
            onTopicsUpdated();

            setTimeout(() => {
                setSuccess(null);
            }, 2500);
        } else {
            setError(result.message);
        }

        setIsAddingTopic(false);
    };

    const handleDeleteTopic = async (topicId: string) => {
        if (!isAdmin) {
            setError("Accès refusé : action réservée aux administrateurs");
            return;
        }

        setError(null);
        setSuccess(null);

        const result = await deleteTopic(topicId);

        if (result.success) {
            if (selectedTopicIds.includes(topicId)) {
                onTopicsChange(selectedTopicIds.filter(id => id !== topicId));
            }

            setSuccess(result.message);
            await loadTopics();
            onTopicsUpdated();

            setTimeout(() => {
                setSuccess(null);
            }, 2500);
        } else {
            setError(result.message);
        }
    };

    const handleToggleTopic = (topicId: string) => {
        if (selectedTopicIds.includes(topicId)) {
            onTopicsChange(selectedTopicIds.filter(id => id !== topicId));
        } else {
            onTopicsChange([...selectedTopicIds, topicId]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-[#e5e7eb]">
                    <h2 className="text-xl font-bold">Sélectionner les topics</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {error && (
                        <div className="bg-[#ef4444]/10 border border-[#ef4444] text-[#ef4444] px-3 py-2 rounded text-sm mb-3">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-[#10b981]/10 border border-[#10b981] text-[#10b981] px-3 py-2 rounded text-sm mb-3">
                            {success}
                        </div>
                    )}

                    <div className="mb-4 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Ajouter un nouveau topic
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                placeholder="Nom du topic"
                                className="flex-1 px-3 py-2 border border-[#e5e7eb] rounded text-sm outline-none focus:border-[#a237ff]"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTopic();
                                    }
                                }}
                                disabled={isAddingTopic}
                            />

                            <button
                                onClick={handleAddTopic}
                                disabled={isAddingTopic || !newTopicName.trim()}
                                className="px-3 py-2 bg-[#a237ff] text-white rounded text-sm hover:bg-[#8a1fb8] disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isAddingTopic ? '...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-500 py-4">Chargement...</div>
                    ) : topics.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">Aucun topic disponible</div>
                    ) : (
                        <div className="space-y-2">
                            {topics.map((topic) => (
                                <div
                                    key={topic.id}
                                    className="flex items-center justify-between p-3 border border-[#e5e7eb] rounded hover:bg-gray-50"
                                >
                                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedTopicIds.includes(topic.id)}
                                            onChange={() => handleToggleTopic(topic.id)}
                                            className="w-4 h-4 text-[#a237ff] rounded"
                                        />
                                        <span>{topic.name}</span>
                                    </label>

                                    <button
                                        onClick={() => handleDeleteTopic(topic.id)}
                                        className="text-gray-400 hover:text-red-500 transition text-sm"
                                        title="Supprimer ce topic"
                                        type="button"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[#e5e7eb] flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-[#e5e7eb] rounded hover:bg-gray-50 transition"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopicsModal;