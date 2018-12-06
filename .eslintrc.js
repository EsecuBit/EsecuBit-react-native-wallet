module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
        },
        "ecmaVersion": 2017,
        "sourceType": "module",
    },
    "plugins": [
        "react"
    ],
    "settings": {
        "react": {
            "createClass": "createReactClass", // Regex for Component Factory to use,
            // default to "createReactClass"
            "pragma": "React",  // Pragma to use, default to "React"
            "version": "15.0", // React version, default to the latest React stable release
            "flowVersion": "0.53" // Flow version
        },
        "propWrapperFunctions": ["forbidExtraProps"] // The names of any functions used to wrap the
        // propTypes object, e.g. `forbidExtraProps`.
        // If this isn't set, any propTypes wrapped in
        // a function will be skipped.
    },
    "rules": {
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "no-console": 0,
      "no-unused-vars": 2,
      "no-alert": 1,
      'no-cond-assign': [
        'error',
        'except-parens'
    ],'no-constant-condition': [
      'error',
      {
          checkLoops: false
      }
    ],
      "react-app/react/react-in-jsx-scope": ["warn"],
      "react/prop-types": ["error", { "ignore": ["navigation"] }]
    
    },
    "env": {
      "amd": true,
      "browser": true,
      "node": true
    },
    "globals": {
        "global": true,
        "Symbol": true,
        "Promise": true,
        "console": true,
        "describe": true,
        "it": true,
        "expect": true,
    }
};