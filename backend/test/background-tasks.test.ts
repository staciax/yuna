import { describe, expect, it } from 'bun:test';

import { Elysia } from 'elysia';

import { backgroundTasksPlugin } from '@/background-tasks';

import { get } from './utils/utils';

describe('BackgroundTasks', () => {
    it('async task', async () => {
        let TASK_COMPLETE = false;

        const async_task = async () => {
            TASK_COMPLETE = true;
        };

        const app = new Elysia()
            .use(backgroundTasksPlugin)
            .get('/', ({ backgroundTasks }) => {
                backgroundTasks.addTask(async_task);
                return 'task initiated';
            });

        const response = await app.handle(get('/'));
        expect(response.status).toBe(200);

        const text = await response.text();

        expect(text).toBe('task initiated');
        expect(TASK_COMPLETE).toBe(true);
    });
    // NOTE: currently, sync tasks are not supported
    // it('sync task', async () => {
    //     let TASK_COMPLETE = false;

    //     const sync_task = () => {
    //         TASK_COMPLETE = true;
    //     };

    //     const app = new Elysia()
    //         .use(BackgroundTasksPlugin)
    //         .get('/', ({ backgroundTasks }) => {
    //             backgroundTasks.addTask(sync_task);
    //             return 'task initiated';
    //         });

    //     const response = await app.handle(get('/'));

    //     expect(response.status).toBe(200);
    //     const text = await response.text();

    //     expect(text).toBe('task initiated');
    //     expect(TASK_COMPLETE).toBe(true);
    // });
    it('multiple tasks', async () => {
        let TASK_COUNTER = 0;

        // NOTE: currently, sync tasks are not supported
        const increment = async (amount: number) => {
            TASK_COUNTER += amount;
        };

        const app = new Elysia()
            .use(backgroundTasksPlugin)
            .get('/', ({ backgroundTasks }) => {
                backgroundTasks.addTask(increment, 1);
                backgroundTasks.addTask(increment, 2);
                backgroundTasks.addTask(increment, 3);
                return 'task initiated';
            });

        const response = await app.handle(get('/'));

        expect(response.status).toBe(200);
        const text = await response.text();

        expect(text).toBe('task initiated');

        // delay 100ms to allow tasks to run
        await Bun.sleep(100);

        expect(TASK_COUNTER).toBe(1 + 2 + 3);
    });
    it('multi tasks failure avoids next execution', async () => {
        let TASK_COUNTER = 0;

        // NOTE: currently, sync tasks are not supported
        const increment = async () => {
            TASK_COUNTER += 1;
            if (TASK_COUNTER === 1) {
                throw new Error('task failed');
            }
        };

        const app = new Elysia()
            .use(backgroundTasksPlugin)
            .get('/', ({ backgroundTasks }) => {
                backgroundTasks.addTask(increment);
                backgroundTasks.addTask(increment);
                return 'task initiated';
            });

        const response = await app.handle(get('/'));

        expect(response.status).toBe(200);
        const text = await response.text();

        expect(text).toBe('task initiated');

        // delay 100ms to allow tasks to run
        await Bun.sleep(100);

        expect(TASK_COUNTER).toBe(1);
    });
});
