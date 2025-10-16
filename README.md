# Personal Website

This is the source code for my personal website, which showcases my art, drums, photography, resume, and blog (in the form of a .plan file). The website is built using React, Next.js, and Material-UI (MUI) components, providing a responsive and visually appealing design. It is deployed to AWS using the Serverless Stack (SST) framework.

## Features

- **Art Showcase**: Display your artwork in a gallery format, allowing visitors to appreciate your creative skills.
- **Drum Performances**: Share your drum performances through embedded videos or audio clips.
- **Photography Portfolio**: Showcase your photography skills with a collection of your best shots.
- **Resume**: Present your professional experience, education, and skills in a well-formatted resume section.
- **Blog (.plan file)**: Share your thoughts, experiences, and updates through a blog-style .plan file.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Next.js**: A React framework for server-side rendering, routing, and more.
- **Material-UI (MUI)**: A popular React UI framework that provides pre-built components and styling.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Serverless Stack (SST)**: A framework for building serverless applications on AWS.

## Folder Structure

The project follows the Next.js folder structure with additional files and folders for deployment and configuration:

personal-website/
├── infra/
│   └── domains.ts
├── lib/
│   └── sourcing.ts
├── pages/
│   ├── about.tsx
│   ├── art.tsx
│   ├── bstoked.plan.tsx
│   ├── drums.tsx
│   ├── index.tsx
│   ├── photography.tsx
│   └── resume-new.tsx
├── public/
│   └── static/
│       ├── art/
│       ├── icons/
│       ├── photography/
│       └── resume/
├── scripts/
│   └── generateRSSFeed.ts
├── src/
│   ├── components/
│   │   ├── about/
│   │   ├── banner/
│   │   ├── home/
│   │   ├── typography/
│   │   └── video/
│   ├── icons/
│   ├── layouts/
│   └── modules/
│       └── components/
├── hooks/
│   └── useWindowSize.ts
├── next.config.mjs
├── package.json
└── sst.config.ts
```

- `infra/`: Contains infrastructure-related code and configurations.
  - `domains.ts`: Defines the domain information for the website.
- `lib/`: Contains additional libraries and helper functions.
  - `sourcing.ts`: Contains sourcing-related code and functions.
- `pages/`: Contains the Next.js pages for the website.
  - `about.tsx`: The about page component.
  - `art.tsx`: The art page component.
  - `bstoked.plan.tsx`: The blog post component for the .plan file.
  - `drums.tsx`: The drums page component.
  - `index.tsx`: The main entry point for the website.
  - `photography.tsx`: The photography page component.
  - `resume-new.tsx`: The resume page component.
- `public/`: Contains static assets for the website.
  - `static/`: Contains static files and assets.
    - `art/`: Contains art-related assets.
    - `icons/`: Contains icon assets.
    - `photography/`: Contains photography-related assets.
    - `resume/`: Contains resume-related assets.
- `scripts/`: Contains scripts for the website.
  - `generateRSSFeed.ts`: Contains code for generating an RSS feed.
- `src/`: Contains the main source code of the Next.js application.
  - `components/`: Contains reusable components.
    - `about/`: Contains about-related components.
    - `banner/`: Contains banner-related components.
    - `home/`: Contains home-related components.
    - `typography/`: Contains typography-related components.
    - `video/`: Contains video-related components.
  - `icons/`: Contains icon assets.
  - `layouts/`: Contains layout-related components.
- `hooks/`: Contains custom hooks for the website.
  - `useWindowSize.ts`: Contains code for handling window size changes.
- `next.config.mjs`: Next.js configuration file.
- `package.json`: Contains package information for the website.
- `sst.config.ts`: SST configuration file for deploying the website to AWS.

## Main Menu Items

The website's main menu consists of the following items:

- **Art**: Showcases your artwork.
- **Drums**: Displays your drum performances.
- **Photography**: Presents your photography portfolio.
- **Resume**: Shows your professional resume.
- **.plan**: Contains your blog posts and updates.

## Deployment

The website is deployed to AWS using the Serverless Stack (SST) framework. The deployment configuration can be found in the `sst.config.ts` file:

```typescript
export default $config({
  app(input) {
    return {
      name: getDomainInfo(process.env.ROOT_DOMAIN!, input.stage).appName,
      removal: input.stage === "production" ? "retain" : "remove",
      home: "aws",
    }
  },
  async run() {
    const { createSite, createApi } = await import('./infra');
    const domainInfo = getDomainInfo(process.env.ROOT_DOMAIN!, $app.stage);
    createSite(domainInfo);
    createApi(domainInfo);
  },
});
```

This configuration file sets up the SST app, specifies the domain information, and defines the deployment stages. The `createSite` and `createApi` functions from the `infra` module are responsible for creating the necessary AWS resources for the website.

## Getting Started

To get a local copy of the project up and running, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/personal-website.git
   ```

2. Navigate to the project directory:
   ```
   cd personal-website
   ```

3. Install the dependencies:
   ```
   pnpm install
   ```

4. Set the required environment variables:
   - `ROOT_DOMAIN`: The root domain for your website (e.g., `example.com`).

5. Start the development server:
   ```
   pnpm dev
   ```

6. Open your browser and visit `http://localhost:3000` to see the website.

## Customization

To customize the website for your own personal use, follow these steps:

1. Update the content in the respective page components and sections to reflect your own information and media.

2. Replace the images and assets in the `public/` folder with your own files.

3. Modify the styles in the component files or create a separate CSS file to match your desired design.

4. Adjust the layout and structure in the page components as needed.

5. Update the `README.md` file with your own project details and instructions.

## Contributing

If you'd like to contribute to this project, please follow these guidelines:

1. Fork the repository and create a new branch.
2. Make your changes and test thoroughly.
3. Submit a pull request, describing the changes you've made.

Refer to the [Repository Guidelines](AGENTS.md) for detailed contributor expectations, build commands, and review checklists.

## License

This project is open-source and available under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as per the terms of the license.

## Contact

If you have any questions, suggestions, or feedback, please feel free to reach out to me at [your-email@example.com](mailto:your-email@example.com). You can also find more information about me and my work on my website.

Happy coding!
