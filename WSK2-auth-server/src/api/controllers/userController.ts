// Description: This file contains the functions for the user routes
// TODO: add function check, to check if the server is alive
// TODO: add function to get all users
// TODO: add function to get a user by id
// TODO: add function to create a user
// TODO: add function to update a user
// TODO: add function to delete a user
// TODO: add function to check if a token is valid

import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {User} from '../../interfaces/User';
import {validationResult} from 'express-validator';
import userModel from '../models/userModel';
import bcrypt from 'bcrypt';
import DBMessageResponse from '../../interfaces/DBMessageResponse';

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const user = req.body;
    console.log('postUser', user);
    user.password = await bcrypt.hash(user.password, 12);

    const newUser = await userModel.create(user);
    const response: DBMessageResponse = {
      message: 'User created',
      data: {
        user_name: newUser.user_name,
        email: newUser.email,
        id: newUser._id,
      },
    };

    res.json(response);
    console.log('postUser', response);
  } catch (error) {
    console.log(error);
    next(new CustomError('User creation failed', 500));
  }
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.find().select('-password -role -__v');
    const response: DBMessageResponse = {
      message: 'Users found',
      data: users,
    };

    res.json(response);
  } catch (error) {
    next(new CustomError('Users not found', 500));
  }
};

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role -__v');

    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBMessageResponse = {
      message: 'User found',
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(new CustomError('User not found', 500));
  }
};

export {userPost, userListGet, userGet};
