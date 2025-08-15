import { listFolderContents, validatePath } from "../actions";
import AddContent from "../components/addContent"
import ItemsLayout from "../components/itemsLayout";

export default async function PathPage({
    params,
}: {
    params: Promise<{ slug: string[] }>
}) {
    const { slug } = await params
    const { contents } = await listFolderContents(slug);
    const { valid, type } = await validatePath(slug);

    return (
        <div>
            <AddContent location={slug} />
            <ItemsLayout className="mt-6" contents={contents} />
            <div>{JSON.stringify(slug)}</div>
            <div>{`Valid: ${valid} Type: ${type}`}</div>
        </div>
    )
}