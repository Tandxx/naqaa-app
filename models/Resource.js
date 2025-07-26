// models/Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'reminder', 'verse'],
    required: true
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  content: {
    type: String,
    required: true
  },
  url: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['motivation', 'islamic', 'scientific', 'personal'],
    default: 'motivation'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);