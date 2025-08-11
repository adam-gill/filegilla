import AddContent from "./components/addContent";
import Info from "./components/info";
import ItemsLayout from "./components/itemsLayout";

export default function Dashboard() {


  return (
    <>
      <Info />
      <AddContent location={[]} />
      <ItemsLayout />
    </>
  );
}
