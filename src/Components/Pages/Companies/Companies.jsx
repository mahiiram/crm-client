import { useSelector } from "react-redux";
import CompanyTable from "./CompanyTable";

export default function Companies() {
  const token = useSelector((state) => state.auth.token);
  return <CompanyTable token={token} />;
}
