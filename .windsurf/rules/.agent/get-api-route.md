---
trigger: model_decision
description: Guidelines for implementing GET API routes in Next.js
globs: 
---
---
description: Guidelines for implementing GET API routes in Next.js
globs: 
alwaysApply: false
---
# GET API Route Guidelines

Guidelines for implementing GET API routes in Next.js App Router:

Basic Structure. Note how we auto generate the response type for use on the client:

```typescript
import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { withAuth } from "@/utils/middleware";

export type GetExampleResponse = Awaited<ReturnType<typeof getData>>;

export const GET = withAuth(async () => {
  const emailAccountId = request.auth.emailAccountId;
  

  const result = getData({ email });
  return NextResponse.json(result);
});

async function getData({ email }: { email: string }) {
  const items = await prisma.example.findMany({
    where: { email },
  });

  return { items };
}
```

See [data-fetching.mdc](mdc:.cursor/rules/data-flow.mdc) as to how this would be then used on the client.

Key Requirements:

   - Always wrap the handler with `withAuth` for consistent error handling and authentication.
   - We don't need try/catch as `withAuth` handles that.
   - Infer and export response type.
   - Use Prisma for database queries.
   - Return responses using `NextResponse.json()`