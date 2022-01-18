import { Router, Request, Response, NextFunction}
from "express";
import {Types} from "mongoose";
import RecipeNotFoundExpection from "../exceptions/RecipeNotFoundExpection";
import IdNotValidException from "exceptions/IdNotValidException";
import HttpException from "exceptions/HttpException";
import Controller from "interfaces/controller.interface";
import RequestWithUser from "interfaces/requestWithUser.interface";
import authMiddleware from "middleware/auth.middleware";
import validateEnv from "utils/validateEnv";
import validationMiddleware from "middleware/validation.middleware";
import CreateAddressDto from "user/address.dto";
import Recipe from "./recipe.interface";
import recipeModel from "./recipe.model";
import CreateRecipeDto from "./recipe.dto";


export default class RecipeController implements Controller {
    public path = "/recipes";
    public router = Router();
    private post = recipeModel

    constructor() {
        this.initializeRoutes();

    }

    private initializeRoutes() {
        this.router.get(this.path,authMiddleware, this.getAllRecipes);
        this.router.get(`${this.path}/:id` authMiddleware, this.router.getRecipeById);
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, authMiddleware, this.getPaginatedRecipes);
        this.router.patch(`${this.path}:id`, [authMiddleware, validationMiddleware(CreateRecipeDto, true)], this.modifyRecipe);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteRecipes);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateRecipeDto)], this.createRecipe);
    }


    private getPaginatedRecipes =async (rq: Request, resp: Response, next: NextFunction) => {
        try {
            const offset = parseInt(rq.params.offset);
            const limit = parseInt(rq.params.limit);
            const order = rq.params.order;
            const sort = parseInt(rq.params.sort);

            let recipes = [];
            let count = 0;
            if (rq.params.keyword) {
                const regex = new RegExp(rq.params.keyword,"insens");
                count = await this.post.find({ $or: [{recipeName: {$regex: regex}},{description: {$regex : regex}}]}).sort(`${sort == -1? "-":"" }${order}`).skip(offset).limit(limit);

            }else{
                count = await this.post.countDocuments();
                recipes = await this.post.find({}).sort(`${sort == -1? "-":""}${order}`).skip(offset).limit(limit);
            }
            resp.send({ count:count, recipes: recipes});
        } catch (error) {
            next(new HttpException(400, error.message));

        }
        
    };
    private getRecipeById = async (rq: Request, resp: Response, next: NextFunction) => {
        try {
            const id = rq.params.id;
            if (Types.ObjectId.isValid(id)) {
                const recipe = await this.post.findById(id).populate("author", "-password");
                if (recipe ) {
                    resp.send(recipe);
                }else{
                    next(new RecipeNotFoundExpection(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        }catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyRecipe = async (rq: Request, resp: Response, next: NextFunction) => {
        try {
            const id = rq.params.id;
            if (Types.ObjectId.isValid(id)) {
                const recipeData: Recipe = rq.body;
                const recipe = await this.post.findByIdAndUpdate(id, recipeData, {new: true});
                if (recipe) {
                    resp.send(recipe);
                }else{
                    next(new RecipeNotFoundExpection(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        }catch (error) {
            next(new HttpException(400, error.message));

        }
    };

    private createRecipe = async (rq: RequestWithUser, resp: Response, next: Nextfunction) => {
        try {
            const recipeData: Recipe = rq.body;
            const createRecipe = new this.post({...recipeData, author: rq.user._id,
            });
            const savedRecipe = await createdRecipe.save();
            await savedRecipe.populate("author", "-password");
            resp.send(savedRecipe);
        }catch (error){
            next(new HttpException(400, error.message));
        }
        
    };

    private deleteRecipes =async (rq: Request, resp: Response, next: NextFunction) => {
        try {
            const id = rq.params.id;
            if (Types.ObjectId.isValid(id)) {
                const (successResponse) = await this.post.findByAndDelete(id);
                if (successResponse) {
                    resp.sendStatus(200);
                }else {
                    next(new RecipeNotFoundExpection(id));
                }
            }else{
                next(new IdNotValidException(id));
            }
        } catch (error){
            next(new HttpException(400, error.message));
        }
        
    };
}