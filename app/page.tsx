'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Function to create a new note
  const createNewNote = async () => {
    try {
      setIsCreating(true);

      // Call the API to create a new note
      const response = await fetch('/api/notes/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create new note');
      }

      const data = await response.json();

      if (data.success && data.noteId) {
        // Redirect to the new note
        router.push(`/notes/${data.noteId}`);
      } else {
        console.error('Failed to create note:', data.message);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <button
          onClick={createNewNote}
          disabled={isCreating}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : 'Create a new note'}
        </button>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
