# Failing GitHub Action check

By default Lost Pixel does not exit the action with non-zero exit code when there is a failing lost-pixel run(differences found ❌) but you can easily configure it to do so.\
\
In [lostpixel.config.js|ts](../setup/project-configuration.md) just add the following config value:

```
...
failOnDifference: true,
...
```
