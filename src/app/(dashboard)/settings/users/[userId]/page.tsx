/** Placeholder page for specific User */
export default async function UserIdPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <div>User Page for ID: {userId}</div>;
}
