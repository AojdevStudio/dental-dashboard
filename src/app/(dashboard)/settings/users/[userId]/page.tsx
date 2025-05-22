/** Placeholder page for specific User */
export default function UserIdPage({ params }: { params: { userId: string } }) {
  return <div>User Page for ID: {params.userId}</div>;
}
