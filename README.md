# Welcome to OnlyPaws 👋

### Creating ios build
```bash
npx expo prebuild --platform ios
npx expo run:ios
```

### Creating android build
```bash
npx expo prebuild --platform android
npx expo run:android --device
```

### Run dev client
```bash
npx expo start --dev-client  
```

### Run dev client during testing
#### --no-dev prevents the splash screen warning from blocking the tabs
#### --minify minifies the app code
```bash
npx expo start --no-dev --dev-client
npx expo start --no-dev --minify --dev-client 
```

### Running tests
```bash
maestro test e2e/
```

### Help writing tests with maestro studio
```bash
maestro studio 
```

### Creating EAS Development Build
```bash
eas build --profile development --platform ios --message "With react content loader."
```
