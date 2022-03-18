const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const routesUser = require('./routes/users');
const routerCard = require('./routes/cards');
const { NotFoundErr } = require('./errors');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/Logger');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const YOUR_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjMzNWQ4MWM4Y2ZmZjFmNWE1NmJjZDAiLCJpYXQiOjE2NDc2Mjc3NDksImV4cCI6MTY0ODIzMjU0OX0.6C6g4PSSv9U9WMAEGDx2ME2UPcjCVQj5BQWwhltJVuM'; // вставьте сюда JWT, который вернул публичный сервер студента
const SECRET_KEY_DEV  = 'dev-secret'; // вставьте сюда секретный ключ для разработки из кода студента
try {
const payload = jwt.verify(YOUR_JWT, SECRET_KEY_DEV);
console.log('\x1b[31m%s\x1b[0m', `
Надо исправить. В продакшне используется тот же
секретный ключ, что и в режиме разработки.
`);
} catch (err) {
if (err.name === 'JsonWebTokenError' && err.message === 'invalid signature') {
console.log(
'\x1b[32m%s\x1b[0m',
'Всё в порядке. Секретные ключи отличаются'
);
} else {
console.log(
'\x1b[33m%s\x1b[0m',
'Что-то не так',
err
);
}
};

const { PORT = 3000 } = process.env;

const app = express();
app.use(cors());

app.use(express.json());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(routesUser);

app.use(routerCard);

app.use(auth);

app.use((req, res, next) => {
  next(new NotFoundErr('Не корректный URL'));
});

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(errorLogger);

app.use(errors());
// здесь обрабатываем все ошибки
app.use((err, req, res, next) => {
//  console.log(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ошибка на стороне сервера';
  res.status(statusCode).send({ message });
  //  res.status(500).send({ message: 'На сервере произошла ошибка' });

  next();
});

app.listen(PORT);
