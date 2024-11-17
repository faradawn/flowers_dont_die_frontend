```bash

heroku config:set NPM_CONFIG_PRODUCTION=false
```

# How to test deployment
```bash
npx expo export
npx serve -s dist
```

# How to push
```bash
git add .
git commit -m "commit message"
git push heroku main #if not main, merge locally and then push from main.
```
