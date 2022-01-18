import { Schema, model} from "mongoose";
import Recipe from "./recipe.interface";



const recipeSchema = new Schema<Recipe>(
    {
        author: {
            ref: "User",
            type: Schema.Types.ObjectId,
        },
        title: String,
        ingredients: Array,
        recipeName: String,
        imageUrl: String,
        description: String,
        votes: Number,
    },
    {versionKey: false},
);

const recipeModel = model<Recipe>("Recipes",recipeSchema);

export default recipeModel;