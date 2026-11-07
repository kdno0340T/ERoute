"use client";
import{ createcontext, usestate } from "react";

export const UserContext = createcontext();
export default function Userprovider ({ children }) {
    const [name, setname] = usestate("srinivas");
    return (
        <userContext.Provider value={{ name, setname }}>
            {children}
        </userContext.Provider>
    );
}