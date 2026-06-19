import styles from "./Logo.module.scss";

export const Logo = () => {
    return (
        // <div className={styles.logo}>
        //     <svg xmlns="http://www.w3.org/2000/svg" width="148" height="32" viewBox="0 0 148 32" fill="none" aria-label="CRM">
        //         <defs>
        //             <linearGradient id="logoText" x1="0" y1="0" x2="1" y2="1">
        //                 <stop offset="0%" stopColor="#5e81f4" />
        //                 <stop offset="100%" stopColor="#9698d6" />
        //             </linearGradient>
        //             <linearGradient id="logoWave" x1="0" y1="0" x2="1" y2="0">
        //                 <stop offset="0%" stopColor="#5e81f4" stopOpacity="0.8" />
        //                 <stop offset="100%" stopColor="#9698d6" stopOpacity="0.8" />
        //             </linearGradient>
        //         </defs>

        //         <path
        //             d="M16 16 C16 8 4 3 4 10 C4 17 16 24 28 16 C40 8 52 3 52 10 C52 17 40 24 28 16"
        //             stroke="url(#logoWave)"
        //             strokeWidth="2.5"
        //             fill="none"
        //             strokeLinecap="round"
        //         />

        //         <text x="62" y="23" fontFamily="'Red Hat Display', sans-serif" fontWeight="900" fontSize="20" fill="url(#logoText)" letterSpacing="2">CRM</text>

        //         <rect x="62" y="27" width="82" height="1.5" rx="0.75" fill="url(#logoText)" opacity="0.35" />
        //     </svg>
        // </div>

        <div className={styles.logo}>
            CRM<span className={styles.logo__span}>Pro</span>
        </div>
    );
};

export const LogoLoader = () => {
    return (
        <div className={styles.logoLoader}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="56"
                height="32"
                viewBox="0 0 56 32"
                fill="none"
                aria-label="Loading"
            >
                <defs>
                    <linearGradient
                        id="loaderLogoWave"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <stop
                            offset="0%"
                            stopColor="#5e81f4"
                            stopOpacity="0.8"
                        />
                        <stop
                            offset="100%"
                            stopColor="#9698d6"
                            stopOpacity="0.8"
                        />
                    </linearGradient>
                </defs>

                <path
                    className={styles.wave}
                    d="M16 16 C16 8 4 3 4 10 C4 17 16 24 28 16 C40 8 52 3 52 10 C52 17 40 24 28 16"
                    stroke="url(#loaderLogoWave)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
