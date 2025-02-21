---
title: 'Stoked UI: Client-Side Video Editing React Components'
description: 'Stoked UI enables fully client-side video editing in the browser, preserving privacy and efficiency.'
date: 2024-08-28T00:00:00.000Z
authors:
  [
    'brianstoker',
  ]
tags: ['Stoked UI', 'File Explorer', 'Timeline', 'Editor', 'Media Selector']
manualCard: true
---

## Introducing Stoked UI: An Open-Source React Component Library for Client-Side Video Editing

**Stoked UI** is a newly released set of MIT-licensed React components designed to enable fully client-side video editing directly within the browser. By eliminating the need to upload raw video files before making edits, **Stoked UI** empowers users to refine their media efficiently and privately before sharing it online.

Currently in early alpha, **Stoked UI** is structured into five distinct modules, each serving a crucial role in the video editing process:

### Common
A foundational module containing reusable React utilities and minor libraries used across **Stoked UI**.

### Media Selector
An extension of the standard file input element in the DOM, allowing for enhanced media handling, including thumbnail generation, metadata extraction, and screenshot capabilities.

### File Explorer
Built upon Material-UI’s file explorer, this module enhances file organization with drag-and-drop functionality—initially implemented before MUI introduced their own version.

### Timeline
A React-based timeline component akin to those found in professional video and audio editing tools. It includes playback controls (play, rewind, fast-forward) and a sequencing engine that tracks media across multiple tracks. Currently, it ships with an audio controller.

### Editor
The core video editing component, integrating all other modules. It features a video controller and an interactive screen for real-time media editing.

Though still in its early stages, **Stoked UI** is now ready for public exploration and contribution. Developers, media creators, and open-source enthusiasts are invited to test, improve, and expand the library as it evolves.

For more information, contributions, or to get started with **Stoked UI**, visit [GitHub Repository Link] or contact [Your Contact Information].

## About Stoked UI

**Stoked UI** is an open-source project dedicated to making in-browser video editing more accessible, efficient, and seamless. Built with React and Material-UI, it aims to provide a robust, extensible framework for media manipulation without reliance on cloud-based processing.

For developers and early adopters looking to contribute, feedback and collaboration are highly encouraged. Join the discussion and help shape the future of client-side video editing with **Stoked UI**!
