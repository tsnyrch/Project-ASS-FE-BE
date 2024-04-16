import { Router} from "express";
import UserController from "../controllers/UserController";
import {catchAsync} from "../utils/catchAsync";
import User from "../model/User";


const router: Router = Router();
const controller: UserController = new UserController();

router.route("/")
    .get(catchAsync(controller.getUsers))
    .post(catchAsync(controller.createUser))

router.route("/login")
    .post(catchAsync(controller.login))

router.route("/register")
    .post(catchAsync(controller.register))

router.route("/refreshToken")
    .post(catchAsync(controller.refreshToken))

export default router;