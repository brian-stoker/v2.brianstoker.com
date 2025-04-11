This is a Next.js application with various features and plugins. Here's an overview of the code:

**Main Components**

1. `AppWrapper`: The main component that wraps all other components. It provides several key features:
	* Provides a context for the page, including the active page, its parents, and metadata.
	* Wraps the `DocsProvider` from the `@stoked-ui/docs` package.
	* Uses `CodeCopyProvider` to enable code copying functionality.
2. `MyApp`: The main application component that wraps all other components using the `AppWrapper`.

**Plugins and Features**

1. **Google Analytics**: Not currently enabled, but commented out with a `<!--` comment.
2. **Web Vitals Reporting**: Uses the Google Tag Manager to report web vitals metrics, but can be disabled for testing purposes.
3. **Translations**: Uses the `@stoked-ui/translations` package to load translations from JSON files.
4. **Code Copying**: Uses the `CodeCopyProvider` package to enable code copying functionality.
5. **Code Styling**: Uses the `CodeStylingProvider` package to provide styling options for code blocks.

**Global State**

1. The application uses a context (`PageContext`) to share data between components.
2. The `emotionCache` object is used to store and cache React component styles.

**Linter Configuration**

The code includes various linter configurations, such as ESLint and Prettier, which are likely set up in the project's `.eslintrc.json` and `.prettierrc.json` files.

Overall, this application appears to be a documentation site built using Next.js, with features like translations, code copying, and styling options.