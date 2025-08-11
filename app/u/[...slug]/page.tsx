export default async function PathPage({
    params,
}: {
    params: Promise<{ slug: string[] }>
}) {
    const { slug } = await params
    return <div>My Post: {slug.join('/')}</div>
}