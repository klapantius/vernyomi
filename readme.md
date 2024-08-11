# vernyomi app

## how to start

### prepare your database

The database is expected to be  a MariaDb database, something else is not supported at the moment. The application expects a database without any table for the first time. It will create the tables for itself. Therefore it is needed that the configured user has the according permissions in the database.

Either you will need a _conection.cfg_ in the _src_ folder like this
```json
{
    "DB_HOST": "localhost",
    "DB_USER": "whoever",
    "DB_PASSWORD": "******",
    "DB_NAME": "whatever"
}
```

or you have to configure the above properties as environment variables before starting the application.

### build and run the application


(It is possible to keep two sets of the above parameters as "test" and "production" properties. In this case the settings for "properties" are the default, and those of "test" will be taken if the environment variable NODE_ENV is set to 'test'.)

Build the application:

```bash
> cd <project root>
> npm install
> npm run build
```

then start with **one** of the following commands

```bash
> npm run run &
> cd src & npx ts-node index.ts
```

If the port is already in use by some zombi, then find it by running

```bash
> ps aux | grep index.js
```
(the search command will be listed too)

and use the `kill` command to terminate the process.
