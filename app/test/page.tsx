export default function Test() {


    const print = () => {
        
        const arr = ["a", "b", "c", "d"]

        
        return `og: ${JSON.stringify(arr)} new: ${JSON.stringify(arr.slice(0, -1))}`
    }

    return (
        <div>
            Test Page
            {print()}
        </div>
    )
}