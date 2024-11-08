const View = ({ params }: { params: { file: string } }) => {
    return (
        <>
            {"Viewing file: " + params.file}
        </>
    )
}

export default View;