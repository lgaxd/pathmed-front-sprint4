import { LoginForm } from "../components/login-form";
import background from "../assets/imgs/hospital-blur.png";
import logo80 from "../assets/imgs/logos/logo-80anos.png";

export function Login() {
    return (
        <div
            className="h-screen w-full bg-cover bg-center flex flex-col items-center justify-start"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="w-full flex justify-start p-4">
                <img
                    src={logo80}
                    alt="80 anos FMUSP"
                    className="w-20"
                />
            </div>

            <LoginForm />
        </div>
    );
}