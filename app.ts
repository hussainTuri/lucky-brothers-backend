import experss, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { response } from './lib/response';
import indexRouter from './routes/index';

const app: Express = experss();

app.use(cors());
app.use(experss.json());
app.use(experss.urlencoded({ extended: true }));

app.use('/api', indexRouter);

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
  resp.message = 'Route not found!!!!';

  res.status(404).json(resp);
});

const port = 3001;
app.set('port', port);
app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
