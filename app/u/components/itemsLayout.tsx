import { listFolderContents } from "../actions";
import Item from "./item";



export default async function ItemsLayout() {

    const loadContents = async () => {
        const { contents } = await listFolderContents([]);
        return contents;
    }

    const contents = await loadContents();

    return (
        <div>
            {contents.map((content, index) => (
                <Item key={index} item={content} />
            ))}
        </div>
    )
}