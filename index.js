const express = require("express");
const axios = require("axios");
const { createClient } = require("redis");

const app = express();
const PORT = 6060;

// Initialize Redis client with the provided connection details
const client = createClient({
  password: 'CbfmTPmzYJbg0tVKYqoS7JxQwjhJOHnI',
  socket: {
    host: 'redis-17549.c330.asia-south1-1.gce.redns.redis-cloud.com',
    port: 17549
  }
});

client.on("error", (error) => {
  console.error(`Redis client error: ${error}`);
  process.exit(1); // Exit the process if Redis connection fails
});

client.on("connect", () => {
  console.log("Connected to Redis");

  // Start the Express server after successful Redis connection
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

(async () => {
  await client.connect();
})();

const fetchApiData = async (pin) => {
  try {
    const apiResponse = await axios.get(`http://api.zippopotam.us/us/${pin}`);
    console.log("Request sent to the API");
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
};

const getPinData = async (req, res) => {
  const pin = req.params.pin;
  let results;
  let isCached = false;

  try {
    const cacheResults = await client.get(pin);
    if (cacheResults) {
      isCached = true;
      results = JSON.parse(cacheResults);
    } else {
      results = await fetchApiData(pin);
      if (!results || Object.keys(results).length === 0) {
        throw new Error("API returned an empty object");
      }
      await client.set(pin, JSON.stringify(results));
    }
    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(404).send("Data unavailable");
  }
};

app.get("/us/:pin", getPinData);
