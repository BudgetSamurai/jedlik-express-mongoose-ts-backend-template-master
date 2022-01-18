import { IsArray, IsNumber, IsString, IsUrl} from "class-validator";

export default class CreateRecipeDto {
    @IsString()
    public title: string;

    @IsArray()
    public ingredients: string[];

    @IsString()
    public description: string;

    @IsString()
    public recipeName: string;

    @IsString()
    public imageUrl: string;

    @IsNumber()
    public votes: number;
}