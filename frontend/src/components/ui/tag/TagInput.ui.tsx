import { useState } from "react";
import { Button } from "../button/Button.ui";
import styles from "./TagInput.module.scss";

export const TagInput = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isInputVisible, setIsInputVisible] = useState(false);

    const handleShowInput = () => {
        setIsInputVisible((prev) => !prev);
    };

    const handleAddTag = () => {
        const trimmed = inputValue.trim();

        if (!trimmed || tags.includes(trimmed)) {
            return;
        }

        setTags((prev) => [...prev, trimmed]);

        setInputValue("");
        setIsInputVisible(false);
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
            {tags.map((tag) => (
                <div key={tag}>{tag}</div>
            ))}

            <div className={styles.tag__wrap}>
                <Button
                    variant="primary"
                    type="button"
                    onClick={handleShowInput}
                >
                    + Add tag
                </Button>

                {isInputVisible && (
                    <input
                        type="text"
                        placeholder="Search or new tag"
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                )}
            </div>
        </div>
    );
};
