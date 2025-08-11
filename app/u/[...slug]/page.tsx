import AddContent from "../components/addContent"

export default async function PathPage({
    params,
}: {
    params: Promise<{ slug: string[] }>
}) {
    const { slug } = await params
    return (
        <div>
            <AddContent location={slug} />
            <div className="mt-8">My Post: {slug.join('/')}</div>
            <div className="mt-8">Slug: {JSON.stringify(slug)}</div>
        </div>
    )
}