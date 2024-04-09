import { Router} from "express";
import UserController from "../controllers/UserController";
import {catchAsync} from "../utils/catchAsync";
import User from "../model/User";


const router: Router = Router();
const controller: UserController = new UserController();

router.route("/")
    .get(catchAsync(controller.getUsers))

router.route("/delete")
    .get((req, res) => {
        User.destroy()
        res.send("deleted");
    })

export default router;