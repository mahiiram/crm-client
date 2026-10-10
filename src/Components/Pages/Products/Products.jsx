import { useSelector } from "react-redux";
import ProductTable from "./ProductTable";

export default function Products() {
  const token = useSelector((state) => state.auth.token);
  return <ProductTable token={token} />;
}
