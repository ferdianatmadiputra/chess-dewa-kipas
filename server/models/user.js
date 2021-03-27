"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.History, {
        foreignKey: "playerOne",
        as: "playerOne",
      });
      User.hasMany(models.History, {
        foreignKey: "playerTwo",
        as: "playerTwo",
      });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: "Username cannot be empty",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: "Email cannot be empty",
          },
          isEmail: {
            args: true,
            msg: "Invalid email format",
          },
        },
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: "Password cannot be empty",
          },
          len: {
            args: [6, 200],
            msg: "Password must have min 6 characters",
          },
        },
      },
      pictureUrl: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: "Picture cannot be empty",
          },
        },
      },
      eloRating: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: {
            args: true,
            msg: "Rating cannot be empty",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  User.addHook("beforeCreate", (instance, opt) => {
    instance.password = hashPassword(instance.password);
  });
  User.addHook("beforeCreate", (instance, opt) => {
    instance.pictureUrl = `https://avatars.dicebear.com/api/bottts/${instance.username}.svg`;
  });
  User.addHook("beforeCreate", (instance, opt) => {
    instance.eloRating = 1000;
  });
  return User;
};
