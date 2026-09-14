// eslint-config-next 16 ships native flat configs (each export is a
// Linter.Config[]), so they are spread directly. Routing them through
// @eslint/eslintrc's FlatCompat — the bridge for legacy .eslintrc configs —
// makes its validator JSON.stringify plugin objects that hold circular
// references, which aborts every run with "Converting circular structure".
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
]

export default eslintConfig
