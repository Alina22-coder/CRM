import styles from "./Button.module.scss";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

export const Button = ({
    children,
    onClick,
    variant = "primary",
    type,
    disabled = false,
}: ButtonProps) => {
    return (
        <button
            className={styles[variant]}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
