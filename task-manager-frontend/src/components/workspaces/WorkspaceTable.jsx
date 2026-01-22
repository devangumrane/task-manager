/* eslint-disable react/prop-types */

export default function WorkspaceTable({ workspaces, isLoading, onRowClick }) {
  // Normalize workspaces to ALWAYS be an array
  const items = Array.isArray(workspaces) ? workspaces : [];

  return (
    <div className="border rounded-lg overflow-hidden bg-card text-card-foreground">
      <table className="min-w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Name</th>
            <th className="px-4 py-2 text-left font-medium">Created</th>
            <th className="px-4 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <LoadingRows />
          ) : items.length === 0 ? (
            <EmptyRow />
          ) : (
            items.map((ws) => (
              <tr
                key={ws.id}
                className="border-t hover:bg-muted/60 transition cursor-pointer"
                onClick={() => onRowClick?.(ws)}
              >
                {/* NAME */}
                <td className="px-4 py-2 font-medium">{ws.name}</td>

                {/* CREATED DATE */}
                <td className="px-4 py-2">
                  {ws.createdAt
                    ? new Date(ws.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    className="text-xs px-3 py-1 rounded border hover:bg-accent transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(ws);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <tr key={i} className="border-t">
          <td className="px-4 py-3">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3 text-right">
            <div className="h-4 w-16 animate-pulse rounded bg-muted inline-block" />
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyRow() {
  return (
    <tr className="border-t">
      <td
        colSpan={3}
        className="px-4 py-6 text-center text-muted-foreground"
      >
        No workspaces yet. Create your first one.
      </td>
    </tr>
  );
}
