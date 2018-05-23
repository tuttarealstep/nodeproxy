# NodeProxy

A simple SOCKS5 proxy made in javascript

- [Run the app](#run-the-app)
- [Config options](#config-options)

## Run the app
```sh
$ npm start
```

## Config options
This is the current default config:

```json
{
  "port": 3000,
  "authenticationUsernamePasswordRequired": false,
  "authentication" : {
    "username": "test",
    "password": "123456"
  },
  "disableOutput": false,
  "debug": false
}
```
The `disableOutput` is field to disable the output of the logger (if set to true)
The `authenticationUsernamePasswordRequired` is a field to enable the username & password authentication.
