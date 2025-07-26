// routes/resources.js
const express = require('express');
const Resource = require('../models/Resource');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/resources', requireAuth, async (req, res) => {
  try {
    const { category, type } = req.query;
    
    let filter = { isActive: true };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    
    res.render('resources', { 
      resources,
      currentCategory: category || 'all',
      currentType: type || 'all'
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to load resources' });
  }
});

module.exports = router;