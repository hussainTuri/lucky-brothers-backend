import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { response } from './lib/response';
import indexRouter from './routes/index';
import "./instrument";
import * as Sentry from "@sentry/node";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRouter);

// Add this after all routes,
// but before any and other error-handling middlewares are defined
Sentry.setupExpressErrorHandler(app);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  resp.success = false;

  console.error(err);

  if (app.get('env') !== 'production') {
    resp.message = err.message || 'Something went wrong!';
    resp.data = (err.stack || err || null) as any;
  } else {
    resp.message = 'Internal error occurred!';
  }

  res.status(500).json(resp);
});

// catch 404
app.use((req, res, next) => {
  const resp = response();
  resp.success = false;
  resp.message = 'Route not found!';

  res.status(404).json(resp);
});

const port = process.env.PORT || 3001;
app.set('port', port);
app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
