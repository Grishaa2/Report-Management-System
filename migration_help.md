I am currently working on implementing the "Forgot Password" feature. I have already updated the database schema in `prisma/schema.prisma` to include a `PasswordResetToken` model.

However, I am unable to apply these changes to the database because I am not allowed to run the `pnpm prisma migrate dev` command in this environment. This command is essential to update the database schema.

To proceed, I need someone with the necessary permissions to run the following command in the `Report-Management-System-main` directory:

```bash
pnpm prisma migrate dev --name add-password-reset-token
```

Once the migration is complete, I can continue with the implementation of the "Forgot Password" feature.
