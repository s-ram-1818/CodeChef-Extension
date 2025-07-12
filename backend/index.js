const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = 3000;
app.use(cors());
// API Endpoint to scrape CodeChef profile data
app.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  console.log(`recieved req for ${username}`);

  const URL = `https://www.codechef.com/users/${username}`;
  try {
    // Fetch the webpage
    const { data } = await axios.get(URL);

    // Load HTML into Cheerio
    const $ = cheerio.load(data);

    // Extract necessary data
    const name = $("header h1").text().trim();
    let rating = parseInt($("div.rating-number").text().trim());

    const stars = $(".rating-star").children().length;

    const ContestParticipated = parseInt(
      $("div.contest-participated-count b").text().trim()
    );
    const GlobalRank = parseInt(
      $("ul.inline-list").children().first().children().first().text().trim()
    );
    const user = {
      username,
      name,
      rating,
      stars,
      ContestParticipated,
      GlobalRank,
    };
    console.log(user);

    res.json({
      username,
      name,
      rating,
      stars,
      ContestParticipated,
      GlobalRank,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error:
        "Failed to fetch CodeChef profile data. Ensure the username is valid.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
