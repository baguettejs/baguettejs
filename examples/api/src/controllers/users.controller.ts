import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundError,
    Param,
    Patch,
    Post,
    Query,
    v,
} from '@baguettejs/core';
import {
    UserInputSchema,
    UserPatchSchema,
    UserService,
} from '../services/user.service';
import type { User } from '../services/user.service';

const userIdSchema = v.coerce.integer({ minimum: 1 });

@Controller('/users')
export class UsersController {
    constructor(private readonly users: UserService) {}

    @Get('/', {
        summary: 'List users',
        tags: ['Users'],
        response: { description: 'Users list' },
    })
    list(@Query('q') search?: string): { data: User[]; count: number } {
        const data = this.users.list(search);
        return { data, count: data.length };
    }

    @Get('/:id', {
        summary: 'Get one user',
        tags: ['Users'],
        response: { description: 'User found' },
        responses: { 404: { description: 'User not found' } },
    })
    findOne(@Param('id') rawId: string): User {
        const user = this.users.findById(userIdSchema.parse(rawId));
        if (!user) throw new NotFoundError('User not found');
        return user;
    }

    @Post('/', {
        summary: 'Create a user',
        tags: ['Users'],
        response: { description: 'User created' },
    })
    create(@Body() body: Omit<User, 'id'>): User {
        return this.users.create(UserInputSchema.parse(body));
    }

    @Patch('/:id', {
        summary: 'Update a user',
        tags: ['Users'],
        response: { description: 'User updated' },
        responses: { 404: { description: 'User not found' } },
    })
    update(@Param('id') rawId: string, @Body() body: Partial<Omit<User, 'id'>>): User {
        const user = this.users.update(userIdSchema.parse(rawId), UserPatchSchema.parse(body));
        if (!user) throw new NotFoundError('User not found');
        return user;
    }

    @Delete('/:id', {
        summary: 'Delete a user',
        tags: ['Users'],
        responses: { 404: { description: 'User not found' } },
    })
    remove(@Param('id') rawId: string) {
        if (!this.users.remove(userIdSchema.parse(rawId))) throw new NotFoundError('User not found');
    }
}
