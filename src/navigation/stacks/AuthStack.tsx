import { useIsAuthenticated, useIsNotAuthenticated } from '../../contexts/AuthContext';
import CreateAccountScreen from '../../screens/CreateAccountScreen';
import CreateAccountVerifyScreen from '../../screens/CreateAccountVerifyScreen';
import EditAccountPropertyScreen from '../../screens/EditAccountPropertyScreen';
import LoginScreen from '../../screens/LoginScreen';
import PhoneLoginScreen from '../../screens/PhoneLoginScreen';
import PhoneLoginVerifyScreen from '../../screens/PhoneLoginVerifyScreen';

export const Login = {
    if: useIsNotAuthenticated,
    screen: LoginScreen,
    options: {
        headerShown: false,
        gestureEnabled: false,
        animation: 'none',
    },
};

export const PhoneLogin = {
    if: useIsNotAuthenticated,
    screen: PhoneLoginScreen,
    options: {
        headerShown: false,
        gestureEnabled: false,
    },
};

export const PhoneLoginVerify = {
    if: useIsNotAuthenticated,
    screen: PhoneLoginVerifyScreen,
    options: {
        headerShown: false,
        gestureEnabled: false,
    },
};

export const CreateAccount = {
    if: useIsNotAuthenticated,
    screen: CreateAccountScreen,
    options: {
        headerShown: false,
    },
};

export const CreateAccountVerify = {
    if: useIsNotAuthenticated,
    screen: CreateAccountVerifyScreen,
    options: {
        headerShown: false,
    },
};

export const EditAccountProperty = {
    if: useIsAuthenticated, // o useIsNotAuthenticated, según tu caso
    screen: EditAccountPropertyScreen,
    options: {
        headerShown: false,
    },
};

export default {
    Login,
    PhoneLogin,
    PhoneLoginVerify,
    CreateAccount,
    CreateAccountVerify,
    EditAccountProperty,
};
