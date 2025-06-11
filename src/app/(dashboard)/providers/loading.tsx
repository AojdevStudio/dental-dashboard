export default function Loading() {
  return (
    <div class="p-6">
      <div class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-1/4 mb-4" />
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded" />
          <div class="h-4 bg-gray-200 rounded w-5/6" />
          <div class="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}
