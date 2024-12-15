const express = require('express');
const { resolve } = require('path');
let cors = require('cors');
let sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

app.use(express.static('static'));

let db;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
})();

async function fetchAllRestaurants() {
  let query = 'select * from restaurants';
  let response = await db.all(query, []);
  return { restaurants: response };
}

app.get('/restaurants', async (req, res) => {
  try {
    let results = await fetchAllRestaurants();
    if (results.restaurants.length === 0) {
      return res.status(400).json({ message: 'no restaurants found...' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsById(id) {
  let query = 'select * from restaurants where id=?';
  let response = await db.all(query, [id]);
  return { restaurants: response };
}

app.get('/restaurants/details/:id', async (req, res) => {
  try {
    let id = parseInt(req.params.id);
    let results = await fetchRestaurantsById(id);
    if (results.restaurants.length === 0) {
      return res
        .status(400)
        .json({ message: 'no restaurant found for id ' + id });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsByCuisine(cuisine) {
  let query = 'select * from restaurants where cuisine=?';
  let response = await db.all(query, [cuisine]);
  return { restaurants: response };
}

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  let cuisine = req.params.cuisine;
  let results = await fetchRestaurantsByCuisine(cuisine);

  res.status(200).json(results);
});

async function filterRestaurants(isVeg, hasOutdoorSeating, isLuxury) {
  let query =
    'select * from restaurants where isVeg = ? and hasOutdoorSeating = ? and isLuxury = ?';
  let results = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);
  return { restaurants: results };
}

app.get('/restaurants/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let hasOutdoorSeating = req.query.hasOutdoorSeating;
  let isLuxury = req.query.isLuxury;
  let results = await filterRestaurants(isVeg, hasOutdoorSeating, isLuxury);

  res.status(200).json(results);
});

async function sortsRestaurantsByRating(isVeg, hasOutdoorSeating, isLuxury) {
  let query = 'select * from restaurants order by rating desc';
  let results = await db.all(query, []);
  return { restaurants: results };
}
app.get('/restaurants/sort-by-rating', async (req, res) => {
  let results = await sortsRestaurantsByRating();

  res.status(200).json(results);
});

async function fetchAllDishes() {
  let query = 'select * from dishes';
  let response = await db.all(query, []);
  return { dishes: response };
}
app.get('/dishes', async (req, res) => {
  let results = await fetchAllDishes();
  res.status(200).json(results);
});

async function fetchDishesById(id) {
  let query = 'select * from dishes where id=?';
  let response = await db.all(query, [id]);
  return { dishes: response };
}

app.get('/dishes/details/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  let results = await fetchDishesById(id);

  res.status(200).json(results);
});

async function filterDishesh(isVeg) {
  let query = 'select * from dishes where isVeg = ?';
  let response = await db.all(query, [isVeg]);
  return { dishes: response };
}

app.get('/dishes/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let results = await filterDishesh(isVeg);

  res.status(200).json(results);
});

async function sortDishesByPrice() {
  let query = 'select * from dishes order by price desc';
  let response = await db.all(query, []);
  return { dishes: response };
}

app.get('/dishes/sort-by-price', async (req, res) => {
  let results = await sortDishesByPrice();
  res.status(200).json(results);
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
