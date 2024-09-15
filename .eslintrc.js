module.exports = {
    env: {
        browser: true, // Указывает, что код будет исполняться в браузере
        node: true, // Указывает, что код будет исполняться в Node.js среде
        es2021: true // Указывает, что будет использоваться синтаксис ECMAScript 2021
    },
    extends: [
        'eslint:recommended' // Использует рекомендованные правила ESLint
    ],
    parserOptions: {
        ecmaVersion: 12, // Поддерживает ECMAScript 2021
        sourceType: 'module' // Разрешает использование модулей ES6 (если нужно)
    },
    rules: {
        // Ваши пользовательские правила
        'semi': ['error', 'always'], // Требует использование точек с запятыми
        'quotes': ['error', 'single'], // Требует использование одинарных кавычек
        'no-console': 'off', // Отключает правило, запрещающее использование console,
        'no-useless-escape': 'off'
        // Добавьте или измените правила по вашему усмотрению
    }
};