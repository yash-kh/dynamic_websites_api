const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be a postive number');
        }
      },
    },
    avatar: {
      type: Buffer,
      require: true,
    },
    about: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Website = mongoose.model('Website', websiteSchema);

module.exports = Website;
