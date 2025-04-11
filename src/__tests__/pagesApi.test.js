Here is an example of how you can test the API endpoints using Jest and Supertest:

**api.test.js**
```javascript
const request = require('supertest');
const app = require('./app'); // Assuming your Express app is in app.js

describe('API Endpoints', () => {
  it('should return a list of all available endpoints', async () => {
    const response = await request(app).get('/api-endpoints');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      'endpoint1',
      'endpoint2',
      // ... rest of the list
    ]);
  });

  it('should return a specific endpoint', async () => {
    const response = await request(app).get('/api-endpoints/endpoint1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ /* expected data */ });
  });

  // Add more tests for each endpoint
});
```
In this example, we're using Supertest to make HTTP requests to our Express app. We're defining two tests:

1. The first test checks that the `/api-endpoints` endpoint returns a list of all available endpoints.
2. The second test checks that the `/api-endpoints/endpoint1` endpoint returns the expected data.

You can add more tests for each endpoint by following the same pattern.

**app.js**
```javascript
const express = require('express');
const app = express();

// Assuming you have a function to generate the list of endpoints
function getEndpoints() {
  // ... implementation ...
}

app.get('/api-endpoints', (req, res) => {
  const endpoints = getEndpoints();
  res.json(endpoints);
});

app.get('/api-endpoints/:endpointId', (req, res) => {
  const endpointId = req.params.endpointId;
  // Find the endpoint with the given ID and return its data
});

// Add more routes for each endpoint

module.exports = app;
```
In this example, we're defining an Express app that listens for GET requests to `/api-endpoints` and returns a list of endpoints. We're also defining a route for a specific endpoint using the `:endpointId` parameter.

Note that you'll need to implement the logic for generating the list of endpoints and retrieving the data for each endpoint in your app.