export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(.+?)\s\[(.+?)\]\s(.+)$/,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
  plugins: [
    {
      rules: {
        "header-match-team-pattern": (parsed) => {
          const { type, scope, subject } = parsed;
          if (type === null && scope === null && subject === null) {
            return [
              false,
              "header must be in format 'task-key [scope] subject'",
            ];
          }
          return [true, ""];
        },
        "task-key": (parsed, _when, expectedValue) => {
          const { type } = parsed;
          if (type && expectedValue && !expectedValue.includes(type)) {
            return [
              false,
              `expected value ${expectedValue}`,
            ];
          }
          return [true, `${expectedValue}`];
        },
      },
    },
  ],
  rules: {
    "header-match-team-pattern": [2, "always"],
    "task-key": [2, "always"], 
  },
};
