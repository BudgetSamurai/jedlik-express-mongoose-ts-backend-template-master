import { Types} from "mongoose";
export default interface Recipe {
    _id: Types.ObjectId | string;
    author: Types.ObjectId | string;
    title: string;
    recipeName: string;
    imageUrl: string;
    description: string;
    ingredients: string[];
    votes: number;
}