/** Placeholder page for specific Goal */
export default async function GoalIdPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  return <div>Goal Page for ID: {goalId}</div>;
}
