/**
 * Background Tasks Implementation
 * Inspired by Starlette's background task processing
 * @see https://github.com/encode/starlette/blob/master/starlette/background.py
 */

import { Elysia } from 'elysia';

export interface IBackgroundTask {
    run(): Promise<void>;
}

// biome-ignore lint/suspicious/noExplicitAny: Allow adding function with any arguments
const isAsyncFunction = <P extends any[]>(
    // biome-ignore lint/suspicious/noExplicitAny: Allow adding function with any return type
    func: (...args: P[]) => any,
): boolean => func.constructor.name === 'AsyncFunction';

// biome-ignore lint/suspicious/noExplicitAny: Allow adding function with any arguments
type TaskFunction<P extends any[]> = (...args: P) => void | Promise<void>;

// biome-ignore lint/suspicious/noExplicitAny: Allow adding tasks with any arguments
export class BackgroundTask<P extends any[]> implements IBackgroundTask {
    private readonly func: TaskFunction<P>;
    private readonly args: P;
    private readonly isAsync: boolean;

    constructor(func: TaskFunction<P>, ...args: P) {
        this.func = func;
        this.args = args;
        this.isAsync = isAsyncFunction(func);
    }

    async run(): Promise<void> {
        if (this.isAsync) {
            await this.func(...this.args);
        } else {
            throw new Error(
                'Background task does not support synchronous functions. Please use async functions.',
            );
            // NOTE: I'm not sure how to run a synchronous function in the background
            // without blocking the main thread. I tried using The Worker API but it
            // doesn't seem to work with synchronous functions.
            // Reference: https://bun.sh/docs/api/workers
        }
    }
}

export class BackgroundTasks implements IBackgroundTask {
    // biome-ignore lint/suspicious/noExplicitAny:Allow adding tasks with any arguments
    private readonly tasks: BackgroundTask<any[]>[];

    // biome-ignore lint/suspicious/noExplicitAny: Allow adding tasks with any arguments
    constructor(tasks: BackgroundTask<any[]>[] = []) {
        this.tasks = tasks;
        // this.tasks = [...tasks];
    }

    // biome-ignore lint/suspicious/noExplicitAny: Allow adding tasks with any arguments
    addTask<P extends any[]>(func: TaskFunction<P>, ...args: P): void {
        const task = new BackgroundTask(func, ...args);
        this.tasks.push(task);
    }

    async run(): Promise<void> {
        // await Promise.all(this.tasks.map((task) => task.run()));
        for (const task of this.tasks) {
            await task.run();
        }
    }
}

export const BackgroundTasksPlugin = new Elysia({ name: 'background-tasks' })
    .derive(() => ({
        backgroundTasks: new BackgroundTasks(),
    }))
    .onAfterResponse(({ backgroundTasks }) => {
        backgroundTasks.run().catch((e) => {
            const error = e instanceof Error ? e.stack : e;
            const now = new Date().toISOString();
            console.error(`elysia-background-tasks: ${now} - ${error}`);
        });
    })
    .as('plugin');
