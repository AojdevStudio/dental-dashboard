// Placeholder for specific Goal API
export async function GET(request: Request, { params }: { params: { goalId: string } }) {
  return Response.json({ message: `Get Goal ${params.goalId}` });
}
export async function PUT(request: Request, { params }: { params: { goalId: string } }) {
  return Response.json({ message: `Update Goal ${params.goalId}` });
}
export async function DELETE(request: Request, { params }: { params: { goalId: string } }) {
  return Response.json({ message: `Delete Goal ${params.goalId}` });
}
