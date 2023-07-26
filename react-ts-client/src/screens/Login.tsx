import { useContext } from 'react';
import AuthContext from '../Providers/Auth';
import { SignInCard } from "../Components/SignIn";
import { useToast } from '@chakra-ui/react';
import { getLoginResult } from '../Providers/Functions';
import { useLocation } from 'react-router-dom';

export const Login = () => {

    // using useContext and local Storage to login user
    const authCtx = useContext(AuthContext);
    const toast = useToast();

    // checking result of login
    const searchParams = useLocation().search;
    const successVal:any = getLoginResult(searchParams);


    // if unable to login
    if(successVal === "Login Failed"){
        toast({
            title: "Login Failed! Please use an Ashokan email.",
            position: "top",
            status: "error",
            duration: 3000,
        });
    }
    else{
        // logging in user
        try{
            authCtx.login(JSON.parse(successVal["tokens"])["accessToken"], successVal["googleId"], successVal["name"], successVal["email"]);
            toast({
                title: "Login Successful!",
                position: "top",
                status: "success",
                duration: 3000,
            });
        }
        catch(err){
            console.log(err);
        }
    }

    return (
        <div>
            <SignInCard />
        </div>
    );
};