import React, { useState } from "react";
import { signOutUser } from "./Functions";

// TODO: [] move adminUsers to env
// TODO: [] clean up config functions

// creating useContext content
const AuthContext = React.createContext({
    authID: "",
    accessToken: "",
    displayName: "",
    email: "",
    isLoggedIn: false,
    isAdmin: false,
    login: (accessToken: string, authID:string, displayName:string, email:string) => {},
    logout: () => {},
    configuration: {} as Record<string, any>,
    setCurrentConfig: (newConfig:any, newConfigID: number) => {},
    currentConfigID: -1
});

export const AuthContextProvider = (props:any) => {

    // if values don't exist in local storage, setting null values
    if (localStorage.getItem("accessToken") === null) {
        localStorage.setItem("accessToken", "");
        localStorage.setItem('authID',"");
        localStorage.setItem("displayName", "");
        localStorage.setItem('email', "");
        localStorage.setItem('config', JSON.stringify({}))
        localStorage.setItem("currentConfigID", "-1")
    }

    // TODO: CHANGE THIS
    const adminUsers = ["KRDSBfzWrbd4YNP361NU33WT3lJ3"]

    // To give a user admin access
    const assignAdmin = (uid: string) => {
        // check if admin
        for(var i in adminUsers){
            if(adminUsers[i] === uid){
                return true
            }
        }
        return false
    }
    
    // getting values from localStorage
    const initialAccessToken:string = localStorage.getItem("accessToken")!;
    const initialAuthID:string = localStorage.getItem("authID")!;
    const initialDisplayName:string = localStorage.getItem("displayName")!;
    const initialEmail:string = localStorage.getItem("email")!;
    const currentConfig:any = localStorage.getItem("config")!;
    const ccID:any = localStorage.getItem("currentConfigID")

    const [accessToken, setAccessToken] = useState<string>(initialAccessToken);
    const [authID, setAuthID] = useState<string>(initialAuthID);
    const [displayName, setDisplayName] = useState<string>(initialDisplayName);
    const [email, setEmail] = useState<string>(initialEmail);
    const [admin, setAdmin] = useState<boolean>(assignAdmin(authID));
    const [config, setConfig] = useState<any>(JSON.parse(currentConfig));
    const [currentConfigurationID, setCurrentConfigurationID] = useState<number>(Number(ccID))

    // to check if user is logged in
    const userIsLoggedIn = () => {
        if(accessToken === ""){ return false ; }
        return true;
    };

    // setting config
    const configHandle = (newConfig:any, newConfigID: number) => {
        localStorage.setItem("config", JSON.stringify(newConfig));
        localStorage.setItem("currentConfigID", String(newConfigID));
        setConfig(newConfig);
        setCurrentConfigurationID(newConfigID);
    }

    // to log a user in
    const loginHandler = (token:string, authID:string, displayName:string, email:string) => {
        setAccessToken(token);
        setAuthID(authID);
        setDisplayName(displayName);
        setEmail(email);
        setAdmin(assignAdmin(authID))
        localStorage.setItem("accessToken", token);
        localStorage.setItem("authID", authID);
        localStorage.setItem("displayName", displayName);
        localStorage.setItem("email", email);
    };

    // to log a user out
    const logoutHandler = () => {
        signOutUser();
        setAccessToken("");
        setAuthID("");
        setDisplayName("");
        setEmail("");
        setAdmin(false);
        localStorage.setItem("accessToken", "");
        localStorage.setItem("authID", "");
        localStorage.setItem("displayName","");
        localStorage.setItem("email", "");
    };

    // setting context details
    const contextValue = {
        authID: authID,
        accessToken: accessToken,
        displayName: displayName,
        email: email,
        isAdmin: admin,
        isLoggedIn: userIsLoggedIn(),
        login: loginHandler,
        logout: logoutHandler,
        configuration: config,
        setCurrentConfig: configHandle,
        currentConfigID: currentConfigurationID
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
