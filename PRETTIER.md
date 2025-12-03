# Prettier Configuration Guide

This document explains how to use Prettier for code formatting in both the frontend and backend projects.

## 📋 Available Scripts

### Frontend (Next.js)

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

### Backend (NestJS)

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

## 🎨 Configuration

### Frontend (.prettierrc)

- **Semi**: true (use semicolons)
- **Single Quote**: false (use double quotes)
- **Print Width**: 80 characters
- **Tab Width**: 2 spaces
- **Trailing Comma**: es5
- **Arrow Parens**: always

### Backend (.prettierrc)

- **Semi**: true (use semicolons)
- **Single Quote**: true (use single quotes)
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Trailing Comma**: all
- **Arrow Parens**: always

## 🚀 Usage

### Format entire project

**Frontend:**

```bash
cd frontend
npm run format
```

**Backend:**

```bash
cd backend
npm run format
```

### Check formatting (CI/CD)

Use `format:check` in your CI/CD pipeline to ensure code is properly formatted:

```bash
npm run format:check
```

This will exit with an error code if any files are not formatted correctly.

### Format specific files

You can also run Prettier directly on specific files:

```bash
# Frontend
npx prettier --write "app/**/*.tsx"

# Backend
npx prettier --write "src/modules/**/*.ts"
```

## 🔧 IDE Integration

### VS Code

1. Install the Prettier extension: `esbenp.prettier-vscode`
2. Add to your `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### WebStorm / IntelliJ IDEA

1. Go to Settings → Languages & Frameworks → JavaScript → Prettier
2. Check "On save" and "On Reformat Code"
3. Set Prettier package path to `node_modules/prettier`

## 📝 Ignored Files

Both projects have `.prettierignore` files that exclude:

- `node_modules`
- Build outputs (`dist`, `.next`, `out`)
- Environment files
- Lock files
- Cache directories

## 💡 Tips

1. **Run before committing**: Always run `npm run format` before committing code
2. **Use format:check in CI**: Add `npm run format:check` to your CI pipeline
3. **Consistent formatting**: Prettier ensures consistent code style across the team
4. **Combine with ESLint**: Prettier handles formatting, ESLint handles code quality

## 🔄 Integration with Git Hooks (Optional)

You can use `husky` and `lint-staged` to automatically format code before commits:

```bash
npm install --save-dev husky lint-staged
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,md}": "prettier --write"
  }
}
```

## 📚 Resources

- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Editor Integration](https://prettier.io/docs/en/editors.html)
