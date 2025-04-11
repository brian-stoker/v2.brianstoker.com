import React from 'react';
import { render } from 'react-dom/client';

const App = () => {
  return (
    <div>
      <h1>Transpile TypeScript demos</h1>
      <button id="transpile-btn">Transpile</button>
      <input type="text" id="pattern-input" placeholder="Pattern" />
      <button id="watch-btn">Watch for changes</button>
    </div>
  );
};

const container = document.getElementById('root');
const rootElement = container.querySelector('#root');

render(<App />, rootElement);