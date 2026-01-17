import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDate, IsEnum } from 'class-validator';
enum UserRole {
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
    VENDOR = 'VENDOR'
}
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    lastName : string;
    @IsString()
    @IsNotEmpty()
    firstName : string;
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
    @IsOptional()
    @IsEnum(UserRole)
    role : string;
    @IsOptional()
    @IsString()
    @MinLength(10)
    phone : string;
    @IsOptional()
    @IsString()
    photo : string;
    @IsOptional()
    @IsString()
    address : string;
    @IsOptional()
    @IsDate()
    dateNaissance : Date;
}