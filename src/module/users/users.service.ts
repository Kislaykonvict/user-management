import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { UserResponseDto } from './dto/update-user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserCoreService } from 'src/core/user-core/user-core.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private userCoreService: UserCoreService,
  ) {}

  async create(params: {
    createUserDto: CreateUserDto
  }) {

    const { createUserDto } = params;
    const { email, password, name, role, isActive } = createUserDto;

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user using Prisma directly
      const user = await this.userCoreService.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: Role[role] || Role.VIEWER,
          isActive,
        }
      });

      const response = await this.userCoreService.findFirst({
        where: {
          id: user.id
        }
      })

      const { password: _, ...result } = response; // Exclude password from the response

      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll() {
    // implementation
    const users = await this.userCoreService.findMany({
      where: {
        isActive: true,
      }
    })

    if(!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }
    return users;
  }

  async findOne(params: { id: number}) {
    const { id } = params;
    const user = await this.userCoreService.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }



  async update(params: {id: number, updateUserDto: UpdateUserDto}) {
    try {

      const { id, updateUserDto } = params;

      const user = await this.userCoreService.findFirst({
        where: {
          id: id
        }
      })

      const updateUser = await this.userCoreService.update({
        where: { id: user.id },
        data: {
          email: updateUserDto.email,
          password: updateUserDto.password ? await bcrypt.hash(updateUserDto.password, 10) : user.password, 
          name: updateUserDto.name,
          role: updateUserDto.role ? Role[updateUserDto.role] : user.role,
          isActive: updateUserDto.isActive !== undefined ? updateUserDto.isActive : user.isActive,
      }});


      return updateUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ID: ${params.id} not found`);
      }
      throw error;
    }
  }

  async remove(params: {id: number}) {
    try {

      const { id } = params;

      const user = await this.userCoreService.findFirst({
      where: {
        id: id
      }})

      if(!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const deleteUser = await this.userCoreService.delete({
        where: { id },
      });

      return {
        message: "User deleted successfully",
        user: deleteUser
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ID: ${params.id} not found`);
      }
      throw error;
    }
  }

  async toggleUserStatus(params: { id: number }) {
    try {
      const { id } = params;
  
      // First find the user to get current status
      const user = await this.userCoreService.findFirst({
        where: { id }
      });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
  
      // Toggle the isActive status
      const updatedUser = await this.userCoreService.update({
        where: { id },
        data: {
          isActive: !user.isActive? true: false
        }
      });
  
      return updatedUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${params.id} not found`);
      }
      throw error;
    }
  }

  async findMe(params: { id: number }) {
    try {
      const { id } = params;
  
      const user = await this.userCoreService.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
  
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User not found`);
      }
      throw error;
    }
  }

  async updateMe(params: { id: number, updateUserDto: UpdateUserDto }) {
    try {
      const { id, updateUserDto } = params;
  
      // First get current user to preserve unchanged fields
      const currentUser = await this.userCoreService.findUnique({
        where: { id }
      });
  
      if (!currentUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
  
      // Update only allowed fields (excluding role and isActive for self-update)
      const updatedUser = await this.userCoreService.update({
        where: { id },
        data: {
          email: updateUserDto.email || currentUser.email,
          password: updateUserDto.password 
            ? await bcrypt.hash(updateUserDto.password, 10) 
            : currentUser.password,
          name: updateUserDto.name || currentUser.name
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
  
      return updatedUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
      }
      throw error;
    }
  }

  async updateUserStatus(params: { id: number}) {
    const { id } = params;
    const user = await this.userCoreService.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.userCoreService.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
    });

    return updatedUser;
  }
}