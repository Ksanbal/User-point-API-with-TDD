import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './model/users.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto): User {
    throw new Error('Method not implemented.');
  }

  findAll(): User[] {
    throw new Error('Method not implemented.');
  }

  findOne(id: number): User {
    throw new Error('Method not implemented.');
  }

  update(id: number, updateUserDto: UpdateUserDto): User {
    throw new Error('Method not implemented.');
  }

  remove(id: number) {
    throw new Error('Method not implemented.');
  }
}
