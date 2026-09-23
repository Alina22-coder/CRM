const RegexEnum = {
    PASSWORD: /^.{1,}$/,
    NAME: /^\p{Lu}[\p{L}'’-]{1,49}$/u,
    EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
};

export default RegexEnum;
