export default function ActivityFeed({ activities }) {

  return (

    <div className="bg-white rounded-2xl border p-5">

      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Live Activity
      </h2>

      <div className="space-y-4">

        {activities.map((activity) => (

          <div
            key={activity.id}
            className="border-b pb-3"
          >

            <p className="font-medium text-gray-800">
              {activity.event_type}
            </p>

            <p className="text-sm text-gray-500">
              {activity.description}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}