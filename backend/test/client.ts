import { app } from '@/app';

import { TestClient } from './utils/http-client';

export const client = new TestClient(app.handle);
