import { fetchNote } from "@/app/note/actions";
import Note from "@/app/note/components/note"

export default async function NotePage() {

  const { note } = await fetchNote();

  return (
    <>
      <Note initialNoteData={note} />
    </>
  )
}
