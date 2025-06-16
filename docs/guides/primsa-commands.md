``` markdown   
   2.3. Configure the Prisma Client generator
Now, run the following command to create the database tables and generate the Prisma Client:
    pnpm dlx prisma migrate dev --name init
```
To run a TypeScript script like `prisma/seed.ts` using `tsx` with pnpm—the equivalent of `npx tsx prisma/seed.ts`—you have two main options:

## 1. Direct Command

If you have `tsx` installed as a dev dependency (`pnpm add -D tsx`), you can run:

```
pnpm tsx prisma/seed.ts
```
This is the direct pnpm equivalent of `npx tsx prisma/seed.ts`[3][4].

## 2. Using `pnpm dlx`

If you don't have `tsx` installed locally, you can use `pnpm dlx` (similar to `npx`):

```
pnpm dlx tsx prisma/seed.ts
```
This will download and run `tsx` just for this command[1].

## 3. In `package.json` Scripts

You can also add a script to your `package.json`:

```json
"scripts": {
  "seed": "tsx prisma/seed.ts"
}
```
Then run:

```
pnpm run seed
```
This is a clean and repeatable way to manage the command[3][4].

---

### Summary Table

| npx (npm)                  | pnpm equivalent                   |
|----------------------------|-----------------------------------|
| npx tsx prisma/seed.ts     | pnpm tsx prisma/seed.ts           |
|                            | pnpm dlx tsx prisma/seed.ts       |

Both approaches are valid; use `pnpm tsx` if you have `tsx` installed locally, or `pnpm dlx tsx` if you want a one-off run without installing it[3][4][1].
