import appSrc from './app.js';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import crypto from 'crypto';
import http from 'http';
import puppeteer from 'puppeteer'
import CORS from './CORS.js';
import UserModel from './models/User.js';
const User = UserModel(mongoose);
const app = appSrc(express, bodyParser, fs, 
    crypto, http, CORS, User, 
    mongoose, puppeteer, process.env.LOGIN);
app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}!`));


