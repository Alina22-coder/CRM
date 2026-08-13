import { useState } from "react";
import { Button } from "../button/Button.ui";
import { orderService } from "../../../services/orders.service";
import { toast } from "sonner";
import styles from "./TagInput.module.scss";

interface TagInputProps {
    orderId: string;
    tags: string[];
    onChange: (tags: string[]) => void;
}

export const TagInput = ({ orderId, tags, onChange }: TagInputProps) => {
    const [inputValue, setInputValue] = useState("");
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const persistTags = (nextTags: string[]) => {
        setIsSaving(true);
        orderService
            .updateOrderTags(orderId, nextTags)
            .then(() => onChange(nextTags))
            .catch(() => toast.error("Failed to save tags"))
            .finally(() => setIsSaving(false));
    };

    const handleShowInput = () => {
        setIsInputVisible((prev) => !prev);
    };

    const handleAddTag = () => {
        const trimmed = inputValue.trim();

        if (!trimmed || tags.includes(trimmed)) {
            return;
        }

        persistTags([...tags, trimmed]);
        setInputValue("");
        setIsInputVisible(false);
    };

    const handleRemoveTag = (tag: string) => {
        persistTags(tags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddTag();
        }

        if (e.key === "Escape") {
            setIsInputVisible(false);
        }
    };

    return (
        <div className={styles.tag}>
            <div className={styles.tag__list}>
                {tags.map((tag) => (
                    <div key={tag} className={styles.tag__chip}>
                        {tag}
                        <button
                            type="button"
                            className={styles.tag__chip__remove}
                            onClick={() => handleRemoveTag(tag)}
                            disabled={isSaving}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div className={styles.tag__wrap}>
                <Button
                    variant="primary"
                    type="button"
                    onClick={handleShowInput}
                    disabled={isSaving}
                >
                    + Add tag
                </Button>

                {isInputVisible && (
                    <input
                        type="text"
                        placeholder="New tag"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                )}
            </div>
        </div>
    );
};
