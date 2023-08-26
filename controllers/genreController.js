const db=require('../models/database')
const Genre=db.genres
exports.addGenre = async (req, res) => {
  const { name } = req.body;

  try {
    const existingGenre = await Genre.findOne({ where: { name } });

    if (existingGenre) {
      return res.status(400).json({ message: 'Genre already exists' });
    }

    const newGenre = await Genre.create({ name });

    res.status(201).json(newGenre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllGenres = async (req, res) => {
    try {
      const genres = await Genre.findAll();
      res.status(200).json(genres);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };