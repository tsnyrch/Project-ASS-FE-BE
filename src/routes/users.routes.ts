import { Router } from "express";
import UserController from "../controllers/UserController";
import { catchAsync } from "../utils/catchAsync";
import { auth } from "../middleware/auth";

/**
 * Router for user-related endpoints
 */
const router: Router = Router();
const controller: UserController = new UserController();

/**
 * GET /users - Get all users (admin)
 * POST /users - Create a new user (admin)
 * Both routes are protected by authentication
 */
router
  .route("/")
  .get(auth, catchAsync(controller.getUsers))
  .post(auth, catchAsync(controller.createUser));

/**
 * POST /users/login - Authenticate a user
 * Public route, no authentication required
 */
router.route("/login").post(catchAsync(controller.login));

/**
 * POST /users/register - Register a new user
 * Public route, no authentication required
 */
router.route("/register").post(catchAsync(controller.register));

/**
 * POST /users/refreshToken - Refresh an access token using a refresh token
 * Public route, token validation handled in controller
 */
router.route("/refreshToken").post(catchAsync(controller.refreshToken));

/**
 * GET /users/:id - Get a user by ID
 * Protected by authentication
 */
router.route("/:id").get(auth, catchAsync(controller.getUserById));

export default router;
