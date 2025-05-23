// Placeholder for specific Goal API
export async function GET(request: Request, { params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  return Response.json({ message: `Get Goal ${goalId}` });
}
export async function PUT(request: Request, { params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  return Response.json({ message: `Update Goal ${goalId}` });
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const { goalId } = await params;
  return Response.json({ message: `Delete Goal ${goalId}` });
}
