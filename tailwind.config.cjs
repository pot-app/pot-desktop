// tailwind.config.js
const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        // ...
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    darkMode: 'class',
    plugins: [
        nextui({
            themes: {
                dark: {
                    colors: {
                        background: '#202020',
                        foreground: '#e7e7e7',
                        content1: '#282828',
                        content2: '#303030',
                        content3: '#383838',
                        content4: '#404040',
                        default: {
                            DEFAULT: '#484848',
                            50: '#282828',
                            100: '#383838',
                            200: '#484848',
                            300: '#585858',
                            400: '#686868',
                            500: '#a7a7a7',
                            600: '#b7b7b7',
                            700: '#c7c7c7',
                            800: '#d7d7d7',
                            900: '#e7e7e7',
                        },
                        primary: {
                            DEFAULT: '#49cee9',
                            foreground: '#181818',
                        },
                    },
                },
                light: {
                    colors: {
                        background: '#ffffff',
                        foreground: '#181818',
                        content1: '#eeeeee',
                        content2: '#dddddd',
                        content3: '#cccccc',
                        content4: '#bbbbbb',
                        default: {
                            DEFAULT: '#999999',
                            50: '#eeeeee',
                            100: '#cccccc',
                            200: '#aaaaaa',
                            300: '#999999',
                            400: '#888888',
                            500: '#686868',
                            600: '#585858',
                            700: '#484848',
                            800: '#383838',
                            900: '#282828',
                        },
                        primary: {
                            foreground: '#ffffff',
                            DEFAULT: '#3578e5',
                        },
                    },
                },
            },
        }),
    ],
};
