 import React from "react";
   import { useSelector } from "react-redux";
import ContactsTable from "./ContactsTable";
 
   

   const Contacts = () => {
     const token = useSelector((state) => state.auth.token);

     return (
       //className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500"
       <div className="w-full overflow-y-auto">
         <ContactsTable token={token} />
       </div>
     );
   };

   export default Contacts;