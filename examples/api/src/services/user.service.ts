import { Service, v } from '@baguettejs/core';
import type { Schema } from '@baguettejs/core';

export type User = {
    id: number;
    name: string;
    email: string;
};

export const UserInputSchema: Schema<Omit<User, 'id'>> = v.object({
    name: v.string({ minLength: 2, trim: true }),
    email: v.string({ format: 'email', trim: true, lowercase: true }),
});

export const UserPatchSchema: Schema<Partial<Omit<User, 'id'>>> = v.object({
    name: v.string({ minLength: 2, trim: true }).optional(),
    email: v.string({ format: 'email', trim: true, lowercase: true }).optional(),
});

@Service()
export class UserService {
    private nextId = 3;
    private readonly users: User[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
    ];

    list(search?: string): User[] {
        if (!search) return this.users;
        const term = search.toLowerCase();
        return this.users.filter((user) =>
            user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
        );
    }

    findById(id: number): User | undefined {
        return this.users.find((user) => user.id === id);
    }

    create(input: Omit<User, 'id'>): User {
        const user = { id: this.nextId++, ...input };
        this.users.push(user);
        return user;
    }

    update(id: number, input: Partial<Omit<User, 'id'>>): User | undefined {
        const user = this.findById(id);
        if (!user) return undefined;
        Object.assign(user, input);
        return user;
    }

    remove(id: number): boolean {
        const index = this.users.findIndex((user) => user.id === id);
        if (index === -1) return false;
        this.users.splice(index, 1);
        return true;
    }
}
