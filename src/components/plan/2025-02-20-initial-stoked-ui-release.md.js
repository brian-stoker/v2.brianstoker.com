export const docs = {
  "en": {
    "description": "Stoked UI modules are now available via pnpm, yarn, and npm.",
    "location": "/pages/.plan/2025-02-20-initial-stoked-ui-release.md",
    "rendered": [
      "<svg style=\"display: none;\" xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"error-icon\" viewBox=\"0 0 20 20\">\n      <path fill-rule=\"evenodd\" d=\"M2 7.4v5.2a2 2 0 0 0 .586 1.414l3.4 3.4A2 2 0 0 0 7.4 18h5.2a2 2 0 0 0 1.414-.586l3.4-3.4A2 2 0 0 0 18 12.6V7.4a2 2 0 0 0-.586-1.414l-3.4-3.4A2 2 0 0 0 12.6 2H7.4a2 2 0 0 0-1.414.586l-3.4 3.4A2 2 0 0 0 2 7.4Zm11.03-.43a.75.75 0 0 1 0 1.06L11.06 10l1.97 1.97a.75.75 0 1 1-1.06 1.06L10 11.06l-1.97 1.97a.75.75 0 0 1-1.06-1.06L8.94 10 6.97 8.03a.75.75 0 0 1 1.06-1.06L10 8.94l1.97-1.97a.75.75 0 0 1 1.06 0Z\" clip-rule=\"evenodd\"/>\n      </symbol>\n      </svg>",
      "<svg style=\"display: none;\" xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"warning-icon\" viewBox=\"0 0 20 20\">\n      <path d=\"M2.33 17a.735.735 0 0 1-.665-.375.631.631 0 0 1-.094-.375.898.898 0 0 1 .115-.396L9.353 3.062a.621.621 0 0 1 .281-.27.85.85 0 0 1 .729 0 .622.622 0 0 1 .281.27l7.667 12.792c.07.125.108.257.114.396a.63.63 0 0 1-.093.375.842.842 0 0 1-.271.27.728.728 0 0 1-.394.105H2.33Zm7.664-2.5c.211 0 .39-.072.536-.214a.714.714 0 0 0 .218-.532.736.736 0 0 0-.214-.535.714.714 0 0 0-.531-.22.736.736 0 0 0-.536.215.714.714 0 0 0-.219.531c0 .212.072.39.215.536.143.146.32.219.531.219Zm0-2.5c.211 0 .39-.072.536-.216a.72.72 0 0 0 .218-.534v-2.5a.728.728 0 0 0-.214-.534.72.72 0 0 0-.531-.216.734.734 0 0 0-.536.216.72.72 0 0 0-.219.534v2.5c0 .212.072.39.215.534a.72.72 0 0 0 .531.216Z\"/>\n      </symbol>\n      </svg>",
      "<svg style=\"display: none;\" xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"success-icon\" viewBox=\"0 0 20 20\">\n      <path d=\"m8.938 10.875-1.25-1.23a.718.718 0 0 0-.521-.228.718.718 0 0 0-.521.229.73.73 0 0 0 0 1.062l1.77 1.771c.153.153.327.23.521.23a.718.718 0 0 0 .521-.23l3.896-3.896a.73.73 0 0 0 0-1.062.718.718 0 0 0-.52-.23.718.718 0 0 0-.521.23l-3.376 3.354ZM10 18a7.796 7.796 0 0 1-3.104-.625 8.065 8.065 0 0 1-2.552-1.719 8.064 8.064 0 0 1-1.719-2.552A7.797 7.797 0 0 1 2 10c0-1.111.208-2.15.625-3.115a8.064 8.064 0 0 1 4.27-4.26A7.797 7.797 0 0 1 10 2c1.111 0 2.15.208 3.115.625a8.096 8.096 0 0 1 4.26 4.26C17.792 7.851 18 8.89 18 10a7.797 7.797 0 0 1-.625 3.104 8.066 8.066 0 0 1-4.26 4.271A7.774 7.774 0 0 1 10 18Z\"/>\n      </symbol>\n      </svg>",
      "<svg style=\"display: none;\" xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"info-icon\" viewBox=\"0 0 20 20\">\n      <path d=\"M9.996 14c.21 0 .39-.072.535-.216a.72.72 0 0 0 .219-.534v-3.5a.728.728 0 0 0-.214-.534.72.72 0 0 0-.532-.216.734.734 0 0 0-.535.216.72.72 0 0 0-.219.534v3.5c0 .213.071.39.214.534a.72.72 0 0 0 .532.216Zm0-6.5c.21 0 .39-.071.535-.214a.714.714 0 0 0 .219-.532.736.736 0 0 0-.214-.535.714.714 0 0 0-.532-.219.736.736 0 0 0-.535.214.714.714 0 0 0-.219.532c0 .21.071.39.214.535.143.146.32.219.532.219Zm.01 10.5a7.81 7.81 0 0 1-3.11-.625 8.065 8.065 0 0 1-2.552-1.719 8.066 8.066 0 0 1-1.719-2.551A7.818 7.818 0 0 1 2 9.99c0-1.104.208-2.14.625-3.105a8.066 8.066 0 0 1 4.27-4.26A7.818 7.818 0 0 1 10.009 2a7.75 7.75 0 0 1 3.106.625 8.083 8.083 0 0 1 4.26 4.265A7.77 7.77 0 0 1 18 9.994a7.81 7.81 0 0 1-.625 3.11 8.066 8.066 0 0 1-1.719 2.552 8.083 8.083 0 0 1-2.546 1.719 7.77 7.77 0 0 1-3.104.625Z\"/>\n      </symbol>\n      </svg>",
      "\n      <svg style=\"display: none;\" xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"copied-icon\" viewBox=\"0 0 24 24\">\n        <path d=\"M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.24 11.28L9.69 11.2c-.38-.39-.38-1.01 0-1.4.39-.39 1.02-.39 1.41 0l1.36 1.37 4.42-4.46c.39-.39 1.02-.39 1.41 0 .38.39.38 1.01 0 1.4l-5.13 5.17c-.37.4-1.01.4-1.4 0zM3 6c-.55 0-1 .45-1 1v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1z\" />\n      </symbol>\n      </svg>",
      "<svg style=\"display: none;\" xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"copy-icon\" viewBox=\"0 0 24 24\">\n      <path d=\"M15 20H5V7c0-.55-.45-1-1-1s-1 .45-1 1v13c0 1.1.9 2 2 2h10c.55 0 1-.45 1-1s-.45-1-1-1zm5-4V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2zm-2 0H9V4h9v12z\" />\n      +</symbol>\n      </svg>",
      "<svg style=\"display: none;\" xmlns=\"http://www.w3.org/2000/svg\">\n        <symbol id=\"anchor-link-icon\" viewBox=\"0 0 12 6\">\n          <path d=\"M8.9176 0.083252H7.1676C6.84677 0.083252 6.58427 0.345752 6.58427 0.666585C6.58427 0.987419 6.84677 1.24992 7.1676 1.24992H8.9176C9.8801 1.24992 10.6676 2.03742 10.6676 2.99992C10.6676 3.96242 9.8801 4.74992 8.9176 4.74992H7.1676C6.84677 4.74992 6.58427 5.01242 6.58427 5.33325C6.58427 5.65409 6.84677 5.91659 7.1676 5.91659H8.9176C10.5276 5.91659 11.8343 4.60992 11.8343 2.99992C11.8343 1.38992 10.5276 0.083252 8.9176 0.083252ZM3.6676 2.99992C3.6676 3.32075 3.9301 3.58325 4.25094 3.58325H7.75094C8.07177 3.58325 8.33427 3.32075 8.33427 2.99992C8.33427 2.67909 8.07177 2.41659 7.75094 2.41659H4.25094C3.9301 2.41659 3.6676 2.67909 3.6676 2.99992ZM4.83427 4.74992H3.08427C2.12177 4.74992 1.33427 3.96242 1.33427 2.99992C1.33427 2.03742 2.12177 1.24992 3.08427 1.24992H4.83427C5.1551 1.24992 5.4176 0.987419 5.4176 0.666585C5.4176 0.345752 5.1551 0.083252 4.83427 0.083252H3.08427C1.47427 0.083252 0.167603 1.38992 0.167603 2.99992C0.167603 4.60992 1.47427 5.91659 3.08427 5.91659H4.83427C5.1551 5.91659 5.4176 5.65409 5.4176 5.33325C5.4176 5.01242 5.1551 4.74992 4.83427 4.74992Z\" />\n        </symbol>\n    </svg>",
      "<svg style=\"display: none;\" xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"comment-link-icon\" viewBox=\"0 0 24 24\">\n      <path d=\"M22.8481 4C22.8481 2.9 21.9481 2 20.8481 2H4.84814C3.74814 2 2.84814 2.9 2.84814 4V16C2.84814 17.1 3.74814 18 4.84814 18H18.8481L22.8481 22V4ZM16.8481 11H13.8481V14C13.8481 14.55 13.3981 15 12.8481 15C12.2981 15 11.8481 14.55 11.8481 14V11H8.84814C8.29814 11 7.84814 10.55 7.84814 10C7.84814 9.45 8.29814 9 8.84814 9H11.8481V6C11.8481 5.45 12.2981 5 12.8481 5C13.3981 5 13.8481 5.45 13.8481 6V9H16.8481C17.3981 9 17.8481 9.45 17.8481 10C17.8481 10.55 17.3981 11 16.8481 11Z\" />\n      </symbol>\n      </svg>",
      "<h2 id=\"into-the-wild\">Into the Wild<a aria-labelledby=\"into-the-wild\" class=\"anchor-link\" href=\"#into-the-wild\" tabindex=\"-1\"><svg><use xlink:href=\"#anchor-link-icon\" /></svg></a><button title=\"Post a comment\" class=\"comment-link\" data-feedback-hash=\"into-the-wild\"><svg><use xlink:href=\"#comment-link-icon\" /></svg></button></h2><p>Even though it’s still early days for Stoked UI, I’ve decided to cut actual versions of each of the core modules. While there are still plenty of bugs to fix and improvements to make, these modules are now functional and valuable enough to be out in the world.</p>\n<h3 id=\"released-versions\">Released Versions<a aria-labelledby=\"released-versions\" class=\"anchor-link\" href=\"#released-versions\" tabindex=\"-1\"><svg><use xlink:href=\"#anchor-link-icon\" /></svg></a><button title=\"Post a comment\" class=\"comment-link\" data-feedback-hash=\"released-versions\"><svg><use xlink:href=\"#comment-link-icon\" /></svg></button></h3><ul>\n<li><strong>@stoked-ui/common</strong> – <code>0.1.0</code></li>\n<li><strong>@stoked-ui/file-explorer</strong> – <code>0.1.0</code></li>\n<li><strong>@stoked-ui/media-selector</strong> – <code>0.1.1</code></li>\n<li><strong>@stoked-ui/timeline</strong> – <code>0.1.1</code></li>\n<li><strong>@stoked-ui/editor</strong> – <code>0.1.0</code></li>\n</ul>\n<p>These modules can now be installed via <strong>pnpm</strong> (correct choice 😉), <strong>yarn</strong>, or <strong>npm</strong>.</p>\n<p><a href=\"https://github.com/stoked-ui/sui\">GitHub Repository</a></p>\n<h3 id=\"website-amp-future-plans\">Website &amp; Future Plans<a aria-labelledby=\"website-amp-future-plans\" class=\"anchor-link\" href=\"#website-amp-future-plans\" tabindex=\"-1\"><svg><use xlink:href=\"#anchor-link-icon\" /></svg></a><button title=\"Post a comment\" class=\"comment-link\" data-feedback-hash=\"website-amp-future-plans\"><svg><use xlink:href=\"#comment-link-icon\" /></svg></button></h3><p>The home page for Stoked UI is now live at <a href=\"https://stoked-ui.com\">stoked-ui.com</a>, and there are plans to provide an <strong>MUI-style set of examples and documentation</strong> when I (or someone else) gets around to it. Until then, expect things to be a bit rough, but the goal is to make Stoked UI an intuitive and extensible toolset for client-side video editing in React.</p>\n<p>Feedback, contributions, and bug reports are all welcome! 🚀  </p>\n"
    ],
    "toc": [
      {
        "text": "Into the Wild",
        "level": 2,
        "hash": "into-the-wild",
        "children": [
          {
            "text": "Released Versions",
            "level": 3,
            "hash": "released-versions"
          },
          {
            "text": "Website &amp; Future Plans",
            "level": 3,
            "hash": "website-amp-future-plans"
          }
        ]
      }
    ],
    "title": "Stoked UI Releases Initial Versions of Its React Component Modules",
    "headers": {
      "title": "Stoked UI Releases Initial Versions of Its React Component Modules",
      "description": "Stoked UI modules are now available via pnpm, yarn, and npm.",
      "date": "2025-02-20T00:00:00.000Z",
      "authors": [
        "brianstoker"
      ],
      "tags": [
        "Stoked UI",
        "File Explorer",
        "Timeline",
        "Editor",
        "Media Selector"
      ],
      "manualCard": "true",
      "components": [],
      "hooks": []
    }
  }
};
