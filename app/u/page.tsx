import { listFolderContents } from "./actions";
import AddContent from "./components/addContent";
import Info from "./components/info";
import ItemsLayout from "./components/itemsLayout";

export default async function Dashboard() {

  const { contents } = await listFolderContents([]);

  return (
    <main>
      <Info />
      <AddContent location={[]} />
        <ItemsLayout className="mt-6" contents={contents} />
    </main>
  );
}
