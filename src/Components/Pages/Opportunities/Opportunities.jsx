import { useSelector } from "react-redux";
import OpportunityTable from "./OpportunityTable";

export default function Opportunities() {
  const token = useSelector((state) => state.auth.token);
  return <OpportunityTable token={token} />;
}
