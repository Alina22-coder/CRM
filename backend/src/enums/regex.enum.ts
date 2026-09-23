const RegexEnum = {
    PASSWORD: /^.{8,128}$/,
    // Latin or Cyrillic, starts with a capital; allows apostrophe and hyphen (Ol'ha, Anna-Maria)
    NAME: /^\p{Lu}[\p{L}'’-]{1,49}$/u,
};

export default RegexEnum;
