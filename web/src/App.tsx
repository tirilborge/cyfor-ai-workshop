import { type FormEvent, useState } from "react";
import {
  getGetItemsQueryKey,
  useDeleteItemsId,
  useGetItems,
  usePostItems,
  usePutItemsId,
} from "./api";
import type { Item } from "./api";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["general", "meeting", "equipment", "room", "other"] as const;

function EditResourceForm({
  resource,
  onCancel,
  onSaved,
}: {
  resource: Item;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);
  const [category, setCategory] = useState(resource.category);

  const updateMutation = usePutItemsId({
    mutation: { onSuccess: onSaved },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || updateMutation.isPending) return;
    updateMutation.mutate({
      id: resource.id,
      data: { title: title.trim(), description: description.trim(), category },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-md border border-pink-200 bg-pink-50 p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        maxLength={120}
        className="rounded-md border border-pink-300 px-3 py-1.5 text-sm outline-none focus:border-pink-500"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        maxLength={500}
        rows={2}
        className="rounded-md border border-pink-300 px-3 py-1.5 text-sm outline-none focus:border-pink-500"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-md border border-pink-300 px-3 py-1.5 text-sm outline-none focus:border-pink-500"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!title.trim() || updateMutation.isPending}
          className="rounded-md bg-pink-600 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-pink-300"
        >
          {updateMutation.isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-pink-300 px-3 py-1 text-sm text-pink-700"
        >
          Cancel
        </button>
      </div>
      {updateMutation.isError && (
        <p className="text-sm text-rose-600">Could not update: {updateMutation.error.message}</p>
      )}
    </form>
  );
}

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();
  const refreshItems = () =>
    queryClient.invalidateQueries({ queryKey: ["/items"] });
  const itemsQuery = useGetItems(search ? { search } : undefined);
  const createItemMutation = usePostItems({
    mutation: {
      onSuccess: async () => {
        setTitle("");
        setDescription("");
        setCategory("general");
        await refreshItems();
      },
    },
  });
  const deleteItemMutation = useDeleteItemsId({
    mutation: {
      onSuccess: refreshItems,
    },
  });

  const trimmedTitle = title.trim();
  const items = itemsQuery.data?.items ?? [];
  const deletingItemId = deleteItemMutation.variables?.id;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedTitle || createItemMutation.isPending) {
      return;
    }

    createItemMutation.mutate({
      data: {
        title: trimmedTitle,
        description: description.trim(),
        category,
      },
    });
  };

  const handleRemove = (id: number) => {
    if (deleteItemMutation.isPending) {
      return;
    }

    deleteItemMutation.mutate({ id });
  };

  return (
    <main className="min-h-screen bg-pink-50 px-4 py-10 text-pink-950">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-pink-900">Resources</h1>
          <p className="text-sm text-pink-600">
            Manage your resources – add, edit, and remove them as needed.
          </p>
        </header>

        <form
          className="flex flex-col gap-3 rounded-lg border border-pink-200 bg-white p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Resource title"
            maxLength={120}
            className="rounded-md border border-pink-300 px-3 py-2 text-base outline-none focus:border-pink-500"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description (optional)"
            maxLength={500}
            rows={2}
            className="rounded-md border border-pink-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="flex-1 rounded-md border border-pink-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!trimmedTitle || createItemMutation.isPending}
              className="rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-pink-300"
            >
              {createItemMutation.isPending ? "Adding..." : "Add resource"}
            </button>
          </div>
        </form>

        {createItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not add the resource: {createItemMutation.error.message}
          </p>
        ) : null}

        {deleteItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not remove the resource: {deleteItemMutation.error.message}
          </p>
        ) : null}

        <section className="rounded-lg border border-pink-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-pink-700">Resources</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-60 rounded-md border border-pink-300 px-3 py-1.5 text-sm outline-none focus:border-pink-500"
            />
          </div>

          {itemsQuery.isPending ? <p className="mt-3 text-sm text-pink-600">Loading resources...</p> : null}

          {itemsQuery.isError ? (
            <p className="mt-3 text-sm text-rose-600">Could not load resources: {itemsQuery.error.message}</p>
          ) : null}

          {!itemsQuery.isPending && !itemsQuery.isError ? (
            items.length > 0 ? (
              <ul className="mt-3 divide-y divide-pink-200">
                {items.map((item) => (
                  <li key={item.id} className="py-3">
                    {editingId === item.id ? (
                      <EditResourceForm
                        resource={item}
                        onCancel={() => setEditingId(null)}
                        onSaved={() => {
                          setEditingId(null);
                          refreshItems();
                        }}
                      />
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.title}</span>
                            <span className="inline-block rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-600">
                              {item.category}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-1 text-sm text-pink-400">{item.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(item.id)}
                            className="rounded-md border border-pink-300 px-3 py-1 text-sm text-pink-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            disabled={deleteItemMutation.isPending}
                            className="rounded-md border border-pink-300 px-3 py-1 text-sm text-pink-700 disabled:cursor-not-allowed disabled:border-pink-200 disabled:text-pink-400"
                          >
                            {deleteItemMutation.isPending && deletingItemId === item.id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-pink-600">No resources yet.</p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
